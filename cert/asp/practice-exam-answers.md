# Practice Exam — Worked Answers

Every calculation is shown. For conceptual items, the note explains **why the distractors
are wrong**, which is the part that transfers to the real exam.

---

## Domain 1 — Mathematical Calculations

**1. B — 1.66**
DART counts days away **plus** restricted/transfer: 7 + 5 = 12 cases.
`(12 × 200,000) / 1,450,000 = 1.655`
Distractor A (0.97) uses only the 7 days-away cases; D (2.48) uses all 18 recordables, which
is TRIR, not DART.

**2. C — 133%**
```
T₉₈ = 8 / 2^((98−90)/5) = 8 / 2^1.6 = 8 / 3.031 = 2.639 hr
T₈₈ = 8 / 2^((88−90)/5) = 8 / 2^-0.4 = 8 / 0.7579 = 10.556 hr
D = 100 × (2/2.639 + 6/10.556) = 100 × (0.758 + 0.568) = 132.6%
```
Over 100% — overexposed. Note the 88 dBA period still contributes; anything above 80 dBA
counts toward the dose under OSHA's hearing conservation amendment.

**3. B — 525 lbf**
`F = W(h + d)/d = 175(6 + 3)/3 = 175 × 3 = 525 lbf`
Well under the 1,800 lbf maximum arresting force. D (1,050) drops the deceleration distance
from the numerator's sum; A uses `Wh/d` incorrectly inverted.

**4. D — 9,000 lb**
```
Per-leg vertical share = 9,000 / 2 = 4,500 lb
Tension factor at 30° from horizontal = 2.00
Tension = 4,500 × 2.00 = 9,000 lb per leg
```
Each leg carries the **entire** load at 30°. That's why 30° is the practical floor for
rigging angles, and it's why D looking "obviously wrong" is the trap.

**5. C — 1,300 cfm**
```
X = 12 in = 1.0 ft   (convert first — this is the whole question)
Q = V(10X² + A) = 100(10 × 1² + 3) = 100 × 13 = 1,300 cfm
```
If you left X in inches you'd get 100(10 × 144 + 3) = 144,300 cfm — an answer so absurd it
should tell you the units are wrong.

**6. B — 20.1 ppm**
`ppm = (mg/m³ × 24.45)/MW = (87 × 24.45)/106 = 20.07 ppm`
D (377) inverts the equation.

**7. B — 8 ft**
```
I₁d₁² = I₂d₂² → 480 × 2² = 30 × d₂²
1,920 = 30 d₂² → d₂² = 64 → d₂ = 8 ft
```
Sanity check: the rate dropped by a factor of 16, so the distance must rise by a factor of
4 (since 4² = 16). 2 ft × 4 = 8 ft.

**8. B — 0.9027**
Series: `0.97 × 0.94 × 0.99 = 0.9027`. Series reliability is always **lower than the weakest
component** (0.94). D (0.9982) is the parallel result.

**9. B — 2.7 years**
`48,000 / 18,000 = 2.67 years`. D (0.375) inverts it.

**10. A — 78.8 ppm**
```
TWA = (2×180 + 3×90 + 3×0) / 8 = (360 + 270)/8 = 630/8 = 78.75 ppm
```
Divide by **8**, not by the 5 sampled hours — the stem states there was no exposure in the
remaining 3 hours. Dividing by 5 gives 126 ppm, which is distractor C and the most common
error on this question type.

---

## Domain 2 — Safety Programs and Concepts

**11. B** — Elimination, substitution, engineering, **warnings**, administrative, PPE. The
six-level Z10 version separates warnings from administrative; the NIOSH five-level version
merges them. PPE is last in both.

**12. C — Fault tree analysis.** Deductive, top-down, from a defined top event backward
through Boolean gates. Event tree (B) runs *forward* from an initiating event; FMEA (A) runs
bottom-up from component failures.

**13. B.** Detection is **inverted** in an FMEA: a 10 means you almost certainly won't
detect the failure before it causes harm. Higher D raises the RPN, which is the opposite of
intuition.

**14. C — Oxygen, flammable, toxic.** Combustible-gas sensors need oxygen to give a valid
reading, so an oxygen-deficient result invalidates the LEL measurement. Test oxygen first for
instrument reasons, not just hazard reasons.

**15. B — Alternate procedures**, 1910.146(c)(5). Reclassification (A) applies when hazards
are **eliminated**, not merely controlled by ventilation. Ventilation *controls*; blanking a
line *eliminates*. That distinction is the entire question.

**16. C — Release stored energy and verify isolation.** Verification is always last, and it
means attempting to start the equipment (then returning controls to off), not just looking at
the switch. Applying the lock (B) comes before verification.

**17. B — Annually, by an authorized employee who is not using the procedure being
inspected.** Both halves matter. An inspection by the person using the procedure isn't an
independent check.

**18. B — 80 mA.**
`I = V/R = 120/1,500 = 0.08 A = 80 mA`
That's in the 50–150 mA band: extreme pain, respiratory arrest, severe muscular contraction.
Ventricular fibrillation begins around 1,000 mA (1 A) in the standard table, so C is the
right effect at the wrong current and D is off by an order of magnitude.

**19. C — People from electrical shock.** GFCIs trip at 4–6 mA of ground-fault current.
Fuses and breakers protect **conductors and equipment** (A, B); AFCIs address arcing faults
(D).

**20. A — 1.2 cal/cm²**, the incident energy at the onset of a second-degree burn on bare
skin. 40 cal/cm² is roughly the blast-hazard threshold, and 50 volts is the shock threshold —
different concepts.

**21. B — Class I, Division 2.** Class I = gases/vapors. Division 2 = present only under
**abnormal** conditions. Division 1 would be present under normal operation.

**22. B — 5 ft and 20 ft.** Protective system required at 5 ft (unless in stable rock with a
competent person's determination); PE design required over 20 ft.

**23. C — 200 lbf**, applied in any outward or downward direction at the top edge. The
midrail requirement is 150 lbf, which is distractor B.

**24. B — work rest 1/8 in, tongue guard 1/4 in.** Reversing them is the classic error. The
work rest is closer because that's where the workpiece can be drawn in.

**25. B — 3,667 lb.**
`(5,500 × 24)/36 = 3,667 lb`
Note the capacity drops by a third for a 12-inch increase in load center. Attachments and
lift height would reduce it further — always check the data plate.

**26. C — At least every three years**, plus refresher training triggered by an accident,
near miss, observed unsafe operation, a different type of truck, or changed workplace
conditions.

**27. C — Every 5 years.** Don't confuse it with the **3-year** compliance audit interval or
the **3-year** training refresher.

**28. B — 48 hours.** Reports are then retained for 5 years.

**29. C — Enclosing the compressor.** A physical modification of the equipment or environment
is engineering. Written procedures (A), rotation (B), and signs (D) are administrative or
warnings — none of them changes the noise.

**30. B — Exposure controls and personal protection.** First aid is §4, toxicological is §11,
stability and reactivity is §10. Section 8 is where you find OELs and PPE recommendations,
which is why it's the one to know.

**31. B — Category 1.** GHS runs **1 = most severe**. NFPA 704 runs the other way, with
4 = most severe. Both appear on the exam specifically so you can confuse them.

**32. B — A surface cause requiring further analysis.** "The operator failed to follow the
procedure" describes *what* happened, not *why*. Why wasn't the procedure followed? Was it
workable? Was there time pressure? Was the training adequate? Was the deviation normalized?
"Human error" is never a root cause.

**33. B.** Leading indicators measure activities that predict future performance and are
actionable before an injury occurs. They can be qualitative (A is wrong), aren't required by
OSHA (C), and matter *more* at small sites where rate-based lagging indicators are
statistically unstable (D is backwards).

**34. C — A defined time period for the change.** Temporary changes with no expiration date
become permanent unmanaged changes — Flixborough is the textbook case. The other elements are
all real MOC requirements, but only C addresses the specific risk in the stem.

**35. B — Inwardly converging walls that could trap an entrant.** That's one of the four
permit criteria. A single point of entry (A) may make it a confined space but doesn't by
itself make it permit-required; lockout (C) and entry frequency (D) aren't criteria.

---

## Domain 3 — Ergonomics

**36. B — The General Duty Clause.** OSHA's ergonomics standard was repealed under the
Congressional Review Act in 2001. There is no 1910.900.

**37. C — NIOSH Lifting Equation.** Two-handed lifting of a discrete object is exactly its
scope. RULA is upper-limb posture, REBA is whole-body posture, and the Strain Index is for
distal upper-extremity repetitive work.

**38. C — Median nerve.** Thumb, index, middle, and half the ring finger. Ulnar covers the
little finger and the other half of the ring finger.

**39. A — 25/H.** With H in inches, capped at 1.0 when H ≤ 10 in and 0 when H > 25 in.
Answer C is the vertical multiplier's form; D is the distance multiplier's.

**40. B — Increased risk; redesign indicated.** LI ≤ 1.0 is acceptable for nearly all healthy
workers; 1.0–3.0 is increased risk; over 3.0 is high risk to many workers.

**41. C — Design for adjustability.** Extremes are used only for a single constraining
dimension (clearance → large user, reach → small user), and "design for the average" is
essentially never correct because no one is average across multiple dimensions.

**42. B — Ineffective.** Rotation only helps when the receiving job loads **different** risk
factors. Rotating repetitive wrist flexion to more repetitive wrist flexion changes nothing
but the scenery.

**43. C.** NIOSH concluded there's insufficient evidence that back belts prevent injury in
uninjured workers and cautioned about false security. They are not OSHA-recognized PPE.

---

## Domain 4 — Fire Prevention and Protection

**44. C — Uninhibited chemical chain reaction.** Confinement (D) belongs to the dust
pentagon, along with dispersion.

**45. C — Class II.** Flash point 100–140 °F. Class IB and IC are Class I (flammable, flash
point under 100 °F); Class IIIA starts at 140 °F.

**46. D — Dry powder agent.** Class D. Water can react violently with burning magnesium and
liberate hydrogen; CO₂ and ABC dry chemical are ineffective and can make it worse. Note "dry
powder" (Class D) is a different product from "dry chemical" (ABC/BC).

**47. C — 10,000 ppm.**
```
20% of LEL × 5% by volume = 0.20 × 5% = 1.0% by volume
1.0% × 10,000 ppm per percent = 10,000 ppm
```
This also illustrates why the confined-space limit is 10% LEL — that's still 5,000 ppm of
methane.

**48. B.** Vapor density > 1 means heavier than air: the vapor settles, pools in pits and low
areas, and travels along the floor to remote ignition sources. Ventilation must be at floor
level, and this is why gasoline vapor ignites at a water heater across the room.

**49. B — 30 minutes**, under OSHA 1910.252. NFPA 51B (2019) requires **60 minutes**. The
stem cited OSHA, so 30 is the answer. Read which authority the stem names.

**50. C — 35 ft.**

**51. C — Preaction.** Requires two events (detection *and* a fused sprinkler) in a
double-interlock configuration, which is why it's used in data centers and archives. Deluge
(D) has all heads open and floods the area on detection alone.

**52. B — 50 ft.** Class A is 75 ft, Class K is 30 ft.

**53. A — 5 years.** CO₂ and water/wetting agent extinguishers test at 5 years; stored-
pressure dry chemical at 12.

**54. B — Photoelectric.** Large smoke particles from smoldering fires scatter light
efficiently. Ionization detectors respond faster to small particles from fast flaming fires.
Heat detectors are the slowest of all.

**55. C — Instability/reactivity.** Blue = health, red = flammability, yellow = instability,
white = special hazards (W̶, OX, SA).

---

## Domain 5 — Emergency Preparedness and Response

**56. B — Life safety, incident stabilization, property and environmental protection.**

**57. B — 10 or fewer employees.** Same threshold applies to the Fire Prevention Plan.

**58. B — Procedures to account for all employees after evacuation.** A, C, and D are all
**Fire Prevention Plan** elements under 1910.39, not EAP elements under 1910.38. Knowing
which plan owns which element is the whole question.

**59. C — Hazardous materials technician.** Approaching the point of release to plug, patch,
or stop it is **offensive** action, requiring at least 24 hours of training. Operations level
is limited to **defensive** action from a distance.

**60. B — Level B.** Same respiratory protection as Level A (SCBA or supplied air) but
splash-protective, non-vapor-tight clothing. Level A adds the fully encapsulating vapor-tight
suit.

**61. B — Safety Officer**, a Command Staff position reporting directly to the IC, and the
only one with authority to stop unsafe acts immediately.

**62. B — 3 to 7**, with 5 as the optimum.

**63. C — 15 minutes** of continuous flushing, tepid (60–100 °F), reachable within 10 seconds
or 55 feet.

**64. C — Recovery point objective.** RPO = acceptable **data loss** measured backward from
the incident. RTO (B) = acceptable **downtime**. MTD (A) is the outer limit RTO must fall
inside.

**65. B — Type II**, customer/client violence. The most common type of non-fatal workplace
assault, concentrated in health care and social services. Type I (criminal intent) is the
most **fatal**.

---

## Domain 6 — Industrial Hygiene and Occupational Health

**66. C — OSHA PEL.** TLVs, RELs, and WEELs are recommendations. OSHA may still use a TLV as
evidence of a recognized hazard in a General Duty Clause case, but the TLV itself is not the
enforceable limit.

**67. B — 15 minutes.**

**68. C — Four times per day**, with at least 60 minutes between exposures, and the 8-hour
TWA must still be met.

**69. B — 4 µm.** Thoracic is 10 µm; inhalable is 100 µm.

**70. C — Full-facepiece air-purifying respirator.** Filtering facepiece and half-mask APR
are 10; pressure-demand SCBA is 10,000.

**71. B — Full-facepiece APR.**
```
Required protection factor = 220 / 5 = 44
Need APF > 44 → the full-facepiece APR at 50 is the minimum adequate choice
```
The half-mask (10) and the loose-fitting PAPR hood (25) are both insufficient. If the stem
had said the atmosphere was IDLH, none of the APRs would be acceptable regardless of the
math — a pressure-demand SCBA would be required.

**72. B — A standard threshold shift requiring notification within 21 days.** The 10 dB
average threshold at 2, 3, and 4 kHz is met. It is **not automatically recordable** (C) —
recording also requires the total shift from baseline to reach 25 dB or more at those
frequencies in the affected ear.

**73. B — Synergistic.** The combined effect vastly exceeds the sum. Potentiation (C) is when
a substance with no effect of its own amplifies another's toxicity.

**74. C — Inhalation.**

**75. B.** Dermal absorption may contribute significantly to the total dose, which means air
sampling **alone will underestimate** the exposure. Biological monitoring (BEIs) is the way
to capture it.

**76. B — 0.50.**
```
RF = (8/h) × [(24 − h)/16] = (8/12) × [(24 − 12)/16] = 0.6667 × 0.75 = 0.50
```
A 12-hour shift halves the allowable exposure limit.

**77. B — 10 working days of assignment.** The employee may decline (signing the standard
declination form) and may accept later at any time, still at no cost.

---

## Domain 7 — Environmental Management

**78. B — SQG, 180 days.** 750 kg/month falls between 100 and 1,000 kg → small quantity
generator. Accumulation limit 180 days, or 270 if transporting more than 200 miles. The
90-day limit (C, D) belongs to LQGs.

**79. B — pH ≤ 2 or ≥ 12.5.**

**80. B — D001, ignitable.** RCRA's ignitability criterion is a flash point **below 140 °F**,
which 125 °F meets. Note this is a **different threshold** from NFPA 30's 100 °F
flammable/combustible line — under NFPA 30 the same liquid is a Class II *combustible*, which
makes distractor C sound plausible. Two systems, two numbers, both correct in their own
context.

**81. C — The generator remains liable indefinitely.** Cradle to grave. Using a permitted
transporter and TSDF does not transfer liability, which is why generator audits of disposal
facilities exist.

**82. C — Carbon dioxide.** The six criteria pollutants are PM, ozone, CO, SO₂, NO₂, and
lead. CO₂ is a greenhouse gas regulated under other authorities, not a NAAQS criteria
pollutant.

**83. B — 1,320 gallons** aggregate aboveground capacity (counting containers of 55 gallons
or more), or 42,000 gallons completely buried.

**84. B — aspect; impact.** The **aspect** is the element of the activity that can interact
with the environment (solvent use); the **impact** is the resulting change to the environment
(groundwater contamination). Aspect = cause, impact = effect.

---

## Domain 8 — Training, Education, and Communication

**85. B — Reaction, Learning, Behavior, Results.**

**86. B — Level 1, and it predicts very little.** Satisfaction correlates poorly with
learning, and barely at all with behavior change on the job. Level 3 is where value shows up
and where almost nobody measures.

**87. B — Address the conditions and consequences that reward the shortcut.** The stem
explicitly states they know how and can demonstrate it — that rules out a knowledge or skill
deficit, so training (A, C) and signage (D) can't fix it. Mager's test: "could they do it if
their life depended on it?" Yes → not a training problem.

**88. C — Competent person.** Both halves: identifies hazards **and** has authority to
correct them. A qualified person has a degree, certificate, professional standing, or
demonstrated expertise — a different definition serving a different purpose.

**89. C — A registered professional engineer**, required for excavation protective systems
deeper than 20 feet. A competent person handles inspections, not design at that depth.

**90. C — Create.** Revised order: Remember, Understand, Apply, Analyze, Evaluate, Create.
(In the original 1956 taxonomy, Evaluation was highest — the revision swapped Synthesis and
Evaluation. If the choices are nouns, it's the original.)

**91. D — Interdependent.** Reactive → Dependent → Independent → Interdependent. Independent
means people take care of *themselves*; interdependent means they take care of *each other*.

**92. B — An increasing number of near-miss reports.** Rising reporting almost always
indicates rising trust, not rising danger. C is the trap: injury-free bonus programs suppress
reporting and are exactly what OSHA's anti-retaliation provisions target. A and D indicate
the culture is going the wrong direction.

**93. A — Slip.** The intention was correct and the execution failed — an attention error. A
lapse is a memory failure (forgetting a step entirely); a mistake means the plan itself was
wrong.

**94. B — Consequences that are soon, certain, and positive.** This is also the mechanism
behind why shortcuts win: the reward for the shortcut is immediate and certain, while the
consequence of the risk is delayed and uncertain.

**95. A — Level 1, perception.** Most SA failures are the person never perceiving the cue —
driven by attention tunneling, distraction, workload, and poor display design.

---

## Domain 9 — Legal

**96. C — OSHRC**, the Occupational Safety and Health Review Commission, an **independent**
federal agency. OSHA (Labor) enforces; NIOSH (HHS) researches; OSHRC adjudicates.

**97. C.** The General Duty Clause applies **only where no specific standard covers the
hazard** — so the *existence* of a specific standard defeats a GDC citation rather than
supporting it. The four real elements are: a hazard existed, it was recognized, it was
likely to cause death or serious physical harm, and a feasible means of abatement existed.

**98. B — 24 hours.** In-patient hospitalization, amputation, and loss of an eye are 24-hour
reports. Only a **fatality** is 8 hours.

**99. D — Controlling employer.** A GC with general supervisory authority — including the
power to correct or require correction — can be cited for failing to exercise reasonable
care, with no exposed employees of its own. That's the point of the multi-employer policy.

**100. C — 30 years.** Employee **medical** records are retained for the duration of
employment **plus** 30 years; **exposure** records are 30 years.

---

## What your misses mean

Go back through every wrong answer and tag it:

| Tag | What it means | What to do |
|---|---|---|
| **Didn't know it** | Content gap | Add to the card deck, re-read that domain section |
| **Misread the stem** | Process problem | Underline the qualifier (NOT, FIRST, BEST, MOST) before you look at the choices |
| **Calculation error** | Execution problem | More TI-30XS drills; write intermediates on the whiteboard |
| **Couldn't distinguish two options** | Precision gap | Find the exact distinction in the domain file and write it out in one sentence |
| **Guessed and got lucky** | Count it as a miss | Same as "didn't know it" |

If more than a third of your misses are process problems rather than content gaps, more
studying won't move your score. Slowing down will.
