import { useState, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// Machine Method Sheet — Mobile Floor Form
// ═══════════════════════════════════════════════════════════════
// One-handed phone use on the fab floor. Persistent storage
// survives screen off / app switch / phone lock.
// "Finish" copies plain text to clipboard for pasting to Claude.
// "Save PDF" triggers print dialog for Save-as-PDF on mobile.
// ═══════════════════════════════════════════════════════════════

// ── Storage ──
// sv/ld report failure instead of swallowing it: this form's whole promise is
// "survives screen off / phone lock", and a quota error or missing storage API
// failing silently means an operator loses a full inspection with no warning.
const SK = "method-sheet-form";
async function sv(d) { try { await window.storage.set(SK, JSON.stringify(d)); return true; } catch (e) { console.error("floor-form save failed:", e); return false; } }
async function ld() {
  try {
    const r = await window.storage.get(SK);
    return { data: r ? JSON.parse(r.value) : null, error: null };
  } catch (e) {
    console.error("floor-form load failed:", e);
    return { data: null, error: e?.message || "storage unavailable" };
  }
}
async function cl() { try { await window.storage.delete(SK); return true; } catch (e) { console.error("floor-form clear failed:", e); return false; } }

// ── Clipboard fallback ──
function cpy(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(() => true).catch(() => fbCpy(text));
  return Promise.resolve(fbCpy(text));
}
function fbCpy(text) {
  const t = document.createElement("textarea"); t.value = text;
  t.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
  document.body.appendChild(t); t.focus(); t.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch {} document.body.removeChild(t); return ok;
}

// ── Wake Lock ──
let wk = null;
async function rqWk() { if ("wakeLock" in navigator) try { wk = await navigator.wakeLock.request("screen"); wk.addEventListener("release", () => { wk = null; }); } catch {} }
function rlWk() { if (wk) { wk.release(); wk = null; } }

// ── Constants ──
const MATERIALS = ["Steel", "Galvanized Steel", "Aluminum Sheet", "Copper", "Other"];
const HAZARDS = ["Pinch Point","Crush","Laceration","Burn","Electrical","Noise","Ergonomic","Chemical","Flying Debris","Struck-By","Caught-In"];
const SHIFTS = [{ l:"A", s:"Chris Miller" },{ l:"B", s:"Bruce Britton" },{ l:"C", s:"Robert Kaylor" },{ l:"D", s:"Marvin Felder" }];
const DOCS = ["Method sheet exists","LOTO procedure posted","Risk assessment on file","JHA completed","SOP available at station","WSRA completed"];
const SAFETY = ["PPE requirements posted at machine","Employees wearing correct PPE","Overall safety of employees around machine acceptable","Guards/barriers in place and functional","Emergency stop accessible and labeled"];
const PRIOS = ["Critical","High","Medium","Low"];

function defaults() {
  return {
    machineName: "", area: "steel",
    materialTabs: {}, hazards: [], hazardNotes: "",
    interviews: [{ name:"",role:"",shift:"",deviation:"",tribalKnowledge:"" }],
    supervisorLogs: [],
    docs: {}, safetyChecks: {}, safetyNotes: "",
    findings: [{ text:"",priority:"Medium",photo:false }],
    savedAt: null
  };
}

// ── Build export text ──
function buildExport(f) {
  const ln = [];
  ln.push(`MACHINE METHOD SHEET — ${f.machineName || "(unnamed)"}`);
  ln.push(`Area: ${f.area === "steel" ? "Steel Fabrication" : "Copper Fabrication"}`);
  ln.push(`Captured: ${f.savedAt ? new Date(f.savedAt).toLocaleString() : "N/A"}`);
  ln.push("");
  ln.push("── MATERIAL FLOW ──");
  for (const [mat, d] of Object.entries(f.materialTabs || {})) {
    if (d.feed || d.operation || d.output || d.notes) {
      ln.push(`  ${mat}:`);
      if (d.feed) ln.push(`    Feed: ${d.feed}`);
      if (d.operation) ln.push(`    Operation: ${d.operation}`);
      if (d.output) ln.push(`    Output: ${d.output}`);
      if (d.notes) ln.push(`    Notes: ${d.notes}`);
    }
  }
  ln.push("");
  ln.push("── HAZARDS ──");
  if (f.hazards?.length) ln.push(`  Types: ${f.hazards.join(", ")}`);
  if (f.hazardNotes) ln.push(`  Notes: ${f.hazardNotes}`);
  ln.push("");
  ln.push("── EMPLOYEE INTERVIEWS ──");
  ln.push("  (Never videoed — notes only)");
  for (const iv of (f.interviews || [])) {
    if (iv.name) {
      ln.push(`  ${iv.name} (${iv.role || "?"}, Shift ${iv.shift || "?"})`);
      if (iv.deviation) ln.push(`    Deviations: ${iv.deviation}`);
      if (iv.tribalKnowledge) ln.push(`    Tribal knowledge: ${iv.tribalKnowledge}`);
    }
  }
  ln.push("");
  ln.push("── SUPERVISOR / SHIFT LOG ──");
  for (const sl of (f.supervisorLogs || [])) {
    const sh = SHIFTS.find(s => s.l === sl.shift);
    ln.push(`  Shift ${sl.shift} (${sh?.s || "?"}): ${sl.introduced ? "Introduced ✓" : "Not yet"} ${sl.notes ? `— ${sl.notes}` : ""}`);
  }
  ln.push("");
  ln.push("── DOCUMENTATION ──");
  for (const d of DOCS) ln.push(`  [${f.docs?.[d] ? "✓" : " "}] ${d}`);
  ln.push("");
  ln.push("── PPE & SAFETY COMPLIANCE ──");
  for (const c of SAFETY) ln.push(`  [${f.safetyChecks?.[c] ? "✓" : "✗"}] ${c}`);
  if (f.safetyNotes) ln.push(`  Notes: ${f.safetyNotes}`);
  ln.push("");
  ln.push("── FINDINGS ──");
  for (const fi of (f.findings || [])) {
    if (fi.text) ln.push(`  [${fi.priority}] ${fi.text}${fi.photo ? " 📸" : ""}`);
  }
  return ln.join("\n");
}

// ── Sub-components ──
function Section({ title, tag, open, onToggle, count, children }) {
  return (
    <div className="no-break" style={{ borderRadius: 10, overflow: "hidden", marginBottom: 8, border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-primary)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-info)", background: "var(--color-background-info)", padding: "2px 7px", borderRadius: 4 }}>{tag}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span>
          {count > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", background: "var(--color-background-success)", padding: "1px 6px", borderRadius: 8 }}>{count}</span>}
        </span>
        <span style={{ fontSize: 16, color: "var(--color-text-secondary)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && <div style={{ padding: "0 14px 14px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>{children}</div>}
    </div>
  );
}

function Pills({ items, selected, onToggle, color = "info" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {items.map(item => {
        const on = selected.includes(item);
        return <button key={item} onClick={() => onToggle(item)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 16, border: `0.5px solid ${on ? `var(--color-border-${color})` : "var(--color-border-tertiary)"}`, background: on ? `var(--color-background-${color})` : "transparent", color: on ? `var(--color-text-${color})` : "var(--color-text-secondary)", fontWeight: on ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{item}</button>;
      })}
    </div>
  );
}

function Chk({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", fontSize: 14, lineHeight: 1.4, color: "var(--color-text-primary)" }}>
      <input type="checkbox" checked={!!checked} onChange={onChange} style={{ marginTop: 2, width: 18, height: 18, accentColor: "var(--color-text-success)", flexShrink: 0 }} />
      <span style={{ opacity: checked ? 0.6 : 1, textDecoration: checked ? "line-through" : "none" }}>{label}</span>
    </label>
  );
}

function Inp({ value, onChange, placeholder, multiline, label }) {
  const s = { width: "100%", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "9px 11px", fontSize: 14, fontFamily: "inherit", lineHeight: 1.5, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none", resize: "none", boxSizing: "border-box" };
  return (
    <div style={{ marginTop: 8 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
      {multiline ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} /> : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
export default function MachineMethodSheetForm() {
  const [f, setF] = useState(null);
  const [op, setOp] = useState({ "1": true });
  const [copied, setCopied] = useState(false);
  const [copyErr, setCopyErr] = useState(false);
  const [restored, setRestored] = useState(false);
  const [finished, setFinished] = useState(false);
  const [storageErr, setStorageErr] = useState(null);

  useEffect(() => { (async () => {
    const { data: s, error } = await ld();
    if (error) setStorageErr("Couldn't read the saved form (" + error + ") — starting fresh. A previous inspection may exist but be unreadable.");
    if (s?.machineName !== undefined) { setF(s); setRestored(true); setTimeout(() => setRestored(false), 3000); } else setF(defaults());
  })(); }, []);
  useEffect(() => { rqWk(); const h = () => { if (document.visibilityState === "visible") rqWk(); }; document.addEventListener("visibilitychange", h); return () => { document.removeEventListener("visibilitychange", h); rlWk(); }; }, []);
  useEffect(() => { if (f?.machineName !== undefined) (async () => {
    const ok = await sv({ ...f, savedAt: new Date().toISOString() });
    // Only touch the banner on state CHANGES so a persistent failure doesn't re-render every keystroke.
    setStorageErr(prev => {
      if (!ok) return prev && prev.startsWith("NOT SAVING") ? prev : "NOT SAVING — autosave is failing. Don't lock the phone; finish and copy your work out now.";
      return prev && prev.startsWith("NOT SAVING") ? null : prev;
    });
  })(); }, [f]);

  const u = useCallback((p) => setF(prev => ({ ...prev, ...p })), []);
  const tog = (id) => setOp(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCopy = async () => {
    const ok = await cpy(buildExport(f));
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
    else { setCopyErr(true); setTimeout(() => setCopyErr(false), 3000); }
  };
  const handleFinish = async () => { await handleCopy(); setFinished(true); };
  const handlePrint = () => window.print();
  const handleReset = async () => { if (window.confirm("Clear all form data? Can't undo.")) { const ok = await cl(); if (!ok) setStorageErr("Couldn't clear saved data — the old form may reappear next time you open this."); setF(defaults()); setOp({ "1": true }); setFinished(false); } };

  if (!f) return <div style={{ padding: "3rem 1rem", textAlign: "center" }}><p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Loading...</p></div>;

  const hzCt = f.hazards?.length || 0;
  const ivCt = (f.interviews || []).filter(i => i.name).length;
  const spCt = (f.supervisorLogs || []).filter(s => s.introduced).length;
  const dkCt = Object.values(f.docs || {}).filter(Boolean).length;
  const sfCt = Object.values(f.safetyChecks || {}).filter(Boolean).length;
  const fnCt = (f.findings || []).filter(x => x.text).length;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem 0.75rem 4rem" }}>
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          div[style*="border-radius"] { break-inside: avoid; border: 1px solid #ccc !important; }
          * { color: #000 !important; background: white !important; border-color: #ccc !important; }
          input[type="checkbox"] { accent-color: #000 !important; }
          .no-break { break-inside: avoid; }
        }
        @keyframes fadeOut { 0%{opacity:0;transform:translateX(-50%) translateY(-8px)} 15%{opacity:1;transform:translateX(-50%) translateY(0)} 75%{opacity:1} 100%{opacity:0} }
      `}</style>

      {restored && (
        <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", background: "var(--color-background-success)", border: "0.5px solid var(--color-border-success)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, color: "var(--color-text-success)", zIndex: 999, animation: "fadeOut 3s ease-in-out forwards" }}>✓ Form restored</div>
      )}

      {/* Persistent storage-failure banner — autosave failing must be louder
          than autosave working, not invisible. Stays until saves succeed. */}
      {storageErr && (
        <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 998, background: "#7f1d1d", color: "#fff", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          ⚠️ {storageErr}
        </div>
      )}

      {/* Finished overlay */}
      {finished && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "28px 24px", maxWidth: 340, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <h3 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 8px" }}>Copied to clipboard</h3>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Go back to the chat and paste it. I'll process it into your method sheet notes automatically.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={handlePrint} style={{ width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontFamily: "inherit" }}>Save as PDF for printing</button>
              <button onClick={() => setFinished(false)} style={{ width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Back to form</button>
              <button onClick={handleReset} style={{ width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 12, border: "none", background: "transparent", color: "var(--color-text-danger)", cursor: "pointer", fontFamily: "inherit", opacity: 0.7 }}>Clear form — start new machine</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-background-info)", border: "0.5px solid var(--color-border-info)", padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, color: "var(--color-text-info)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />Floor Form
          </div>
          {f.savedAt && <span className="no-print" style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Auto-saved</span>}
        </div>
        <Inp value={f.machineName} onChange={v => u({ machineName: v })} placeholder="Machine name (e.g. Trumpf Laser)" />
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {["steel","copper"].map(a => (
            <button key={a} onClick={() => u({ area: a })} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, border: `0.5px solid ${f.area===a ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`, background: f.area===a ? "var(--color-background-info)" : "transparent", color: f.area===a ? "var(--color-text-info)" : "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>{a === "steel" ? "Steel Fab" : "Copper Fab"}</button>
          ))}
        </div>
      </div>

      {/* 1: Material Flow */}
      <Section title="Material Flow" tag="1" open={op["1"]} onToggle={() => tog("1")} count={Object.values(f.materialTabs||{}).filter(m => m.feed||m.operation||m.output).length}>
        <div style={{ display: "flex", gap: 4, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
          {MATERIALS.map(mat => {
            const has = f.materialTabs?.[mat] && (f.materialTabs[mat].feed || f.materialTabs[mat].operation);
            return (
              <button key={mat} onClick={() => { const cur = f.materialTabs || {}; if (!cur[mat]) u({ materialTabs: { ...cur, [mat]: { feed:"",operation:"",output:"",notes:"" } } }); setOp(p => ({ ...p, activeMat: mat })); }}
                style={{ fontSize: 11, padding: "5px 10px", borderRadius: 14, whiteSpace: "nowrap", border: `0.5px solid ${op.activeMat===mat ? "var(--color-border-info)" : has ? "var(--color-border-success)" : "var(--color-border-tertiary)"}`, background: op.activeMat===mat ? "var(--color-background-info)" : "transparent", color: op.activeMat===mat ? "var(--color-text-info)" : has ? "var(--color-text-success)" : "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit", fontWeight: op.activeMat===mat ? 600 : 400 }}>
                {mat}{has ? " ✓" : ""}
              </button>
            );
          })}
        </div>
        {op.activeMat && f.materialTabs?.[op.activeMat] && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>{op.activeMat}</div>
            {["feed","operation","output","notes"].map(fld => (
              <Inp key={fld} label={fld} value={f.materialTabs[op.activeMat][fld]}
                onChange={v => { const t={...f.materialTabs}; t[op.activeMat]={...t[op.activeMat],[fld]:v}; u({materialTabs:t}); }}
                placeholder={fld==="feed"?"How material feeds in":fld==="operation"?"What the machine does":fld==="output"?"What comes out":"Additional notes"}
                multiline={fld==="notes"} />
            ))}
          </div>
        )}
      </Section>

      {/* 2: Hazards */}
      <Section title="Hazard Identification" tag="2" open={op["2"]} onToggle={() => tog("2")} count={hzCt}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8, marginBottom: 0 }}>Tap all that apply:</p>
        <Pills items={HAZARDS} selected={f.hazards} onToggle={h => { const c=f.hazards||[]; u({hazards: c.includes(h)?c.filter(x=>x!==h):[...c,h]}); }} color="danger" />
        <Inp value={f.hazardNotes} onChange={v => u({hazardNotes:v})} placeholder="Specific observations, locations, severity..." multiline label="Hazard notes" />
      </Section>

      {/* 3: Employee Interviews */}
      <Section title="Employee Interviews" tag="3" open={op["3"]} onToggle={() => tog("3")} count={ivCt}>
        <p style={{ fontSize: 11, color: "var(--color-text-warning)", marginTop: 8, marginBottom: 4, fontWeight: 500 }}>⚠ Never video employee interviews</p>
        {(f.interviews||[]).map((iv, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < f.interviews.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 2 }}><Inp value={iv.name} onChange={v => { const a=[...f.interviews]; a[i]={...a[i],name:v}; u({interviews:a}); }} placeholder="Name" /></div>
              <div style={{ flex: 1 }}><Inp value={iv.role} onChange={v => { const a=[...f.interviews]; a[i]={...a[i],role:v}; u({interviews:a}); }} placeholder="Role" /></div>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {SHIFTS.map(s => (
                <button key={s.l} onClick={() => { const a=[...f.interviews]; a[i]={...a[i],shift:s.l}; u({interviews:a}); }}
                  style={{ flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 12, fontWeight: 500, border: `0.5px solid ${iv.shift===s.l ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`, background: iv.shift===s.l ? "var(--color-background-info)" : "transparent", color: iv.shift===s.l ? "var(--color-text-info)" : "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>{s.l}</button>
              ))}
            </div>
            <Inp value={iv.deviation} onChange={v => { const a=[...f.interviews]; a[i]={...a[i],deviation:v}; u({interviews:a}); }} placeholder="Any deviations from SOP?" multiline label="Deviations" />
            <Inp value={iv.tribalKnowledge} onChange={v => { const a=[...f.interviews]; a[i]={...a[i],tribalKnowledge:v}; u({interviews:a}); }} placeholder="Anything not in the written procedure?" multiline label="Tribal knowledge" />
          </div>
        ))}
        <button onClick={() => u({interviews:[...f.interviews,{name:"",role:"",shift:"",deviation:"",tribalKnowledge:""}]})}
          style={{ marginTop: 8, fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>+ Add interview</button>
      </Section>

      {/* 4: Supervisor / Shift Log */}
      <Section title="Supervisor / Shift Log" tag="4" open={op["4"]} onToggle={() => tog("4")} count={spCt}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8, marginBottom: 8 }}>Tap shift to log introduction:</p>
        {SHIFTS.map(sh => {
          const log = (f.supervisorLogs||[]).find(s => s.shift === sh.l);
          return (
            <div key={sh.l} style={{ padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}><strong style={{ fontWeight: 500 }}>Shift {sh.l}</strong><span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}> — {sh.s}</span></span>
                <button onClick={() => {
                  const logs = [...(f.supervisorLogs||[])];
                  const idx = logs.findIndex(s => s.shift === sh.l);
                  if (idx >= 0) logs[idx] = { ...logs[idx], introduced: !logs[idx].introduced };
                  else logs.push({ shift: sh.l, introduced: true, notes: "" });
                  u({ supervisorLogs: logs });
                }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 12, border: `0.5px solid ${log?.introduced ? "var(--color-border-success)" : "var(--color-border-tertiary)"}`, background: log?.introduced ? "var(--color-background-success)" : "transparent", color: log?.introduced ? "var(--color-text-success)" : "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  {log?.introduced ? "Introduced ✓" : "Not yet"}
                </button>
              </div>
              {log?.introduced && (
                <Inp value={log.notes||""} onChange={v => { const logs=[...(f.supervisorLogs||[])]; const idx=logs.findIndex(s=>s.shift===sh.l); if(idx>=0) logs[idx]={...logs[idx],notes:v}; u({supervisorLogs:logs}); }} placeholder="Notes from introduction..." />
              )}
            </div>
          );
        })}
      </Section>

      {/* 5: Documentation */}
      <Section title="Documentation" tag="5" open={op["5"]} onToggle={() => tog("5")} count={dkCt}>
        <div style={{ marginTop: 4 }}>{DOCS.map(d => <Chk key={d} label={d} checked={f.docs?.[d]} onChange={() => u({docs:{...f.docs,[d]:!f.docs?.[d]}})} />)}</div>
      </Section>

      {/* 6: PPE & Safety Compliance */}
      <Section title="PPE & Safety Compliance" tag="6" open={op["6"]} onToggle={() => tog("6")} count={sfCt}>
        <div style={{ marginTop: 4 }}>{SAFETY.map(c => <Chk key={c} label={c} checked={f.safetyChecks?.[c]} onChange={() => u({safetyChecks:{...f.safetyChecks,[c]:!f.safetyChecks?.[c]}})} />)}</div>
        <Inp value={f.safetyNotes} onChange={v => u({safetyNotes:v})} placeholder="PPE gaps, unsafe conditions, corrective actions needed..." multiline label="Safety notes" />
      </Section>

      {/* 7: Findings */}
      <Section title="Findings" tag="7" open={op["7"]} onToggle={() => tog("7")} count={fnCt}>
        {(f.findings||[]).map((fi, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < f.findings.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
            <Inp value={fi.text} onChange={v => { const a=[...f.findings]; a[i]={...a[i],text:v}; u({findings:a}); }} placeholder="What did you find?" multiline />
            <div style={{ display: "flex", gap: 4, marginTop: 8, alignItems: "center" }}>
              {PRIOS.map(p => (
                <button key={p} onClick={() => { const a=[...f.findings]; a[i]={...a[i],priority:p}; u({findings:a}); }}
                  style={{ fontSize: 11, padding: "4px 8px", borderRadius: 10, border: `0.5px solid ${fi.priority===p ? (p==="Critical"?"var(--color-border-danger)":p==="High"?"var(--color-border-warning)":"var(--color-border-tertiary)") : "var(--color-border-tertiary)"}`, background: fi.priority===p ? (p==="Critical"?"var(--color-background-danger)":p==="High"?"var(--color-background-warning)":"var(--color-background-secondary)") : "transparent", color: fi.priority===p ? (p==="Critical"?"var(--color-text-danger)":p==="High"?"var(--color-text-warning)":"var(--color-text-primary)") : "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit", fontWeight: fi.priority===p ? 600 : 400 }}>{p}</button>
              ))}
              <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" checked={!!fi.photo} onChange={() => { const a=[...f.findings]; a[i]={...a[i],photo:!fi.photo}; u({findings:a}); }} style={{ width: 16, height: 16 }} />📸
              </label>
            </div>
          </div>
        ))}
        <button onClick={() => u({findings:[...f.findings,{text:"",priority:"Medium",photo:false}]})}
          style={{ marginTop: 8, fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>+ Add finding</button>
      </Section>

      {/* Action buttons */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <button onClick={handleFinish} style={{ width: "100%", padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", background: "var(--color-text-info)", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
          Finish — Copy & Share
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCopy} style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
            {copied ? "Copied ✓" : copyErr ? "Failed — select manually" : "Copy text"}
          </button>
          <button onClick={handlePrint} style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Save PDF</button>
          <button onClick={handleReset} style={{ padding: "10px 12px", borderRadius: 8, fontSize: 12, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-danger)", cursor: "pointer", fontFamily: "inherit", opacity: 0.7 }}>Clear</button>
        </div>
      </div>
    </div>
  );
}
