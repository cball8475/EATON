# Domain 2 — Safety Programs and Concepts (25%)

The largest domain, by a wide margin — roughly 44 scored items. It also carries the most
cross-domain math. If your study time is short, this file is where it goes.

---

## 1. Safety management systems

### ANSI/ASSP Z10.0-2019 — Occupational Health and Safety Management Systems

Structured on **Plan-Do-Check-Act**. Six sections:

| Section | Content |
|---|---|
| 3.0 | **Management leadership and worker participation** — policy, responsibility/authority, resources, and *meaningful* worker participation (removing barriers, access to information) |
| 4.0 | **Planning** — initial and ongoing review, assessment and prioritization, objectives, implementation plans |
| 5.0 | **Implementation and operation** — hierarchy of controls, design review/MOC, procurement, contractors, emergency preparedness, education/training/awareness |
| 6.0 | **Evaluation and corrective action** — monitoring/measurement, incident investigation, audits, corrective/preventive action, feedback to planning |
| 7.0 | **Management review** — inputs, outputs, follow-up, continual improvement |

Z10's distinguishing features vs. other systems: the **hierarchy of controls is mandatory
and ranked in the standard**, worker participation is a requirement (not a nicety), and it
explicitly requires design review and management of change.

**Z10 hierarchy of controls (six levels, in order):**

1. **Elimination**
2. **Substitution** (less hazardous materials, processes, operations, equipment)
3. **Engineering controls**
4. **Warnings**
5. **Administrative controls** (work practices, procedures, training, rotation)
6. **PPE**

NIOSH's version collapses warnings into administrative and shows **five** levels. If the
answer choices have six with "warnings" listed separately, they're testing Z10.

**The exam's favorite hierarchy trap:** PPE is *always* last, and "training" is
administrative — never engineering. A guard is engineering. A warning sign is a warning
(or administrative, in the 5-level model), never engineering. Ventilation is engineering.
Job rotation is administrative.

### ISO 45001:2018

Built on **Annex SL / High-Level Structure**, which is why it maps clause-for-clause onto
ISO 9001 and ISO 14001. Clauses 4–10 are the auditable ones:

| Clause | Title | Key content |
|---|---|---|
| 4 | **Context of the organization** | internal/external issues, interested parties, scope, the OH&S MS |
| 5 | **Leadership and worker participation** | leadership *and commitment* (cannot be delegated), policy, roles, consultation and participation of workers |
| 6 | **Planning** | risks and opportunities, hazard identification, legal requirements, objectives and planning to achieve them |
| 7 | **Support** | resources, competence, awareness, communication, documented information |
| 8 | **Operation** | operational planning and control, **hierarchy of controls**, MOC, procurement/contractors/outsourcing, emergency preparedness |
| 9 | **Performance evaluation** | monitoring/measurement/analysis, evaluation of compliance, internal audit, management review |
| 10 | **Improvement** | incident, nonconformity and corrective action, continual improvement |

Follows PDCA: Plan = 4, 5, 6 · Do = 7, 8 · Check = 9 · Act = 10.

**ISO 45001 vs. OHSAS 18001 (the old one):** 45001 adds context of the organization, moves
from hazard-based to **risk and opportunity**-based thinking, requires top-management
leadership rather than delegated "management representative," and strengthens worker
participation. OHSAS 18001 was withdrawn in 2021.

**ISO 45001 vs. ANSI Z10:** ISO is certifiable by third parties; Z10 is a consensus standard
without a certification scheme. Both are voluntary. Neither is enforceable by OSHA — but
"consensus standard" evidence supports General Duty Clause citations.

### OSHA VPP and other programs

- **VPP (Voluntary Protection Programs)**: Star (self-sufficient, exemplary), Merit (good
  system, working toward Star), Demonstration. Star sites are removed from programmed
  inspection lists. Requires TCIR and DART **below the industry NAICS average**.
- **SHARP** — Safety and Health Achievement Recognition Program, for small businesses via
  the On-Site Consultation Program. Consultation visits are confidential and cannot result
  in citations; serious hazards must still be corrected.
- **OSHA Safety and Health Program Management Guidelines (2016)**: 7 core elements —
  management leadership · worker participation · hazard identification and assessment ·
  hazard prevention and control · education and training · program evaluation and
  improvement · communication and coordination for host employers, contractors, and staffing
  agencies.

---

## 2. Hazard analysis and risk assessment methods

Know **what each method is, whether it's inductive or deductive, and when you'd pick it.**
The exam asks selection far more than execution.

| Method | Direction | Best used when |
|---|---|---|
| **JHA / JSA** | Inductive | Breaking a routine task into steps to find task-level hazards. Steps → hazards → controls |
| **PHA (Preliminary Hazard Analysis)** | Inductive | Very early in design, when detail is scarce. Feeds later analyses |
| **What-if** | Inductive | Brainstorming, experienced team, less structure needed |
| **Checklist** | Inductive | Well-understood, standardized processes; compliance verification |
| **What-if / Checklist** | Inductive | The hybrid — most common in PSM practice |
| **HAZOP** | Inductive | Continuous process systems with defined parameters; node-by-node with guide words |
| **FMEA / FMECA** | Inductive (bottom-up) | Component-level: what happens when *this part* fails? Produces RPN |
| **FTA (Fault Tree)** | **Deductive (top-down)** | Start from a defined top event, work backward to root causes. Boolean, quantifiable |
| **ETA (Event Tree)** | Inductive (forward) | Start from an initiating event, trace success/failure branches to outcomes |
| **Bowtie** | Both | Combines FTA (left, causes) and ETA (right, consequences) around a top event. Shows barriers |
| **Change analysis** | Comparative | Compare the changed condition to the baseline; what's different is where the hazard is |
| **MORT (Management Oversight and Risk Tree)** | Deductive | Very large pre-built fault tree, emphasizes management-system failures |
| **LOPA** | Semi-quantitative | Layer of protection analysis — counts independent protection layers against a risk target |

**HAZOP guide words** (paired with a parameter like flow, pressure, temperature, level):
**No/None · More · Less · As well as · Part of · Reverse · Other than.** A "deviation" is a
guide word + parameter — e.g., "no flow," "reverse flow."

**FMEA:** `RPN = Severity × Occurrence × Detection`, 1–10 each, 1–1,000 total. Detection is
inverted (10 = can't detect). FMECA adds criticality.

**FTA symbols:** AND gate (all inputs required — multiply probabilities), OR gate (any input
— `1 − Π(1−P)`), basic event (circle), undeveloped event (diamond), house/external event,
transfer triangle. A **minimal cut set** is the smallest combination of basic events that
causes the top event; a **single-point failure** is a cut set of one — that's what you're
hunting for.

**Root cause analysis tools:** 5 Whys · Fishbone/Ishikawa (categories: Man, Machine,
Material, Method, Measurement, Environment — "6 Ms") · Pareto (80/20, find the vital few) ·
Causal factor charting · TapRooT · Barrier analysis · Events and causal factors charting.

**Cause classification models:**

- **Heinrich's domino theory** (1931): ancestry/social environment → fault of person →
  unsafe act/condition → accident → injury. Remove the middle domino (the unsafe act) and
  the chain stops. Heinrich's 88/10/2 attribution of causes to unsafe acts is now widely
  criticized — know it's *his claim*, not fact.
- **Bird's updated domino** shifts the emphasis to **lack of management control** as the
  first domino.
- **Reason's Swiss cheese model**: active failures at the sharp end pass through holes in
  successive defensive layers; latent conditions create the holes. Modern, and the model
  behind "systems thinking."
- **Accident triangles**: Heinrich 300 no-injury : 29 minor : 1 major. Bird 600 : 30 : 10 : 1.
  Both are correlation claims about severity distribution, not causation. Increasingly
  criticized because serious-injury precursors are qualitatively different from minor-injury
  precursors (the SIF/potential-SIF concept).
- **HFACS**: unsafe acts → preconditions → unsafe supervision → organizational influences.

### Risk assessment and risk matrices

```
Risk = Severity × Probability (× Exposure, in some models)
```

**ANSI/ASSP Z590.3 — Prevention through Design.** The core idea: address hazards in the
design and redesign phases, where control is cheapest and most effective. Life-cycle
stages: pre-design, design/redesign, construct/install, use/operate/maintain,
decommission/disposal. **The earlier in the life cycle, the higher the leverage and the
lower the cost.**

**Risk matrix mechanics:** typically 5×5. Severity categories run Catastrophic /
Critical / Marginal / Negligible (MIL-STD-882 uses I–IV); probability runs Frequent /
Probable / Occasional / Remote / Improbable (A–E). Risk levels come out as High / Serious /
Medium / Low, with defined acceptance authority for each.

**ALARP** — As Low As Reasonably Practicable. The region between "intolerable" and "broadly
acceptable" where you reduce risk until the cost is grossly disproportionate to the benefit.

**Residual risk** = risk remaining after controls. **Inherent/initial risk** = before
controls. Risk assessment documents both, and the acceptance decision applies to residual
risk. **Risk acceptance is a management decision, not a safety-professional decision** —
the safety professional advises. That distinction shows up in Domain 9 too.

**Risk treatment options:** avoid · reduce/mitigate · transfer (insurance, contract) ·
retain/accept. Note **transfer moves the financial consequence, not the hazard.**

---

## 3. Globally Harmonized System (GHS) / HazCom

29 CFR 1910.1200 aligned to GHS in 2012, updated 2024 to GHS Rev. 7.

**The 16-section SDS, in mandatory order** (memorize the first 11 — OSHA doesn't enforce
12–15 because they're EPA/DOT jurisdiction, but they must be present):

1. Identification
2. Hazard(s) identification
3. Composition / information on ingredients
4. First-aid measures
5. Fire-fighting measures
6. Accidental release measures
7. Handling and storage
8. **Exposure controls / personal protection** ← where the OELs and PPE live
9. Physical and chemical properties
10. Stability and reactivity
11. Toxicological information
12. Ecological information *(not OSHA-enforced)*
13. Disposal considerations *(not enforced)*
14. Transport information *(not enforced)*
15. Regulatory information *(not enforced)*
16. Other information, including date of preparation or last revision

**Label elements (six required):** product identifier · signal word · hazard statement(s) ·
pictogram(s) · precautionary statement(s) · supplier identification.

**Signal words:** only two. **DANGER** = more severe. **WARNING** = less severe. Only one
signal word appears on a label — the most severe.

**Nine pictograms:** health hazard (silhouette with starburst — carcinogen, mutagen,
reproductive toxin, respiratory sensitizer, target organ, aspiration) · flame · exclamation
mark (irritant, skin sensitizer, acute tox cat. 4, narcotic effects) · gas cylinder ·
corrosion · exploding bomb · flame over circle (oxidizer) · **environment (non-mandatory
under OSHA)** · skull and crossbones (acute toxicity, severe).

**Category numbering is backwards from what feels natural: Category 1 is the MOST severe.**
That's the opposite of NFPA 704, where 4 is the most severe. Both appear on the exam and
the contrast is deliberately tested.

**HazCom program requirements:** written program · chemical inventory · labels on all
containers (workplace labels may use an alternative system) · SDS readily accessible during
each work shift · training at initial assignment and whenever a **new hazard** is introduced
· non-routine task training · contractor notification.

**Portable container exemption:** a container into which a chemical is transferred for the
**immediate use of the employee performing the transfer, within that work shift**, does not
require a label. Set it down for the next shift and it does.

---

## 4. Hazardous energy control (LOTO) — 29 CFR 1910.147

**Energy types to isolate:** electrical · mechanical · hydraulic · pneumatic · chemical ·
thermal · gravitational/potential · kinetic · magnetic · radiation. Stored energy is the
one people miss — springs, capacitors, elevated parts, pressurized lines, residual heat.

**Employee categories:**

- **Authorized** — locks out and services the equipment. Full training, annual retraining
  required by the periodic inspection.
- **Affected** — operates the equipment or works in the area. Trained to recognize
  procedures and never to restart a locked-out machine.
- **Other** — anyone whose work is in the area. Instructed about the prohibition on
  attempting to restart.

**Application sequence (six steps, in order):**

1. Prepare for shutdown (identify all energy sources and magnitudes)
2. Notify affected employees
3. Shut down the machine by normal stopping procedure
4. Isolate all energy sources (disconnect switch, valve — **not the on/off button**)
5. Apply lockout/tagout devices (each authorized employee applies their own)
6. Release stored/residual energy and verify isolation (the **try step** — attempt to
   start, then return controls to off)

**Restoration sequence:** inspect the area · remove tools · ensure employees are clear ·
remove devices (**by the person who applied them**) · notify affected employees · energize.

**Key requirements and numbers:**

- Devices must be **durable, standardized, substantial, and identifiable** (identify the
  user)
- **Periodic inspection at least annually**, by an authorized employee **not using** the
  procedure being inspected
- Tagout alone requires an **additional means** providing full-employee-protection
  equivalence — or the energy-isolating device must be incapable of accepting a lock
- Lock removal by anyone other than the applier requires a documented procedure: verify the
  employee isn't in the facility, make all reasonable efforts to contact them, and ensure
  they're informed before resuming work
- **Group lockout** requires a device (lock box) affording protection equivalent to a
  personal lock, with a principal authorized employee
- **Shift change** requires an orderly transfer of devices with continuous protection

**Exceptions:**

- **Minor servicing exception** — routine, repetitive, integral to production **and**
  alternative effective protection is provided. Very narrow; OSHA reads it strictly.
- **Cord-and-plug exception** — the plug is under the exclusive control of the person doing
  the work.
- **Hot tap** exception, and troubleshooting/testing that requires energization (energized
  work under 1910.333 with the machine re-locked immediately after).

**1910.147 does not cover:** construction (1926 Subpart K/O), agriculture, maritime,
oil/gas well servicing, and **electric utility installations** covered by 1910.269. Nor
does it cover exposure to electric shock during work on electrical conductors — that's
**1910.333** (Subpart S) with its own energized-work rules.

---

## 5. Electrical safety fundamentals

### Ohm's law and power

```
V = I × R          I = V/R          R = V/I
P = V × I = I²R = V²/R
```

Series: `R_total = R₁ + R₂ + …`, same current through each, voltage divides.
Parallel: `1/R_total = 1/R₁ + 1/R₂ + …`, same voltage across each, current divides. Total
parallel resistance is always **less than the smallest branch**.

**Impedance** `Z` is the AC generalization: `Z = √(R² + (X_L − X_C)²)`.

### Physiological effects of current (60 Hz AC, hand-to-hand)

| Current | Effect |
|---|---|
| ~1 mA | Perception threshold |
| ~5 mA | Slight shock, not painful. **GFCI trip point (4–6 mA)** |
| 6–25 mA | **Let-go threshold exceeded** — muscular freeze, can't release the conductor |
| 50–150 mA | Extreme pain, respiratory arrest, severe muscular contraction |
| 1,000–4,300 mA | **Ventricular fibrillation**, the usual cause of electrocution death |
| 10,000 mA+ | Cardiac arrest, severe burns |

**It's the current that kills, not the voltage** — but current is driven by voltage against
body resistance, which ranges from ~100,000 Ω (dry skin) to ~1,000 Ω (wet skin) to ~500 Ω
(internal, hand-to-foot). At 120 V and 1,000 Ω, `I = 120 mA` — lethal range. That
calculation is a stock exam question.

### Controls

- **Grounding** connects to earth, providing a fault-current path so overcurrent devices
  operate. **Bonding** connects conductive parts together so they're at the same potential.
  They're different and the exam tests the difference.
- **GFCI** compares current on hot vs. neutral; trips at **4–6 mA** in ~1/40 second.
  Protects **people**. Required for construction 120V 15/20/30A receptacles, wet
  locations, and as one option in the assured equipment grounding conductor program.
- **Overcurrent protection** (fuses, breakers) protects **conductors and equipment** from
  overload and short circuit. It does **not** protect people from shock.
- **Double insulation** — a second layer of protective insulation; such tools don't require
  a grounding conductor.
- **Electrostatic discharge** — control by bonding and grounding (target ≤10⁶ ohms for
  static dissipation), humidification (>50% RH), ionization, conductive footwear/flooring.
  A flammable liquid transferred without bonding is a classic ignition scenario.

### NFPA 70E — Electrical Safety in the Workplace

- **Energized work is prohibited** unless de-energizing introduces additional or increased
  hazards, or is infeasible due to equipment design or operational limitations. "It's
  inconvenient / costs production" is **never** a justification. An **energized electrical
  work permit** is required.
- **Electrically safe work condition** — the 8-step process ending in lockout/tagout and
  **testing the tester before and after** verifying absence of voltage.
- **Shock approach boundaries:** *limited approach* (crossed only by qualified persons, or
  unqualified persons escorted by a qualified person), *restricted approach* (requires a
  qualified person with shock PPE and a written plan). The prohibited approach boundary was
  removed in the 2015 edition.
- **Arc flash boundary** — the distance at which incident energy is **1.2 cal/cm²**, the
  onset of a second-degree burn.
- **Incident energy analysis** or the **PPE category method** (tables), never both for the
  same task. Arc-rated clothing is rated in cal/cm². Meltable synthetics are prohibited.
- **50 volts** is the general threshold for shock-hazard requirements.
- **Qualified person**: has the skills and knowledge related to the construction and
  operation of the equipment **and** has received safety training to identify and avoid the
  hazards. Qualification is task- and equipment-specific.
- Arc flash causes: arc blast pressure wave, molten metal, sound >140 dB, light, and
  temperatures up to ~35,000 °F.

### Hazardous (classified) locations — NFPA 70 / NEC Article 500

| Class | Material |
|---|---|
| **Class I** | Flammable **gases or vapors** |
| **Class II** | Combustible **dusts** |
| **Class III** | Ignitable **fibers/flyings** |

| Division | Meaning |
|---|---|
| **Division 1** | Hazard present under **normal** operating conditions |
| **Division 2** | Hazard present only under **abnormal** conditions (container failure, ventilation failure) |

**Groups:** Class I — A acetylene · B hydrogen · C ethylene · D propane/gasoline (most
common industrial). Class II — E metal dust · F carbonaceous/coal · G grain, flour, plastics.

**Zone system** (IEC-aligned alternative): Zone 0 (continuous), Zone 1 (likely under normal
operation), Zone 2 (unlikely/short duration) for gases; Zones 20/21/22 for dusts.

**Protection techniques:** explosionproof enclosure (contains an internal explosion and
cools escaping gases below ignition temperature — it does *not* keep gas out), purged and
pressurized, **intrinsically safe** (limits energy below what's needed for ignition — the
preferred method for instrumentation), dust-ignitionproof, oil immersion.

---

## 6. Key safety fundamentals — the blueprint's list

### a. Trenching and excavation (1926 Subpart P)

Covered in the math file. Add: **competent person** required for daily inspections and
authority to remove employees; protective systems required at 5 ft; PE design at 20 ft;
egress within 25 ft lateral in trenches ≥4 ft; spoil 2 ft back; test atmospheres >4 ft;
water accumulation controls; underground utilities located before digging; no working
under suspended loads.

### b. Working at heights (1910 Subpart D / 1926 Subpart M)

| Trigger height | Where |
|---|---|
| **4 ft** | General industry walking-working surfaces (1910.28) |
| **5 ft** | Shipyards |
| **6 ft** | Construction (1926.501) |
| **8 ft** | Longshoring |
| **10 ft** | Scaffolds (1926.451) |

**Guardrail specs:** top rail **42 in ±3**, able to withstand **200 lbf** in any outward or
downward direction; midrail at **21 in** (150 lbf); toeboard **3.5 in** minimum. Screens or
mesh may substitute for midrails.

**Hierarchy for fall hazards:** eliminate the need to work at height → passive fall
protection (guardrails, covers, nets) → fall **restraint** (prevents reaching the edge) →
fall **arrest** (allows a fall, then stops it) → administrative controls/warning line
systems. Restraint before arrest — because arrest still means a fall happened.

**Ladders:** 4:1 pitch (1 ft out per 4 ft up); side rails extend **3 ft** above the landing
for extension ladders; three-point contact; no carrying loads that cause loss of balance;
top step of a stepladder is not a step; ladders must be inspected before use; metal ladders
prohibited near energized electrical work.

**Ladder safety systems / cages:** since the 2017 rule, new fixed ladders over 24 ft need a
ladder safety system or personal fall arrest; cages are being phased out by **November 18,
2036**.

### c. Slips, trips, and falls

Same-level falls are the highest-frequency injury category and a leading cause of days-away
cases. Contributing factors: contaminants on the floor, changes in surface, poor lighting,
footwear, transitions, distraction (walking-working surfaces + human factors). Control by
housekeeping, drainage, high-traction flooring (COF ≥ 0.5 conventional threshold), footwear
programs, lighting, marking changes in elevation, and eliminating the transitions.

### d. Machine guarding (1910 Subpart O)

**Hazardous motions:** rotating, reciprocating, transverse. **Hazardous actions:** cutting,
punching, shearing, bending. **Hazard points:** point of operation, power transmission
apparatus, other moving parts (in-running nip points, "pinch points").

**Guarding requirements (1910.212):** prevent contact · be secure and durable (not easily
removed) · protect from falling objects · create no new hazard · create no interference ·
allow safe lubrication (ideally from outside the guard).

**Guard types:** fixed (the preferred, most effective) · interlocked · adjustable ·
self-adjusting.

**Device types:** presence-sensing (light curtains, safety mats, area scanners) · pullback ·
restraint (holdback) · safety trip controls (tripwire, body bar) · two-hand control (requires
concurrent pressure through the hazardous portion of the cycle) · two-hand trip (releases at
initiation — needs the safety-distance formula) · gate.

**Feeding/ejection methods** (not guards, but hazard-reducing): automatic/semiautomatic feed,
robotic, and **hand-feeding tools** — which are *aids*, never substitutes for a guard.

**Anchoring:** machines designed for a fixed location must be secured to prevent walking or
moving. **Ring/grinder specs:** work rest within **1/8 in** of the wheel, tongue guard
within **1/4 in**. Those two numbers are almost guaranteed on the exam.

**Safety distance formula** for presence-sensing devices — see the math file.

### e. Powered industrial trucks (1910.178)

**Classes I–VII:** I electric rider · II electric narrow aisle · III electric hand/hand-rider
· IV internal combustion, cushion (solid) tires · V internal combustion, pneumatic tires ·
VI electric/IC tractors · VII rough-terrain forklift.

- **Training**: formal instruction + practical training + **evaluation of performance in the
  workplace**. **Evaluation at least every three years**, plus refresher training after an
  accident, near miss, unsafe operation observed, assignment to a different truck, or a
  change in workplace conditions.
- **Inspection**: examined **before each shift** (or after each shift if used around the
  clock); removed from service if unsafe.
- **Stability triangle**: formed by the two front wheels and the pivot point of the steer
  axle. The combined center of gravity of truck + load must stay inside it. Load center is
  standardized at **24 in**. Capacity derates for a longer load center, higher lift, and
  attachments — read the **data plate**, which must be legible and match any attachments.
- **Travel with the load low (4–6 in) and tilted back**; travel in reverse when the load
  obstructs vision; never travel with the load elevated.
- **On a ramp with a load, drive forward going up and reverse going down** (load upgrade).
  Unloaded, the forks point downgrade.
- **Battery charging** areas: ventilation for hydrogen (LEL 4%), eyewash and shower, no
  smoking, fire protection, and PPE. **Add acid to water, never water to acid.**
- **LPG cylinders** stored upright with the pressure-relief valve in vapor space.
- No riders; no elevating personnel on the forks (use an approved, secured platform with
  restraints).
- Seat belts: OSHA cites their absence under the General Duty Clause and 1910.178(a)(4)
  (manufacturer requirements).

### f. Hoisting and rigging

Sling math is in the math file. Add:

- **Inspection**: by a **competent person** before each use; periodic documented inspections
  (annual for slings under 1910.184; more frequent under severe service).
- **Removal criteria** — wire rope: broken wires (10 randomly distributed in one lay, or 5
  in one strand), kinking, crushing, birdcaging, heat damage, reduction in diameter, corrosion,
  end-attachment damage. **Synthetic web**: acid/caustic burns, melting/charring, holes,
  tears, cuts, snags, broken or worn stitching, distorted fittings, missing or illegible tag
  (**a missing tag alone removes the sling from service**).
- **Chain slings**: no repairs except by the manufacturer or a qualified person; check for
  stretch, gouges, nicks.
- **Hooks**: latches required; remove for cracks, >10% throat opening, >10° twist.
- **Never** stand under a suspended load; use **taglines**, not hands, to control loads;
  hand signals — one designated signaler, but **anyone can give a STOP signal**.
- **Crane operators** in construction must be certified (1926.1427); a qualified rigger is
  required for hoisting/rigging during assembly/disassembly and when workers are in the
  fall zone.
- **Personnel platforms** on cranes: only when conventional means are infeasible or more
  hazardous; **design factor of 10**, trial lift, proof test at 125%, fall arrest attached
  to the crane or the platform.

### g. Scaffolding (1926 Subpart L)

- Capacity: support its own weight plus **4× the maximum intended load** (suspension ropes:
  **6×**)
- **Competent person** for erection, inspection before each shift, and after any event that
  could affect integrity; a **qualified person** designs
- **Fall protection above 10 ft**; guardrails on supported scaffolds; both guardrails **and**
  PFAS on suspension scaffolds
- **Height-to-base width ratio of 4:1** — beyond that, restrain/guy/brace
- **Platform width 18 in** minimum (some exceptions to 12 in); planks fully decked, gaps
  ≤1 in; plank overhang 6 in min to 12 in max (18 in for planks ≤10 ft)
- **Access**: no climbing cross braces; ladders, stair towers, ramps, or integral prefab access
- Clearance from power lines (1926.451(f)(6)): insulated lines **<300 V → 3 ft**; insulated
  300 V–50 kV → **10 ft**; **uninsulated <50 kV → 10 ft**; over 50 kV → 10 ft **plus 0.4 in
  per kV above 50 kV**
- Scaffolds erected on a stable, level base with **base plates and mudsills**; never on
  unstable objects (barrels, boxes, loose brick)

### h. Process safety (1910.119 PSM) — the 14 elements

1. **Employee participation** (written plan, consult on PHAs)
2. **Process safety information** (chemical hazards, technology, equipment — must be
   compiled *before* the PHA)
3. **Process hazard analysis** — by a team with process and PHA-methodology expertise;
   **updated and revalidated at least every 5 years**
4. **Operating procedures** — reviewed annually to certify current
5. **Training** — initial, then **refresher at least every 3 years**
6. **Contractors** — screen on safety performance, inform of hazards, keep an injury log
7. **Pre-startup safety review (PSSR)** — for new and significantly modified facilities
8. **Mechanical integrity** — written procedures, training, inspection and testing per RAGAGEP,
   deficiency correction, QA
9. **Hot work permit**
10. **Management of change** — technical basis, impact on safety/health, procedure
    modifications, authorization requirements, time period, training
11. **Incident investigation** — **initiated within 48 hours**; reports retained **5 years**
12. **Emergency planning and response**
13. **Compliance audits** — at least **every 3 years**, by a knowledgeable person; two most
    recent reports retained
14. **Trade secrets** — cannot be withheld from those who need the information

**Applicability:** processes with a listed highly hazardous chemical at or above its
threshold quantity, or **10,000 lb of a flammable liquid or gas** on site in one process.
Exemptions: retail facilities, oil/gas well drilling, normally unoccupied remote facilities,
and hydrocarbon fuels used solely for onsite consumption as a fuel (if not part of a covered
process).

**EPA's Risk Management Program (40 CFR 68)** is the environmental twin — Program levels 1,
2, 3; requires an offsite consequence analysis (worst case + alternative release), 5-year
accident history, and an RMP submitted to EPA and updated at least every 5 years.

### i. Confined spaces

**Confined space** = large enough to enter and perform work · **limited or restricted means
of entry or exit** · **not designed for continuous employee occupancy**. All three.

**Permit-required confined space** adds one or more of:

1. Hazardous atmosphere (actual or potential)
2. Material with the potential for **engulfment**
3. Internal configuration that could **trap or asphyxiate** (inwardly converging walls, or a
   floor that slopes downward and tapers)
4. **Any other recognized serious safety or health hazard**

**Atmospheric acceptance criteria:**

| Parameter | Acceptable |
|---|---|
| Oxygen | **19.5% – 23.5%** |
| Flammable | **< 10% of the LEL** |
| Toxic | Below the PEL/OEL for each substance |

**Test in this order: oxygen first, then flammables, then toxics.** The reason is
instrumental — combustible-gas sensors need oxygen to read correctly, so an
oxygen-deficient reading invalidates the LEL result.

**Roles:**

- **Entrant** — knows hazards, uses equipment, communicates with the attendant, alerts and
  self-evacuates on any warning sign or order
- **Attendant** — remains **outside** for the duration, monitors entrants and conditions,
  maintains an accurate count, orders evacuation, summons rescue, and **performs no duties
  that interfere**. May not enter to rescue unless relieved by another attendant and trained
  and equipped to do so
- **Entry supervisor** — authorizes entry, signs the permit, verifies tests and that
  rescue services are available, terminates entry, and removes unauthorized persons

**Rescue:** non-entry retrieval (full-body harness with a retrieval line attached at the
center of the back near shoulder level or above the head, and a **mechanical device
required for vertical spaces over 5 ft deep**) is preferred; entry rescue services must be
evaluated for capability and given access to practice at least **annually** in
representative spaces. **More than half of confined-space fatalities are would-be rescuers.**

**Alternate procedures — 1910.146(c)(5):** if the *only* hazard is an actual or potential
**hazardous atmosphere**, and **continuous forced-air ventilation alone** keeps the space
safe, and monitoring data supports it, you may enter without a permit — but you must
document the determination and still test and ventilate.

**Reclassification — 1910.146(c)(7):** if all hazards are **eliminated** (not controlled),
the space may be reclassified as non-permit for as long as they remain eliminated. Note the
distinction: ventilation **controls** an atmospheric hazard (→ alternate procedures);
blanking a line **eliminates** it (→ reclassification).

**Construction confined spaces: 1926 Subpart AA** (2015). Adds a competent-person site
evaluation, continuous atmospheric monitoring where possible, engulfment-hazard early-warning
systems, and explicit multi-employer coordination between host, controlling contractor, and
entry employers.

### j. Fleet and driver safety

Motor vehicle crashes are the **leading cause of work-related death** in the U.S. Program
elements: written policy, MVR checks at hire and periodically, driver qualification files,
training, journey management, vehicle selection and maintenance, telematics, distracted-driving
policy (no texting; hands-free still degrades performance), fatigue management, seat belts,
and post-crash review. **DOT/FMCSA** hours-of-service applies to CMVs: 11-hour driving limit
within a 14-hour window after 10 consecutive off-duty hours; 30-minute break after 8 hours of
driving; 60/70-hour limits over 7/8 days. CDL required for GVWR ≥26,001 lb, 16+ passengers,
or placarded hazmat.

### k. Personal protective equipment (1910 Subpart I)

- **Hazard assessment is required and must be certified in writing** (1910.132(d)) —
  identifying the workplace, the person certifying, and the date. This is the most-cited PPE
  requirement.
- **Employer pays** for PPE, with narrow exceptions: non-specialty safety-toe footwear and
  non-specialty prescription safety eyewear allowed off-site, everyday clothing, weather
  gear, and PPE lost or intentionally damaged by the employee.
- Training: what PPE is necessary, when, how to don/doff/adjust/wear, limitations, care and
  disposal. Retrain when the workplace or PPE changes or when an employee shows inadequate
  understanding.
- **Standards:** eye/face **ANSI Z87.1** · head **ANSI Z89.1** (Type I top impact, Type II
  top + lateral; Class G general 2,200 V, Class E electrical 20,000 V, Class C conductive) ·
  foot **ASTM F2412/F2413** · hearing **ANSI S3.19** · respirators **NIOSH 42 CFR 84** ·
  fall protection **ANSI Z359**.
- PPE is **last in the hierarchy** because it does nothing to the hazard, fails silently,
  depends entirely on human behavior, and protects only the wearer.

### l. Compressed gases and pressure vessels

- Cylinders stored **upright and secured** (chain/strap above the midpoint), valve
  protection caps in place when not in use, **oxygen separated from fuel gas by 20 ft or a
  5-ft-high, half-hour fire-rated barrier**
- Never lift by the cap; never use as rollers; move with a cart
- Regulators matched to gas and pressure; **never use oil or grease on oxygen fittings**
  (auto-ignition)
- Cylinders marked with contents; color coding is **not** a reliable identifier
- DOT requires periodic hydrostatic retest (commonly every 5 or 10 years by cylinder type)
- **Boilers and pressure vessels**: ASME Boiler and Pressure Vessel Code; National Board
  inspection; pressure-relief devices set at or below MAWP, tested periodically; **never
  block or plug a relief valve**
- **BLEVE** — Boiling Liquid Expanding Vapor Explosion: fire impinges on the vapor space of
  a liquefied-gas vessel, weakening the shell above the liquid level; the vessel ruptures and
  the superheated liquid flashes. Control: water cooling on the **vapor space**, drainage
  away from vessels, insulation, relief sizing

---

## 7. Incident investigation

**Purpose is prevention, not blame.** The exam will test that phrase directly.

**Sequence:** secure the scene and care for the injured → preserve evidence → gather data
(4 Ps: **People, Parts, Paper, Position**) → interview → reconstruct the sequence → analyze
for causal factors and root causes → develop corrective actions using the **hierarchy of
controls** → implement and verify effectiveness → communicate lessons learned.

**Interview technique:** interview witnesses **separately and as soon as possible**, in a
neutral location, open-ended questions, no leading, no blame; let the witness tell the story
before you probe. Focus on the sequence, not the fault.

**Cause vocabulary:**

- **Direct cause** — the energy or substance that caused the injury (the actual mechanism)
- **Contributing/causal factor** — a condition or act that increased the likelihood or severity
- **Surface cause / immediate cause** — the unsafe act or unsafe condition
- **Root cause** — the management-system failure that allowed the surface causes to exist.
  If the corrective action is "retrain the injured worker," you almost certainly stopped at
  the surface cause.

**Evidence and chain of custody:** photograph everything before moving anything (with scale
references), sketch and measure positions, tag and log physical evidence with who collected
it, when, and every transfer. A break in the chain destroys evidentiary value — that matters
in Domain 9 (litigation) too.

**High-potential / SIF (Serious Injury and Fatality) events:** investigate near misses with
serious-injury *potential* at the same depth as actual serious injuries. The precursors for
SIFs are different from the precursors for minor injuries, which is the modern critique of
the accident triangle.

**Corrective action quality:** a good corrective action is high on the hierarchy, has a
named owner and a due date, and gets **verified for effectiveness** — not just marked
complete. Verification is the step everyone skips and the exam rewards.

---

## 8. Management of change

MOC exists because most serious incidents trace to an unmanaged change. Required elements:

- Technical basis for the proposed change
- Impact on safety, health, and the environment
- Modifications to operating procedures
- Necessary time period for the change (**temporary changes need an expiration date** —
  Flixborough is the textbook case of a temporary change becoming permanent)
- **Authorization requirements** — who can approve
- Training/communication to affected employees and contractors **before startup**
- Update of process safety information, drawings, and emergency plans
- **Pre-startup safety review** before introducing hazardous chemicals

**Replacement-in-kind** is exempt — an identical replacement meeting the design
specification. Anything else, including "equivalent" or "upgraded," is a change.

**Organizational change** (staffing reductions, reorganizations, shift changes) is a change
too, and is routinely missed.

---

## 9. Leading and lagging indicators

| | Lagging | Leading |
|---|---|---|
| Measures | Outcomes that already happened | Activities that predict future outcomes |
| Examples | TRIR, DART, severity rate, workers' comp costs, fatalities | Near-miss reporting rate, observations completed, hazard-closure rate and time-to-close, training completion, audit scores, % corrective actions verified, safety-conversation counts, preventive maintenance completion |
| Strength | Objective, comparable across sites and industries, regulatory | Actionable *before* an injury, drives behavior |
| Weakness | Rare events → statistically unstable at small sites; **suppressible** (people stop reporting); tells you nothing about *why* | Can be gamed (quantity over quality); requires judgment to select; correlation to outcomes must be validated |

**Rate-based lagging indicators are unreliable for small populations.** At 200,000 hours, a
single recordable moves TRIR by 1.0. That's why small sites need leading indicators — a
guaranteed conceptual question.

**A good leading indicator is:** within the organization's control, measurable, and
demonstrably tied to a risk. "Number of safety meetings held" is weak; "percentage of
identified high-risk hazards closed within 30 days" is strong.

---

## 10. Emerging technologies

- **Data mining / predictive analytics** — mining leading indicators, work orders, and
  observations for precursors. Risks: correlation ≠ causation, biased training data, and
  privacy.
- **Wearables** — proximity detection, fatigue monitoring, exoskeletons, heat-strain
  sensors. Raise privacy and data-ownership questions (Domain 9).
- **Robotics and cobots** — ANSI/RIA R15.06 (ISO 10218) and **ISO/TS 15066** for
  collaborative robots. Four collaborative modes: safety-rated monitored stop, hand guiding,
  speed and separation monitoring, power and force limiting. A cobot is not inherently safe;
  the **application** is assessed, not the robot.
- **Drones/UAS** — FAA Part 107 remote pilot certificate, visual line of sight, 400 ft AGL
  ceiling, no operation over people without a waiver or compliant category. Excellent for
  eliminating roof and confined-space entries — a hierarchy-of-controls *elimination*.
- **AI/machine vision** — automated hazard detection, PPE compliance monitoring. Same caveat
  set: bias, false confidence, and worker-surveillance concerns.
- **VR/AR training** — high engagement and retention for high-consequence, low-frequency
  events; does not replace hands-on competency verification.

---

## 20 things they actually ask — Domain 2

1. Z10 six-level hierarchy vs. NIOSH five-level, and that PPE is always last
2. ISO 45001 clause structure (4–10) and PDCA mapping
3. FTA is deductive/top-down; FMEA is inductive/bottom-up
4. HAZOP guide words and that a deviation = guide word + parameter
5. `RPN = S × O × D` and that Detection is inverted
6. SDS section order — especially §8 exposure controls and §2 hazard ID
7. GHS Category **1 = most severe**; NFPA 704 **4 = most severe**
8. Two GHS signal words only: Danger, Warning
9. The six-step LOTO application sequence, with **verification last**
10. LOTO periodic inspection **annually**, by someone not using the procedure
11. Authorized vs. affected vs. other employees
12. GFCI trips at 4–6 mA and protects **people**; fuses protect **conductors**
13. Grounding vs. bonding
14. Arc flash boundary = **1.2 cal/cm²**
15. Class I/II/III and Division 1/2 in hazardous locations
16. Fall protection triggers: 4 ft general industry, 6 ft construction, 10 ft scaffolds
17. Guardrail 42 in / 200 lbf; grinder work rest 1/8 in, tongue guard 1/4 in
18. Confined space: three defining criteria, the four permit criteria, testing order
   (**O₂ → flammable → toxic**), and 19.5–23.5% / <10% LEL
19. PSM: PHA revalidated every 5 years, audits every 3 years, incident investigation
   initiated within 48 hours, training refresher every 3 years
20. Root cause vs. surface cause — "retrain the employee" is a surface-cause fix
