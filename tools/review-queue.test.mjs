import { chromium } from 'playwright';

const FILE = 'file://' + process.cwd() + '/tools/review-queue.html';
const API = 'https://eaton-ehs-api.cball8475.workers.dev';
let pass = 0, fail = 0;
const ok  = (n, c, extra='') => { c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${extra}`)); };

async function newPage(browser, routeHandler, token = 'TESTTOKEN') {
  const ctx = await browser.newContext();
  await ctx.addInitScript(t => { try { localStorage.setItem('eaton_token', t); } catch(e){} }, token);
  const page = await ctx.newPage();
  page.on('dialog', d => d.accept());
  await page.route(`${API}/**`, routeHandler);
  return { ctx, page };
}
const okRoute = (posts) => async route => {
  const r = route.request(), u = r.url();
  if (r.method() === 'GET') return route.fulfill({ status: 200, contentType:'application/json',
      body: u.includes('/health') ? JSON.stringify({version:'v3.9.4'}) : JSON.stringify({results:[]}) });
  posts.push({ url: u, body: JSON.parse(r.postData() || '{}') });
  return route.fulfill({ status: 201, contentType:'application/json',
      body: JSON.stringify({ id: 900 + posts.length, title:'x' }) });
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

/* ── 1. happy path ─────────────────────────────────────── */
console.log('\n[1] Happy path — connect, accept all, submit');
{
  const posts = [];
  const { ctx, page } = await newPage(browser, okRoute(posts));
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  ok('API pill goes green', true);

  const items = await page.locator('.item').count();
  ok(`all items rendered (${items})`, items > 50, `got ${items}`);

  await page.click('#acceptAll');
  const decided = await page.locator('.item.settled').count();
  ok(`accept-all settles items (${decided})`, decided === items, `${decided}/${items}`);

  const btn = page.locator('#btnSubmit');
  ok('submit enabled + counts', (await btn.textContent()).match(/Submit \d+ to D1/) !== null, await btn.textContent());

  await btn.click();
  await page.waitForSelector('#modal.on');
  await page.click('#btnGo');
  await page.waitForFunction(() => document.getElementById('banner').className.includes('ok') ||
                                   document.getElementById('banner').className.includes('bad'), null, {timeout:20000});
  const banner = await page.locator('#banner').textContent();
  ok('all-success banner', banner.includes('written to D1'), banner);
  ok(`POSTs fired (${posts.length})`, posts.length > 30, `${posts.length}`);

  const eps = [...new Set(posts.map(p => p.url.replace(API,'')))].sort();
  ok('hits the right endpoints', JSON.stringify(eps) === JSON.stringify(['/intel','/knowledge','/tasks']), JSON.stringify(eps));

  const t = posts.find(p => p.url.endsWith('/tasks')).body;
  ok('task payload has title+source_label+tags', !!t.title && !!t.source_label && t.tags.includes('inbox-review'), JSON.stringify(t).slice(0,160));
  ok('task enums valid', ['High','Medium','Low'].includes(t.priority) && ['mine','fyi'].includes(t.ownership), t.priority+'/'+t.ownership);

  const intel = posts.find(p => p.url.endsWith('/intel'));
  ok('intel_type from allowed list', ['relationship','political','working_style','reliability','alignment','history','strength','weakness','opportunity'].includes(intel.body.intel_type), intel.body.intel_type);

  const kn = posts.find(p => p.url.endsWith('/knowledge'));
  ok('knowledge has all 4 required fields', !!(kn.body.category && kn.body.area && kn.body.subject && kn.body.detail), JSON.stringify(kn.body).slice(0,140));

  await page.click('#btnClose');
  ok('rows marked written', (await page.locator('.item.written').count()) > 30, String(await page.locator('.item.written').count()));

  // idempotency: written rows must not re-queue
  await page.click('#acceptAll');
  ok('written rows do not re-queue', (await page.locator('#btnSubmit').textContent()).includes('API not ready') ||
      (await page.locator('#btnSubmit').isDisabled()), await page.locator('#btnSubmit').textContent());
  await ctx.close();
}

/* ── 2. HTTP 500 ───────────────────────────────────────── */
console.log('\n[2] Server returns 500 — must fail LOUDLY');
{
  const { ctx, page } = await newPage(browser, async route => {
    const r = route.request();
    if (r.method() === 'GET') return route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({results:[]}) });
    return route.fulfill({ status:500, contentType:'application/json', body: JSON.stringify({error:'D1_ERROR: no such column'}) });
  });
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  await page.click('#acceptAll'); await page.click('#btnSubmit');
  await page.waitForSelector('#modal.on'); await page.click('#btnGo');
  await page.waitForFunction(() => document.getElementById('banner').className.includes('bad'), null, {timeout:25000});
  const b = await page.locator('#banner').textContent();
  ok('banner reports failures', /\d+ written, \d+ failed/.test(b), b);
  ok('banner says NOT written', b.includes('NOT written'), b);
  const em = await page.locator('.prow em').first().textContent();
  ok('row shows HTTP status', em.includes('HTTP 500'), em);
  ok('row shows server error text', em.includes('D1_ERROR'), em);
  ok('retry button appears', await page.locator('#btnRetry').isVisible());
  await page.click('#btnClose');
  ok('items marked failed in the list', (await page.locator('.item.failed').count()) > 0, String(await page.locator('.item.failed').count()));
  const verd = await page.locator('.item.failed .verd').first().textContent();
  ok('item verdict shows FAILED + reason', verd.includes('FAILED') && verd.includes('HTTP 500'), verd);
  await ctx.close();
}

/* ── 3. 200 OK but no row id — the silent-failure trap ─── */
console.log('\n[3] HTTP 200 with no row id — must NOT count as success');
{
  const { ctx, page } = await newPage(browser, async route => {
    const r = route.request();
    if (r.method() === 'GET') return route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({results:[]}) });
    return route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({ success:true }) });
  });
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  await page.click('#acceptAll'); await page.click('#btnSubmit');
  await page.waitForSelector('#modal.on'); await page.click('#btnGo');
  await page.waitForFunction(() => document.getElementById('banner').className.includes('bad'), null, {timeout:25000});
  const em = await page.locator('.prow em').first().textContent();
  ok('2xx-without-id treated as failure', em.includes('no row id'), em);
  ok('zero rows marked written', (await page.locator('.item.written').count()) === 0, String(await page.locator('.item.written').count()));
  await ctx.close();
}

/* ── 4. network error ──────────────────────────────────── */
console.log('\n[4] Network drops mid-submit');
{
  let n = 0;
  const { ctx, page } = await newPage(browser, async route => {
    const r = route.request();
    if (r.method() === 'GET') return route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({results:[]}) });
    if (++n > 3) return route.abort('connectionrefused');
    return route.fulfill({ status:201, contentType:'application/json', body: JSON.stringify({id:n}) });
  });
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  await page.click('#acceptAll'); await page.click('#btnSubmit');
  await page.waitForSelector('#modal.on'); await page.click('#btnGo');
  await page.waitForFunction(() => document.getElementById('banner').className.includes('bad'), null, {timeout:30000});
  const em = await page.locator('.prow em').first().textContent();
  ok('network failure surfaced', em.includes('NETWORK'), em);
  ok('says nothing was written', em.includes('nothing was written'), em);
  const b = await page.locator('#banner').textContent();
  ok('partial success counted honestly', b.includes('3 written'), b);
  await ctx.close();
}

/* ── 5. 401 mid-run ────────────────────────────────────── */
console.log('\n[5] Token rejected mid-run — must stop and say so');
{
  let n = 0;
  const { ctx, page } = await newPage(browser, async route => {
    const r = route.request();
    if (r.method() === 'GET') return route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify({results:[]}) });
    if (++n > 2) return route.fulfill({ status:401, contentType:'application/json', body: JSON.stringify({error:'Unauthorized'}) });
    return route.fulfill({ status:201, contentType:'application/json', body: JSON.stringify({id:n}) });
  });
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  await page.click('#acceptAll'); await page.click('#btnSubmit');
  await page.waitForSelector('#modal.on'); await page.click('#btnGo');
  await page.waitForFunction(() => document.getElementById('banner').className.includes('bad'), null, {timeout:25000});
  const b = await page.locator('#banner').textContent();
  ok('stops the run on 401', b.includes('Run stopped after'), b);
  ok('names the never-attempted count', /\d+ rows were never attempted/.test(b), b);
  const na = await page.locator('.prow .stat.q').count();
  ok(`unattempted rows labelled (${na})`, na > 10, String(na));
  await ctx.close();
}

/* ── 6. no token at all ────────────────────────────────── */
console.log('\n[6] No token stored — prompts inline, blocks submit');
{
  const { ctx, page } = await newPage(browser, okRoute([]), '');
  await ctx.addInitScript(() => { try { localStorage.removeItem('eaton_token'); } catch(e){} });
  await page.goto(FILE);
  await page.waitForSelector('#tokenIn:visible', {timeout:8000});
  ok('token field shown', true);
  ok('submit disabled without token', await page.locator('#btnSubmit').isDisabled());
  ok('pill not green', !(await page.locator('#apiPill').textContent()).includes('OK'));
  await ctx.close();
}

/* ── 7. validation blocks bad rows ─────────────────────── */
console.log('\n[7] Missing required field is blocked before any POST');
{
  const posts = [];
  const { ctx, page } = await newPage(browser, okRoute(posts));
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  // force an intel row with an empty person name
  await page.evaluate(() => {
    const i = ITEMS.findIndex(x => x.sug && x.sug.d === 'intel');
    state['i'+i] = { d:'intel', who:'', itype:'working_style', note:'' };
    saveState(); buildFeed(); restore(); updateProgress();
  });
  const warn = await page.locator('.verd .warnf').first().textContent();
  ok('inline warning on the item', warn.includes('person name'), warn);
  await page.click('#btnSubmit'); await page.waitForSelector('#modal.on');
  const lede = await page.locator('#sheetLede').textContent();
  ok('sheet flags it as skipped', lede.includes('missing a required field'), lede);
  ok('row marked blocked', (await page.locator('.prow .stat.fail').first().textContent()) === 'blocked');
  const goTxt = await page.locator('#btnGo').textContent();
  ok('write button disabled when all rows blocked', await page.locator('#btnGo').isDisabled(), goTxt);
  ok('button explains why', goTxt.includes('fix the blocked rows'), goTxt);
  ok('blocked row never POSTed', !posts.some(p => p.url.endsWith('/intel')), 'a blank-name intel POST leaked');
  await ctx.close();
}

/* ── 8. .ics ───────────────────────────────────────────── */
console.log('\n[8] Calendar .ics export');
{
  const { ctx, page } = await newPage(browser, okRoute([]));
  await page.goto(FILE);
  await page.waitForFunction(() => document.getElementById('apiPill').textContent.includes('OK'), null, {timeout:8000});
  await page.click('#acceptAll');
  const ics = await page.evaluate(() => buildIcs());
  ok('ics generated', !!ics && ics.startsWith('BEGIN:VCALENDAR'), String(ics).slice(0,40));
  ok('has VEVENTs', (ics.match(/BEGIN:VEVENT/g)||[]).length >= 3, String((ics.match(/BEGIN:VEVENT/g)||[]).length));
  ok('timed event has DTSTART with time', /DTSTART:\d{8}T\d{6}/.test(ics));
  ok('ics closes properly', ics.trim().endsWith('END:VCALENDAR'));
  await ctx.close();
}

await browser.close();
console.log(`\n${'='.repeat(46)}\n  ${pass} passed, ${fail} failed\n${'='.repeat(46)}`);
process.exit(fail ? 1 : 0);
