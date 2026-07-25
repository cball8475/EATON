import { useState, useRef, useEffect } from "react";

// Full coaching system prompt — handles generation after diagnostic UI collects answers
const SYSTEM_PROMPT = `You are an executive coach with 15 years of experience helping mid-career professionals turn routine manager check-ins into strategic career conversations. You are direct and practical — no vague affirmations, no corporate fluff. You give people specific language and framing, not inspiration.

Your task: The user completed a diagnostic and has provided their answers. Generate their complete 1-on-1 meeting prep document immediately. Every recommendation must be specific to their situation — no generic advice.

Core principles:
- Think of 1-on-1s as internal SEO: seed your manager's mental index with specific, data-backed wins so when leadership asks "who's ready for the next level?", your name is the top result.
- NEVER assume the manager relationship is positive unless explicitly stated.
- Visibility moves must feel natural, not performative.
- Questions must be ones a thoughtful person would actually ask — not HR-handbook filler.
- The prep doc must be short enough to glance at right before walking in.

Generate exactly this format (use the numbered headers exactly as shown):

1. Meeting Type Diagnosis
[2-3 sentences: what kind of 1-on-1 this is and what it actually needs]

2. Meeting Prep Document
- Lead with: [opening framing]
- Questions to ask:
  • [question 1]
  • [question 2]
  • [question 3]
  • [question 4 if relevant]
- Visibility moves: [1-2 natural moves to make work visible without seeming like you're angling]
- Close the loop on: [one unresolved or awkward thing to address]
- Exit with: [how to end with forward momentum]

3. Landmines to Avoid
• [specific thing not to do — with brief reason]
• [specific thing not to do]
• [specific thing not to do]

4. Citation Log
These are data nuggets your manager can lift directly into a performance review or promotion conversation. Frame each one in the high-performer language the user's company actually uses.
• Nugget 1: [precise, repeatable statement tied to a real contribution]
• Nugget 2: [precise, repeatable statement]
• Nugget 3: [if applicable]

5. Post-meeting follow-up
[Brief message to send after. Skip this section entirely if it would feel forced.]`;

// 5 diagnostic questions — collected by UI before API call
const QUESTIONS = [
  "What are your manager's current top priorities or KPIs — the things they're actively being measured on or stressed about right now?",
  "What language does your company use to describe high performers? Think job levels, performance review criteria, or phrases you've heard leadership use about people who actually get promoted.",
  "What's the most recent win or contribution you're proud of — and do you know whether your manager has mentioned it to anyone above them?",
  "Has your manager gone to bat for someone else recently — a promotion push, a new assignment, a public call-out? If so, what did that look like?",
  "Last piece — tell me about your situation: your role and how long you've been in it, your relationship with your manager, what's been going on lately (wins, blockers, anything unresolved), and what you want out of this meeting."
];

// Section header color mapping
const SECTION_COLORS = {
  "1": "var(--color-text-info)",
  "2": "var(--color-text-success)",
  "3": "var(--color-text-danger)",
  "4": "var(--color-text-warning)",
  "5": "var(--color-text-secondary)"
};

// Parse API response into named sections by numbered header
function parseSections(text) {
  const parts = text.split(/(?=^\d+\.\s)/m);
  return parts
    .filter(p => p.trim())
    .map(part => {
      const lines = part.split("\n");
      const match = lines[0].match(/^(\d+)\.\s+(.+)/);
      if (!match) return null;
      return { num: match[1], title: match[2].trim(), body: lines.slice(1).join("\n").trim() };
    })
    .filter(Boolean);
}

export default function OneOnOneCoach() {
  const [phase, setPhase] = useState("intro");    // intro | chat | generating | result
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll as chat grows
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers, phase, loading]);

  // Focus input when question changes
  useEffect(() => {
    if (phase === "chat") inputRef.current?.focus();
  }, [phase, qIdx]);

  // Submit an answer; if last question, trigger API call
  const submitAnswer = async () => {
    if (!input.trim() || loading) return;
    const allAnswers = [...answers, input.trim()];
    setAnswers(allAnswers);
    setInput("");
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(i => i + 1);
    } else {
      setPhase("generating");
      await generate(allAnswers);
    }
  };

  // Build user message from all 5 answers and call Anthropic API
  const generate = async (ans) => {
    setLoading(true);
    setError("");
    const userMsg =
      `Here are my diagnostic answers:\n\n` +
      `Q1 — Manager's priorities/KPIs:\n${ans[0]}\n\n` +
      `Q2 — High-performer language at my company:\n${ans[1]}\n\n` +
      `Q3 — Most recent win:\n${ans[2]}\n\n` +
      `Q4 — Manager going to bat for others:\n${ans[3]}\n\n` +
      `Q5 — My situation (role, relationship, context, goals):\n${ans[4]}\n\n` +
      `Please generate my complete meeting prep document now.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // claude-sonnet-4-20250514 was retired 2026-06-15 (404s) — same fix
          // as worker-api.mjs v3.9.1. Keep this in sync with the worker.
          model: "claude-sonnet-5",
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`API ${res.status}: ${data.error?.message || res.statusText}`);
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      if (!text) throw new Error("Model returned an empty response — please try again.");
      // A truncated prep doc reads as a finished one — flag it instead.
      setResult(data.stop_reason === "max_tokens"
        ? text + "\n\n⚠️ [Output was cut off at the length limit — regenerate for a complete document]"
        : text);
      setPhase("result");
    } catch (e) {
      setError("Something went wrong: " + (e.message || "Please try again."));
      setPhase("chat");
      setQIdx(QUESTIONS.length - 1);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPhase("intro");
    setQIdx(0);
    setAnswers([]);
    setInput("");
    setResult("");
    setError("");
    setLoading(false);
  };

  const sections = result ? parseSections(result) : [];

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--color-background-info)",
            border: "0.5px solid var(--color-border-info)",
            padding: "3px 10px", borderRadius: "var(--border-radius-md)",
            fontSize: 11, fontWeight: 500, color: "var(--color-text-info)",
            marginBottom: 18, letterSpacing: "0.04em"
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            1-on-1 prep coach
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.25, marginBottom: 12 }}>
            Turn your next check-in into<br />a career conversation
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 28, maxWidth: 500 }}>
            Answer 5 diagnostic questions and get a personalized prep doc — built around your manager, your company's language, and your specific situation.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {[
              ["Diagnostic", "5 questions about your manager, company, and context"],
              ["Prep document", "Opening, questions to ask, visibility moves, exit strategy"],
              ["Citation log", "Repeatable language your manager can use to advocate for you"]
            ].map(([label, desc], i) => (
              <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)",
                  flexShrink: 0, marginTop: 1
                }}>{i + 1}</div>
                <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ fontWeight: 500 }}>{label}</strong>
                  <span style={{ color: "var(--color-text-secondary)" }}> — {desc}</span>
                </p>
              </div>
            ))}
          </div>

          <button onClick={() => setPhase("chat")} style={{ fontSize: 13 }}>
            Start prep ↗
          </button>
        </div>
      )}

      {/* ── DIAGNOSTIC CHAT ── */}
      {phase === "chat" && (
        <div>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 3, marginBottom: 24 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                height: 2, flex: 1, borderRadius: 1,
                background: i < qIdx
                  ? "var(--color-border-success)"
                  : i === qIdx
                    ? "var(--color-text-info)"
                    : "var(--color-border-tertiary)",
                transition: "background 0.3s"
              }} />
            ))}
          </div>

          {/* Chat history */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 16 }}>
            {answers.map((ans, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Coach question bubble */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-info)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Coach</div>
                  <div style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "2px 10px 10px 10px",
                    padding: "10px 13px", fontSize: 14, lineHeight: 1.6, maxWidth: "82%"
                  }}>
                    {QUESTIONS[i]}
                  </div>
                </div>
                {/* User answer bubble */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "var(--color-background-info)",
                    border: "0.5px solid var(--color-border-info)",
                    borderRadius: "10px 2px 10px 10px",
                    padding: "10px 13px", fontSize: 14, lineHeight: 1.6, maxWidth: "82%"
                  }}>
                    {ans}
                  </div>
                </div>
              </div>
            ))}

            {/* Active question */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-info)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Coach</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                Question {qIdx + 1} of {QUESTIONS.length}
              </div>
              <div style={{
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "2px 10px 10px 10px",
                padding: "10px 13px", fontSize: 14, lineHeight: 1.6, maxWidth: "82%"
              }}>
                {QUESTIONS[qIdx]}
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "var(--color-text-danger)", padding: "4px 0" }}>{error}</div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input box */}
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "10px 12px"
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); }}}
              placeholder="Type your answer here..."
              rows={3}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none",
                background: "transparent", fontFamily: "var(--font-sans)",
                fontSize: 14, lineHeight: 1.6, color: "var(--color-text-primary)"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                Enter to send · Shift+Enter for new line
              </span>
              <button
                onClick={submitAnswer}
                disabled={!input.trim() || loading}
                style={{ fontSize: 12, opacity: !input.trim() || loading ? 0.4 : 1 }}
              >
                {qIdx < QUESTIONS.length - 1 ? "Next →" : "Generate prep doc ↗"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATING ── */}
      {phase === "generating" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 14 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{
            width: 28, height: 28,
            border: "1.5px solid var(--color-border-tertiary)",
            borderTopColor: "var(--color-text-info)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: 0 }}>Building your prep document...</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", opacity: 0.5, margin: 0 }}>Diagnosing meeting type · Crafting questions · Building citation log</p>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === "result" && (
        <div>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, paddingBottom: 14, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 3px" }}>Your 1-on-1 prep</h2>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>Personalized · Glance at this before you walk in</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copyResult} style={{ fontSize: 12 }}>
                {copied ? "Copied ✓" : "Copy all"}
              </button>
              <button onClick={reset} style={{ fontSize: 12 }}>Start over</button>
            </div>
          </div>

          {/* Section cards — or raw fallback if parsing fails */}
          {sections.length > 0 ? sections.map((sec, i) => (
            <div key={i} style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              overflow: "hidden", marginBottom: 10
            }}>
              <div style={{
                padding: "9px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: SECTION_COLORS[sec.num] || "var(--color-text-secondary)"
                }}>
                  {sec.num}. {sec.title}
                </span>
              </div>
              <div style={{
                padding: "13px 14px", fontSize: 14, lineHeight: 1.8,
                color: "var(--color-text-secondary)", whiteSpace: "pre-wrap"
              }}>
                {sec.body}
              </div>
            </div>
          )) : (
            <div style={{
              background: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              padding: "14px", fontSize: 14, lineHeight: 1.8,
              color: "var(--color-text-secondary)", whiteSpace: "pre-wrap"
            }}>
              {result}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
