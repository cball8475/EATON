# TI-30XS MultiView — Exam Operation and Drills

## What you'll actually have on exam day

An **on-screen software calculator that emulates the TI-30XS MultiView**. You cannot bring
your own. You will operate it with a mouse, which is slower than a keypad, so:

- **Do the algebra on the whiteboard first, then compute once.** Every extra mouse click is
  a chance to misclick, and re-entering a long expression costs more than writing it down.
- **Write intermediate results on the whiteboard.** Don't chain 8 operations in the display
  and hope.
- Practice on a physical TI-30XS anyway — key sequence and order-of-operations behavior are
  identical, and knowing where `log` and `2nd` live translates directly.

Your course requires a physical TI-30XS for the math exercises. Buy the **MultiView** model
(TI-30XS MultiView or TI-30XIIS). ~$15–20.

---

## Key sequences you must have automatic

| Task | Keystrokes |
|---|---|
| **Common log (base 10)** | `log` `(` value `)` `enter` |
| **Natural log** | `ln` `(` value `)` `enter` |
| **10 to a power** (antilog) | `2nd` `log` → `10^` |
| **e to a power** | `2nd` `ln` → `e^` |
| **Exponent / power** | base `^` exponent `enter` |
| **Square** | value `x²` |
| **Square root** | `2nd` `x²` → `√` |
| **Reciprocal** | value `x⁻¹` |
| **Scientific notation entry** | mantissa `x10ⁿ` exponent — **use this key, not `× 10 ^`** |
| **Pi** | `2nd` `^` → `π` |
| **Negative number** | `(−)` key, **not** the subtraction key |
| **Toggle exact/decimal** | `2nd` `enter` or the `◄►` toggle key |
| **Fix decimal places** | `mode` → `FLOAT` → select 0–9 |
| **Scientific notation display** | `mode` → `SCI` |
| **Degrees vs. radians** | `mode` → `DEG` (leave it in DEG for this exam) |
| **Recall last answer** | `2nd` `(−)` → `ans` |
| **Recall/edit last entry** | `▲` scrolls back through history — edit and re-enter |
| **Store to a variable** | value `sto→` `x` (or y, z, t, a, b, c) |
| **Clear entry vs. clear all** | `clear` clears the line; `2nd` `clear` clears history |

### Statistics mode

| Task | Keystrokes |
|---|---|
| Enter data | `data` → type values into L1 (use L2 for frequencies) |
| Run 1-variable stats | `2nd` `data` → `1-Var Stats` → select L1 → `calc` |
| Read results | scroll for `n`, `x̄`, **`Sx` (sample SD)**, **`σx` (population SD)**, `Σx`, `Σx²`, min, Q1, **Med**, Q3, max |
| Clear the list | `data` `data` → `CLEAR L1` |

**`Sx` vs. `σx` is the exam's statistics trap.** A "sample of 10 readings" wants `Sx`
(n − 1). "All 10 machines in the plant" wants `σx` (N).

### Combinations and permutations

`n` `prb` → select `nCr` or `nPr` → `r` → `enter`. Factorial is on the same `prb` menu.

---

## Order-of-operations behaviors that bite people

1. **The MultiView respects standard order of operations.** `2 + 3 × 4` returns `14`, not
   `20`. Use parentheses when you mean otherwise.
2. **`−3²` returns `−9`**, because the square binds tighter than the negation. If you mean
   `(−3)²`, type the parentheses.
3. **The fraction template** (`n/d` key) is genuinely useful for `(a)/(b)` expressions —
   it groups the numerator and denominator for you and prevents the single most common
   error, which is forgetting to parenthesize a denominator.
4. **`8 / 2 × 4` = 16**, not 1. Left-to-right for same-precedence operators.
5. **Never type a fraction bar as a division without parentheses around a multi-term
   denominator.** `100/2+3` is 53, not 20.

---

## Special notes for exam-specific math

**Roots other than square** — use the fractional exponent: the 5th root of 32 is
`32 ^ (1 ÷ 5)` → 2. Or use `2nd` `^` for the `ˣ√` template on MultiView.

**Exponentials with negative exponents** — `8 / 2^(-0.4)`. Type
`8 ÷ 2 ^ ( (−) 0.4 ) enter`. **Use the `(−)` key.** Using the minus key here produces a
syntax error and costs you 20 seconds of confusion under time pressure.

**Logs in noise problems** — `16.61 × log(178.9 ÷ 100) + 90`. Note the parentheses around
the whole ratio inside the log. Typing `log 178.9 ÷ 100` computes `log(178.9)/100`, which is
wrong by a factor of ~100.

**Chained multiplication in the NIOSH equation** — seven multipliers. Compute the
multipliers on the whiteboard, then enter them in one chain. Round intermediate multipliers
to **3 decimal places**; rounding to 2 will drift the answer enough to hit a wrong choice.

**Scientific notation** — use the `x10ⁿ` key. Entering `3.7 × 10 ^ 10` works, but
`3.7 x10ⁿ 10` is faster and less error-prone.

---

## 20 timed drills

Do these on the physical calculator. Target: **under 60 seconds each** once you're fluent.
Answers at the bottom.

1. A site worked 837,500 hours with 11 recordables. TRIR?
2. What is `T` for an OSHA exposure at 97 dBA?
3. Dose = 245%. OSHA TWA in dBA?
4. Three machines at 88, 91, and 85 dBA. Combined sound level?
5. A 92 dBA TWA with an NRR 29 muff, using OSHA's 50% derate. Protected level?
6. Sound level is 105 dB at 3 ft. What is it at 24 ft (point source, free field)?
7. Toluene at 45 ppm, MW 92. Concentration in mg/m³?
8. A charcoal tube sampled at 0.15 L/min for 300 min; the lab reports 2.4 mg. Concentration
   in mg/m³?
9. A worker is exposed 3 hr at 120 ppm, 3 hr at 40 ppm, and 2 hr at 0 ppm. 8-hr TWA?
10. Two agents with the same target organ: 30 ppm against a 50 ppm TLV, and 12 ppm against a
    25 ppm TLV. Is the mixture over the limit?
11. A 10-ft-diameter tank filled to 14 ft with a liquid of SG 0.86. Gallons and weight?
12. Type C soil, 16 ft deep, 5 ft wide at the bottom. Top width?
13. A 12,000 lb load on a 4-leg bridle at 60° from horizontal. Tension per leg?
14. A forklift rated 6,000 lb at a 24-in load center. Capacity at a 42-in load center?
15. A hood with a 2 ft² face must pull 150 fpm capture velocity at 18 in. Unflanged airflow?
16. A 45,000 ft³ room at 1,200 ppm, ventilated at 6,000 cfm of clean air, K = 1. Time to
    reach 100 ppm?
17. NWB 26 °C, GT 32 °C, DB 34 °C, outdoors in full sun. WBGT?
18. RWL with HM 0.75, VM 0.90, DM 0.87, AM 0.87, FM 0.85, CM 0.95. If the load is 32 lb,
    what's the LI?
19. A source reads 720 mR/hr at 3 ft. What is the rate at 15 ft?
20. Three components in series with reliabilities 0.98, 0.95, and 0.99. System reliability?
    Now put a second identical component in parallel with the 0.95 unit — new system
    reliability?

---

### Answers

1. `(11 × 200,000) / 837,500` = **2.63**
2. `8 / 2^((97−90)/5)` = `8 / 2^1.4` = 8/2.639 = **3.03 hr**
3. `16.61 × log(2.45) + 90` = 16.61 × 0.3892 + 90 = **96.5 dBA**
4. `10 × log(10^8.8 + 10^9.1 + 10^8.5)` = 10 × log(6.31e8 + 1.259e9 + 3.162e8) = 10 ×
   log(2.206e9) = **93.4 dB**
5. `92 − [(29 − 7) × 0.5]` = 92 − 11 = **81 dBA**
6. `105 − 20 log(24/3)` = 105 − 20(0.9031) = 105 − 18.06 = **86.9 dB** (three doublings ×
   −6 dB = −18, same answer)
7. `(45 × 92) / 24.45` = **169.3 mg/m³**
8. Volume = 0.15 × 300 = 45 L = 0.045 m³ → `2.4 / 0.045` = **53.3 mg/m³**
9. `(3×120 + 3×40 + 0) / 8` = (360 + 120)/8 = **60 ppm**
10. `30/50 + 12/25` = 0.60 + 0.48 = **1.08 → yes, over the limit** (even though neither agent
    exceeds its own TLV)
11. `V = π(5)²(14)` = 1,099.6 ft³ → × 7.48 = **8,225 gal**; weight = 1,099.6 × 62.4 × 0.86 =
    **59,010 lb**
12. Type C = 1½:1 → run each side = 1.5 × 16 = 24 ft → `5 + 24 + 24` = **53 ft**
13. `12,000 / 4 = 3,000` per leg vertical; × 1.155 = **3,465 lb per leg**
14. `(6,000 × 24) / 42` = **3,429 lb**
15. `Q = 150 × (10 × 1.5² + 2)` = 150 × (22.5 + 2) = 150 × 24.5 = **3,675 cfm** (note X in
    **feet**, not inches — 18 in = 1.5 ft. That conversion is the whole trick)
16. `t = −(45,000/6,000) × ln(100/1,200)` = −7.5 × ln(0.08333) = −7.5 × (−2.4849) =
    **18.6 minutes**
17. Outdoors with solar load: `0.7(26) + 0.2(32) + 0.1(34)` = 18.2 + 6.4 + 3.4 =
    **28.0 °C WBGT**
18. `RWL = 51 × 0.75 × 0.90 × 0.87 × 0.87 × 0.85 × 0.95` = **21.6 lb**; `LI = 32/21.6` =
    **1.48** → increased risk
19. `720 × (3/15)²` = 720 × 0.04 = **28.8 mR/hr**
20. Series: `0.98 × 0.95 × 0.99` = **0.9217**. With the parallel pair replacing the 0.95:
    `1 − (1−0.95)(1−0.95)` = 1 − 0.0025 = 0.9975 → `0.98 × 0.9975 × 0.99` = **0.9678**

---

## Drill routine

**Every study day, 20 minutes:**

- 5 minutes: 5 unit conversions, cold, no notes
- 10 minutes: 5 drills from the list above (rotate through)
- 5 minutes: one full multi-step problem from a domain file's worked examples, done from the
  stem with the worked solution covered

**Two weeks before the exam**, add a constraint: do them **mouse-only** on an on-screen
calculator (any TI-30XS emulator will do) to simulate exam-day input speed. It's slower than
you expect, and finding that out on exam day is expensive.
