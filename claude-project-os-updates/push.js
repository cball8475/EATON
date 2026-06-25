// One-off push script — claude-project-os update
// Usage: GH_PAT=ghp_xxx node push.js
const fs = require('fs');
const path = require('path');

const PAT = process.env.GH_PAT;
if (!PAT) { console.error('Missing GH_PAT env var'); process.exit(1); }

const REPO = 'ballyhofam-bot/claude-project-os';
const COMMIT_MSG = 'Add Code-side templates + chat-sync bridge (sequel to original 3-layer post)';
const STAGING = 'C:/Users/Bally/projects/eaton-ehs-project/claude-project-os-updates';

const files = [
  ['README.md', 'README.md'],
  ['skills/skill-audit.md', 'skills/skill-audit.md'],
  ['code-side/README.md', 'code-side/README.md'],
  ['code-side/CLAUDE.md.example', 'code-side/CLAUDE.md.example'],
  ['code-side/infra/env.sh.example', 'code-side/infra/env.sh.example'],
  ['code-side/infra/wrangler.toml.example', 'code-side/infra/wrangler.toml.example'],
  ['code-side/infra/WORKER_ROUTES.md', 'code-side/infra/WORKER_ROUTES.md'],
  ['code-side/.claude/commands/skill-morning.md', 'code-side/.claude/commands/skill-morning.md'],
  ['chat-sync/README.md', 'chat-sync/README.md'],
];

const headers = {
  'Authorization': `token ${PAT}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'claude-code-push'
};

async function pushFile(localRel, repoPath) {
  const localPath = path.join(STAGING, localRel);
  const content = fs.readFileSync(localPath, 'utf8');
  const base64 = Buffer.from(content).toString('base64');

  // Check for existing sha
  let sha = null;
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${repoPath}`, { headers });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  } else if (getRes.status !== 404) {
    console.error(`! GET ${repoPath} → ${getRes.status}`);
    return false;
  }

  const body = { message: COMMIT_MSG, content: base64 };
  if (sha) body.sha = sha;

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${repoPath}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    console.error(`! PUT ${repoPath} → ${putRes.status} ${errText.substring(0, 200)}`);
    return false;
  }

  const result = await putRes.json();
  console.log(`✓ ${sha ? 'UPDATE' : 'CREATE'} ${repoPath} (${result.commit.sha.substring(0, 7)})`);
  return true;
}

(async () => {
  let ok = 0, fail = 0;
  for (const [localRel, repoPath] of files) {
    const success = await pushFile(localRel, repoPath);
    if (success) ok++; else fail++;
  }
  console.log(`\nDone: ${ok} pushed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
