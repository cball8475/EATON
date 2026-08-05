# Domain 6 — Industrial Hygiene and Occupational Health (12%)

~21 scored items. Definition-dense, and the exposure-limit vocabulary is tested precisely.
The math lives in [`01-math-and-physics.md`](01-math-and-physics.md) §12; this file is the
concepts, limits, and programs.

---

## 1. The IH process

**Anticipate → Recognize → Evaluate → Control** (and **Confirm**, in the modern five-step
version).

- **Anticipation** — identify hazards before they exist, in design and procurement. Highest
  leverage, ties to Prevention through Design.
- **Recognition** — walkthrough surveys, process review, SDS review, worker interviews,
  chemical inventory. You cannot evaluate what you haven't recognized.
- **Evaluation** — monitoring, sampling, comparison to OELs, exposure assessment,
  characterization of similar exposure groups (SEGs).
- **Control** — hierarchy of controls.
- **Confirm** — re-monitor to verify the control worked. Skipped constantly; tested regularly.

**AIHA exposure categories** (for exposure judgment against an OEL): Category 0 (<1% of the
OEL) through Category 4 (>100%). The tool is the **95th percentile** of the exposure
distribution compared to the OEL, because exposure data is **lognormal**, not normal.

---

## 2. Occupational exposure limits

| Limit | Source | Meaning |
|---|---|---|
| **PEL** | **OSHA** | **Legally enforceable.** Most are 8-hr TWAs. Largely unchanged since 1971 and widely considered outdated |
| **TLV®** | **ACGIH** | **Recommended**, not legally enforceable (unless adopted by reference). Updated annually. Copyrighted |
| **REL** | **NIOSH** | Recommended; usually the most protective. NIOSH is research, not enforcement |
| **WEEL** | AIHA (now OARS) | Workplace Environmental Exposure Level, for substances without other limits |
| **IDLH** | NIOSH | Immediately Dangerous to Life or Health — a concentration that poses an immediate threat to life, irreversible health effects, or would impair escape. **Escape-based, 30-minute reference** |

**Averaging periods:**

| Type | Duration | Rule |
|---|---|---|
| **TWA** | 8 hours | Average concentration over the shift |
| **STEL** | **15 minutes** | Not to be exceeded at any time. **No more than 4 times per day**, at least **60 minutes** apart, and the 8-hr TWA must still be met |
| **Ceiling (C)** | **Instantaneous** | Never to be exceeded at any time |
| **Excursion limit** | ACGIH default when no STEL exists | Excursions may exceed **3× the TLV-TWA** for no more than 30 min/day, and should **never exceed 5× the TLV-TWA** |
| **Action level** | Typically **50% of the PEL** | Triggers monitoring, training, medical surveillance — the substance-specific standards define it |

**OSHA is enforceable; ACGIH is not.** That distinction gets asked as a bare fact and as the
setup for a General Duty Clause question (OSHA can cite under 5(a)(1) using a TLV as evidence
of recognized-hazard status when there's no PEL).

**Skin notation** on a TLV means dermal absorption can contribute significantly to the
total dose — air sampling alone will underestimate the exposure. **Sen** = sensitizer.
**ACGIH carcinogen categories:** A1 confirmed human, A2 suspected human, A3 confirmed animal
with unknown relevance, A4 not classifiable, A5 not suspected. **IARC:** Group 1 carcinogenic
to humans, 2A probably, 2B possibly, 3 not classifiable. **NTP:** known / reasonably
anticipated.

**Extended work shifts** require an adjusted OEL. The Brief & Scala model:
`RF = (8/h) × [(24 − h)/16]`, and the adjusted limit is `TLV × RF`. A 12-hour shift gives
`RF = (8/12) × (12/16) = 0.5` — **half** the 8-hour limit. That halving is the exam's
favorite version.

**Biological Exposure Indices (BEIs)** — ACGIH guidance values for biological monitoring
(blood lead, urinary metabolites), which capture **all routes of entry**, not just
inhalation. Useful precisely where the skin notation applies.

---

## 3. Routes of entry and exposure basics

**Routes, in order of occupational importance:**

1. **Inhalation** — the primary occupational route by a wide margin
2. **Dermal absorption** — the second, and the one air sampling misses
3. **Ingestion** — usually via contaminated hands, food, and smoking in the work area
4. **Injection** — needlesticks, high-pressure injection injuries, punctures

**Acute vs. chronic:**

| | Acute | Chronic |
|---|---|---|
| Exposure | Single, short, usually high | Repeated, long, usually lower |
| Effect onset | Immediate or within hours | Latent, months to decades |
| Example | Chlorine gas release → pulmonary edema | Silica → silicosis; benzene → leukemia |

**Local vs. systemic effect:** local acts at the point of contact (acid burn); systemic acts
elsewhere after absorption (lead → nervous system). A substance can do both.

**Combined effects:**

| Term | Meaning | Notation |
|---|---|---|
| **Additive** | Effects sum | 2 + 3 = 5 |
| **Synergistic** | Combined effect far exceeds the sum | 2 + 3 = 20. Asbestos + smoking is the canonical example |
| **Potentiation** | A non-toxic substance increases another's toxicity | 0 + 3 = 10. Isopropanol + carbon tetrachloride |
| **Antagonistic** | One reduces the other's effect | 4 + 6 = 4. The basis of antidotes |

**Dose-response** is the foundational concept: "the dose makes the poison" (Paracelsus).
Key measures: **LD₅₀** (dose lethal to 50% of a test population, mg/kg — **lower LD₅₀ = more
toxic**), **LC₅₀** (airborne concentration), **NOAEL** (no observed adverse effect level),
**LOAEL**, **threshold dose**. Non-threshold agents (genotoxic carcinogens) are assumed to
have no safe level. **TD₅₀** is the toxic dose to 50%.

**Factors affecting toxicity:** dose, duration and frequency, route, particle size and
solubility, the individual's age, sex, genetics, health status, and pre-existing disease,
and interactions with other exposures.

---

## 4. Physical hazards

### Noise

Program requirements — **1910.95 hearing conservation**:

- **Action level: 85 dBA 8-hr TWA (50% dose)** — triggers the full program: monitoring,
  audiometric testing, hearing protector availability, training, recordkeeping
- **PEL: 90 dBA** — triggers **feasible engineering and administrative controls**, with
  hearing protectors used only when controls don't reduce below the PEL
- **Baseline audiogram within 6 months** of first exposure at or above the action level
  (or 1 year if a mobile van is used), then **annually**
- **Standard Threshold Shift (STS)**: an average shift of **10 dB or more at 2,000, 3,000,
  and 4,000 Hz** in either ear relative to baseline. Age correction is permitted
- STS + a total shift of **25 dB or more** from baseline at those frequencies = **recordable**
  on the OSHA 300 log
- Actions on STS: refit and retrain, refer for evaluation, notify the employee in writing
  **within 21 days**
- **Annual training**; hearing protector **choice of at least two types**; monitoring repeated
  when changes in production or controls may increase exposure
- Records: **noise exposure measurements 2 years, audiometric records for the duration of
  employment**

**Noise-induced hearing loss** is permanent, sensorineural, painless, and shows the classic
**"4,000 Hz notch"** on the audiogram — that notch is a stock exam item. Temporary threshold
shift can recover; permanent threshold shift cannot. Presbycusis is age-related loss.

Math (exchange rates, dose, TWA, NRR, combining sources) is in the math file.

**Engineering controls for noise, in order:** substitute quieter equipment → reduce noise at
the source (mufflers, damping, isolation mounts, balancing, replacing impact with press
processes) → interrupt the path (enclosures, barriers, absorptive treatment, distance) →
protect the receiver (enclosed booth, then PPE).

### Radiation — ionizing

| Type | Charge/mass | Penetration | Shielding | Hazard |
|---|---|---|---|---|
| **Alpha** | +2, heavy | Very low (a sheet of paper, dead skin layer) | Paper | **Internal only** — but Q = 20, so ingestion/inhalation is severe |
| **Beta** | −1, light | Moderate (mm of tissue) | Plastic, aluminum (**not lead first** — bremsstrahlung X-rays) | Skin/eye, and internal |
| **Gamma / X-ray** | None (photons) | High | **Lead, concrete** | Whole-body external |
| **Neutron** | None, heavy | Very high | **Hydrogenous** — water, polyethylene, concrete | Whole-body; high quality factor |

`rem = rad × Q` — Q: X/gamma/beta 1, thermal neutrons 5, fast neutrons/protons 10, **alpha 20**.

**Controls: TIME, DISTANCE, SHIELDING.** Distance is usually cheapest and follows the
inverse-square law. **ALARA** — as low as reasonably achievable — is the governing principle.

**Dose limits:**

| Limit | Value |
|---|---|
| OSHA 1910.1096 whole body, per calendar quarter | **1¼ rem** |
| OSHA hands/forearms/feet/ankles per quarter | 18¾ rem |
| OSHA skin of the whole body per quarter | 7½ rem |
| NRC annual occupational TEDE | **5 rem** |
| NRC declared pregnant worker, gestation period | **0.5 rem (500 mrem)** |
| NRC general public annual | **0.1 rem (100 mrem)** |
| Posting: "Radiation Area" | >5 mrem/hr at 30 cm |
| Posting: "High Radiation Area" | >100 mrem/hr at 30 cm |

**Acute radiation syndrome** stages: prodromal → latent → manifest illness → recovery or
death. Sub-syndromes by dose: hematopoietic (~0.7–10 Gy), gastrointestinal (~10–50 Gy),
cardiovascular/CNS (>50 Gy).

**Radon** — a naturally occurring alpha emitter, decay product of uranium; the **second
leading cause of lung cancer**. EPA action level **4 pCi/L**. Control by sub-slab
depressurization and ventilation.

### Radiation — non-ionizing

Ordered by decreasing energy: **UV → visible → IR → microwave → radiofrequency → ELF**.

- **UV** — UVA/UVB/UVC. Photokeratitis ("arc eye" / welder's flash — painful, delayed
  6–12 hours, self-limiting), cataract, erythema, skin cancer. Controls: welding curtains,
  proper shade lenses, skin covering. **UVC is germicidal** (254 nm) — the basis of UVGI.
- **IR** — thermal; "glassblower's cataract," skin burns.
- **Microwave/RF** — thermal heating (deep tissue), cataract risk to the lens (poorly
  vascularized, poor heat dissipation), and interference with pacemakers/implants. Measured
  as power density (mW/cm²); the FCC and ACGIH publish limits.
- **ELF** — power lines, welding equipment. Epidemiology remains inconclusive.
- **Lasers — ANSI Z136.1**:

| Class | Hazard |
|---|---|
| **1** | Safe under all normal conditions (or enclosed) |
| **1M** | Safe unless viewed with optics |
| **2** | Visible only; the **blink reflex** (0.25 s) protects |
| **3R** | Low risk, exceeds Class 2 |
| **3B** | Hazardous on **direct or specular** reflection; not usually a diffuse hazard |
| **4** | Hazardous **direct, specular, and diffuse**; skin hazard and **fire hazard**. Requires a Laser Safety Officer, controlled area, interlocks, and eyewear rated for the wavelength and optical density |

Key terms: **MPE** (maximum permissible exposure), **NHZ** (nominal hazard zone), **OD**
(optical density of the eyewear, wavelength-specific — the wrong glasses are worse than none
because they encourage looking).

### Heat, cold, vibration, illumination

Heat and cold math and illness recognition: [`01-math-and-physics.md`](01-math-and-physics.md)
§10. Vibration: [`03-ergonomics.md`](03-ergonomics.md) §9.

**Illumination** — measured in foot-candles (lux ÷ 10.76). ~5 fc for general construction
areas, 30–50 fc for offices and general shop work, 100+ fc for fine assembly and inspection.
Problems come from insufficient light, **glare** (direct and reflected), poor contrast,
flicker, and shadows. IES publishes the recommended levels.

### Airborne particulates — size fractions

| Fraction | Cut point (50%) | Deposits |
|---|---|---|
| **Inhalable** | **100 µm** | Anywhere in the respiratory tract, including nose and mouth |
| **Thoracic** | **10 µm** | Lung airways and gas-exchange region |
| **Respirable** | **4 µm** | **Gas-exchange (alveolar) region** — where fibrosis and permanent damage occur |

Particles above ~10 µm are largely removed by the upper airway (impaction) and the
**mucociliary escalator**. Below 4 µm they reach the alveoli, where clearance is by
macrophages and is slow. **That's why the respirable fraction matters and why "total dust"
sampling under-answers the question.**

**Nanoparticles** (<100 nm) behave differently again — high surface area, potential
translocation across membranes, limited toxicological data. Control by containment and
using the precautionary approach; NIOSH publishes RELs for carbon nanotubes and TiO₂.

---

## 5. Chemical hazards

**By effect:**

| Class | Mechanism | Examples |
|---|---|---|
| **Simple asphyxiant** | Displaces oxygen; no other toxicity | Nitrogen, argon, helium, methane, CO₂ (also a stimulant at high concentration) |
| **Chemical asphyxiant** | Interferes with oxygen transport or use | **CO** (binds hemoglobin ~200–250× the affinity of O₂ → carboxyhemoglobin), **hydrogen cyanide** (blocks cytochrome oxidase), **hydrogen sulfide** (same, plus olfactory paralysis) |
| **Irritant** | Inflames tissue at the point of contact | Ammonia, chlorine, formaldehyde, acids. **Highly soluble → upper airway (ammonia); poorly soluble → deep lung, delayed pulmonary edema (phosgene, NO₂, ozone)** |
| **Corrosive** | Destroys tissue | Strong acids and bases, HF |
| **Sensitizer** | Immune response on re-exposure, at doses far below the original | Isocyanates (TDI/MDI), latex, epoxies, nickel, western red cedar |
| **Carcinogen** | Causes cancer | Benzene, asbestos, hex chrome, vinyl chloride, silica, formaldehyde |
| **Mutagen** | Damages DNA | Ethylene oxide |
| **Teratogen** | Harms the developing fetus | Lead, mercury, ionizing radiation, some solvents |
| **Reproductive toxin** | Impairs fertility | DBCP, lead, glycol ethers |
| **Hepatotoxin / nephrotoxin / neurotoxin / hematopoietic** | Target organ | Carbon tetrachloride (liver), cadmium (kidney), n-hexane and lead (nerve), benzene (bone marrow) |

**Substances you should recognize on sight:**

| Agent | Target / disease | Notable |
|---|---|---|
| **Crystalline silica** | Silicosis, lung cancer, COPD, kidney | PEL **50 µg/m³** TWA, AL **25 µg/m³** (1926.1153 / 1910.1053). Table 1 specified exposure control methods |
| **Asbestos** | Asbestosis, lung cancer, **mesothelioma** | PEL **0.1 f/cc** 8-hr TWA; **excursion limit 1.0 f/cc over 30 min**. Synergistic with smoking. Classes I–IV work |
| **Lead** | Nervous system, kidney, reproductive, anemia | PEL **50 µg/m³**, AL **30 µg/m³** (1910.1025). Medical removal at a BLL of 60 µg/dL (general industry) / 50 (construction) — verify current, these are under revision |
| **Hexavalent chromium** | Lung cancer, nasal septum perforation, dermatitis | PEL **5 µg/m³**, AL **2.5 µg/m³**. From stainless welding, plating, pigments |
| **Benzene** | **Leukemia**, aplastic anemia | PEL **1 ppm** TWA, **STEL 5 ppm**, AL 0.5 ppm |
| **Carbon monoxide** | Chemical asphyxiant | PEL 50 ppm; IDLH **1,200 ppm**. Colorless, odorless. Propane forklifts indoors |
| **Hydrogen sulfide** | Chemical asphyxiant, respiratory | Rotten-egg odor at low ppm, **olfactory paralysis above ~100 ppm** — the smell disappears as it gets deadly. IDLH 100 ppm |
| **Isocyanates** | Respiratory sensitizer, occupational asthma | Spray foam, coatings. Once sensitized, no safe exposure |
| **Formaldehyde** | Carcinogen, irritant, sensitizer | PEL 0.75 ppm TWA, STEL 2 ppm, AL 0.5 ppm |
| **Methylene chloride** | Metabolized to **CO**; carcinogen | PEL 25 ppm |
| **Beryllium** | Chronic beryllium disease, lung cancer | PEL 0.2 µg/m³, STEL 2.0 µg/m³ |
| **Welding fume** | Metal fume fever (zinc), manganese neurotoxicity | See Domain 4 §4 |

**Basic chemistry the blueprint asks for:** pH scale 0–14, **logarithmic** (pH 3 is 10× more
acidic than pH 4; 100× more than pH 5); acid + base → salt + water (neutralization); ideal
gas law `PV = nRT`; molarity; oxidizers supply oxygen and accelerate combustion; pyrophorics
ignite in air; water-reactives generate heat and/or flammable gas. **Incompatibilities to
know:** acids + bases, acids + cyanides (HCN), acids + sulfides (H₂S), oxidizers +
organics/flammables, **bleach + ammonia (chloramine)**, **bleach + acid (chlorine gas)**,
water + alkali metals/carbides.

---

## 6. Biological hazards

**Categories:** viral · bacterial · fungal (mold) · parasitic · prion.

**Bloodborne pathogens — 1910.1030**, the standard most likely to be tested:

- Covers **HBV, HCV, and HIV**, plus other bloodborne agents
- Applies to occupational exposure to blood and **OPIM** (other potentially infectious
  materials)
- **Written Exposure Control Plan**, reviewed and updated **at least annually** and whenever
  new tasks or procedures affect exposure — and it must **document consideration of safer
  medical devices** and solicit input from **non-managerial employees** who use them
- **Universal precautions**: treat all human blood and OPIM as if infectious. (Standard
  precautions is the broader CDC term)
- Controls hierarchy: engineering (**sharps with engineered injury protection, sharps
  containers, splash guards**) → work practice (no recapping, handwashing, no
  eating/drinking/applying cosmetics in exposure areas) → PPE (gloves, gowns, face
  protection — **employer provides, cleans, repairs, replaces, and disposes at no cost**)
- **HBV vaccination offered free within 10 working days** of assignment; declination must be
  signed on the standard form; the employee may accept later
- **Post-exposure evaluation and follow-up**, confidential, at no cost, including source
  testing where permitted, baseline testing, prophylaxis, counseling, and a written opinion
  to the employee within 15 days
- **Sharps injury log** for employers with 11+ employees; needlesticks from contaminated
  sharps are **always recordable** on the OSHA 300 (as a privacy case, without the employee's
  name)
- Labels: **fluorescent orange or orange-red biohazard symbol**; red bags/containers may
  substitute
- **Training at initial assignment and annually thereafter**
- **Records: training records 3 years; medical records duration of employment + 30 years**

**Other biological agents:**

- **Tuberculosis** — airborne, requires **N95 or better and an airborne infection isolation
  room** (negative pressure, 12 ACH, HEPA-filtered exhaust). A TB conversion is recordable
- **Legionella** — cooling towers, hot water systems, decorative fountains. Control by water
  management plans (ASHRAE 188), temperature control, and biocide
- **Mold** — needs moisture; the control is **fixing the water problem**, not just killing
  the mold. There are no OSHA or EPA numerical exposure limits for mold
- **Hantavirus** — rodent droppings; wet the material, don't sweep or vacuum dry
- **Zoonotic and vector-borne** — Lyme, West Nile, rabies, avian influenza. Long sleeves,
  repellents (DEET/permethrin-treated clothing), tick checks
- **Anthrax, ricin** and other bioterror agents — response is a HAZMAT/law-enforcement
  interface, not an in-house job

---

## 7. Sampling and monitoring

**Personal vs. area:** **personal sampling in the breathing zone is the standard for
comparing to an OEL.** Area sampling characterizes the environment, evaluates controls, and
maps sources, but it does not represent the worker's exposure. Pick personal for compliance
questions, area for control-evaluation questions.

**Sample types:**

| Type | Description |
|---|---|
| **Full-period single sample** | One sample covering the whole shift. Statistically the best |
| **Full-period consecutive** | Several samples covering the whole shift, then time-weighted |
| **Partial-period consecutive** | Covers part of the shift; requires assumptions about the rest |
| **Grab sample** | Short duration, instantaneous. Good for ceiling values, poor for TWAs |
| **Direct-reading instrument** | Real-time. Detector tubes, PIDs, FIDs, CGIs, electrochemical sensors, dataloggers. Ideal for **screening, leak detection, and confined-space entry** |

**Collection media:**

- **Charcoal tube** — non-polar organic vapors (solvents). **Silica gel** — polar compounds
  (alcohols, amines). Both are **sorbent tubes** with a front and a **backup section** — if
  more than ~25% of the analyte is in the backup section, **breakthrough** has occurred and
  the sample is invalid
- **Filters** — **MCE (mixed cellulose ester)** for metals and asbestos/fibers; **PVC** for
  respirable dust and silica (gravimetric); PTFE for high-temperature and some organics
- **Cyclone** pre-selector for the respirable fraction, operated at a specified flow rate
  (the flow rate *is* the size selection — a wrong flow rate invalidates it)
- **Impingers** — liquid media for reactive gases; increasingly replaced
- **Passive dosimeters/badges** — diffusion-based, no pump. Simple, but sensitive to face
  velocity and interferences
- **Noise dosimeters** and sound level meters (Type 1 precision, Type 2 general purpose)

**Calibration:** calibrate pumps **before and after** each sampling period with the sampling
train assembled, using a **primary standard** (a soap-bubble/frictionless piston meter) or a
calibrated secondary standard. If pre/post flow rates differ by more than ~5%, the sample is
suspect; average the two if within tolerance.

**QA elements:** field blanks and media blanks, chain of custody, **AIHA-LAP accredited
laboratory**, documented sampling strategy, and a record of what the worker actually did
that day. Report **limit of detection (LOD)** and **limit of quantitation (LOQ)** for
non-detects.

**Sampling strategy:** define **similar exposure groups (SEGs)** by job, task, agent, and
environment; sample the **maximum-risk worker** (the OSHA approach) or a random sample of the
SEG (the statistical approach); take enough samples to characterize the **95th percentile**
of the lognormal distribution — one sample supports no conclusion.

---

## 8. Control strategies

**Hierarchy applied to IH:**

1. **Elimination/substitution** — replace the solvent, change the process (water-based coatings
   for solvent-based, wet methods for dry cutting)
2. **Engineering** — **isolation/enclosure**, **local exhaust ventilation** (capture at the
   source — always better than dilution), general/dilution ventilation, wet methods,
   automation, process modification, HEPA filtration, and **increasing distance**
3. **Administrative** — rotation, scheduling high-exposure work when fewer people are present,
   housekeeping, hygiene facilities (change rooms, showers, no eating in work areas),
   training
4. **PPE** — respirators, gloves, protective clothing, eye protection

**LEV beats dilution whenever the contaminant is highly toxic, generated at a point, or
generated in large quantity.** Dilution ventilation is only appropriate for low-toxicity
contaminants generated uniformly at low rates far from workers. That comparison is a
guaranteed question. Ventilation math is in the math file.

**LEV system components:** hood → duct → **air cleaner** → fan → stack. The hood is where
the system succeeds or fails; a properly designed hood as close to the source as possible is
the whole ballgame. Provide **replacement (make-up) air** — an exhaust system without make-up
air starves itself and can backdraft combustion appliances.

### Respiratory protection — 1910.134

**Required program elements:** written program with worksite-specific procedures ·
**program administrator** · respirator selection based on the hazard evaluation · **medical
evaluation before fit testing and use** (OSHA questionnaire or equivalent exam) · **fit
testing before initial use, whenever a different facepiece is used, and at least annually** ·
proper use including seal checks · cleaning/disinfecting/storage/inspection/repair · air
quality for supplied air (**Grade D breathing air**) · training before use and annually ·
program evaluation · recordkeeping.

**Assigned Protection Factors (Table 1, 1910.134):**

| Respirator | APF |
|---|---|
| Filtering facepiece / half mask APR | **10** |
| Full facepiece APR | **50** |
| PAPR, half mask | 50 |
| PAPR, loose-fitting facepiece or hood/helmet | **25** (or **1,000** with a manufacturer-demonstrated hood/helmet) |
| PAPR, full facepiece or tight-fitting hood | **1,000** |
| Supplied air, demand, half mask | 10 |
| Supplied air, demand, full facepiece | 50 |
| Supplied air, continuous flow or pressure demand, half mask | 50 |
| Supplied air, continuous flow, full facepiece | 1,000 |
| Supplied air, pressure demand, full facepiece | 1,000 |
| **SCBA, pressure demand, full facepiece** | **10,000** |
| SCBA, demand, full facepiece | 50 |

`MUC = APF × OEL`. **Never use an APR in an IDLH or oxygen-deficient atmosphere** — IDLH
requires a **full-facepiece pressure-demand SCBA** with at least 30 minutes of service, or a
combination supplied-air respirator with an auxiliary escape SCBA. This overrides the math.

**Filter designations (42 CFR 84):** **N** not oil-resistant · **R** oil-resistant (single
shift) · **P** oil-proof. Efficiencies **95, 99, 100** (99.97%). So an N95 is 95% efficient
against non-oil aerosols. **HEPA = 99.97% at 0.3 µm** (the most-penetrating particle size —
larger *and* smaller particles are captured more efficiently, which is counterintuitive and
tested).

**Cartridge color codes (a partial list worth knowing):** acid gas **white**, organic vapor
**black**, ammonia **green**, CO **blue**, HEPA/particulate **magenta**, combination organic
vapor + acid gas **yellow**.

**Change schedules** are required for gas/vapor cartridges unless the cartridge has an
**End-of-Service-Life Indicator (ESLI)**. Odor/taste warning is **not** an acceptable basis
under the current standard.

**Fit testing:** **qualitative (QLFT)** — pass/fail using a challenge agent the wearer
detects (saccharin, Bitrex, irritant smoke, isoamyl acetate). Only valid for APFs ≤10.
**Quantitative (QNFT)** — measures the actual fit factor with an instrument (PortaCount).
Required for tight-fitting respirators used at APFs >10. **A fit factor of at least 100 for
half masks and 500 for full facepieces.**

**Facial hair that crosses the sealing surface disqualifies a tight-fitting respirator** —
no exceptions, no matter how it's trimmed. A loose-fitting PAPR is the accommodation.

**Voluntary use** of filtering facepieces requires only **Appendix D** be provided;
voluntary use of any other respirator still requires medical evaluation and cleaning/storage
provisions.

---

## 9. Medical surveillance, fitness for duty, and return to work

**Medical surveillance** — ongoing evaluation of workers exposed to specific hazards, aimed
at early detection of disease and program evaluation. Substance-specific standards mandate
it (lead, asbestos, silica, cadmium, benzene, hex chrome, noise, respirators, HAZWOPER).
Elements: baseline/pre-placement exam, periodic exams, biological monitoring, exit exam,
and a **written physician's opinion** to the employer that contains **only** work
restrictions and whether the employee was informed — **not the diagnosis**. That
confidentiality boundary is tested.

**Surveillance vs. screening:** *surveillance* is population-level, aimed at the program;
*screening* is individual-level, aimed at the person's health. Both use the same tests.

**Fitness for duty / return to work:**

- **Post-offer, pre-placement exams** are permitted under the ADA only **after a
  conditional offer**, must be **job-related and consistent with business necessity**,
  and must be applied to **all entrants in the same job category**
- **Essential functions** must be documented (a job description written before the posting
  is the ADA-relevant evidence) and the analysis drives whether a **reasonable accommodation**
  exists
- **Direct threat** — a significant risk of substantial harm that cannot be eliminated by
  reasonable accommodation — is the only basis for exclusion, and it requires an
  individualized assessment on current medical evidence
- **Transitional / modified duty** returns employees sooner, reduces claim cost, and improves
  outcomes. Meaningful work, time-limited, with defined restrictions and a defined end
- **Stay-at-work** beats return-to-work: modify the job before the person leaves it
- **Medical removal protection** exists in several standards (lead, cadmium, benzene) and
  requires the employer to maintain earnings and benefits during removal — that's what makes
  it distinctive

**Confidentiality:** medical records are separate from personnel files, disclosed only as
permitted. **29 CFR 1910.1020** gives employees and their designated representatives access
to their own exposure and medical records, and requires retention of **exposure records for
30 years** and **medical records for the duration of employment plus 30 years**. Employers
have **15 working days** to provide access.

---

## 10. Total Worker Health®

**A NIOSH approach: policies, programs, and practices that integrate protection from
work-related hazards with promotion of injury and illness prevention efforts to advance
worker well-being.**

The defining feature — and the exam's point — is **integration**: TWH is *not* a wellness
program bolted onto a safety program. It puts the hazardous conditions of work first and
rejects the idea that individual behavior change substitutes for a safe workplace.

**The NIOSH hierarchy of controls applied to TWH** (from most to least effective):

1. **Eliminate** working conditions that threaten safety, health, and well-being
2. **Substitute** health-enhancing policies and practices for those that harm
3. **Redesign** the work environment for well-being
4. **Educate** for safety and health
5. **Encourage** personal change

Note that "encourage personal change" — where most wellness programs live — is **last**.

**Issue areas:** control of hazards and exposures · organization of work (workload, job
design, staffing, shift work, work-life fit) · built environment · leadership · compensation
and benefits · community supports · changing workforce demographics · new employment
patterns (gig, contract, temporary) · policy issues.

---

## 20 things they actually ask — Domain 6

1. Anticipate–Recognize–Evaluate–Control (–Confirm)
2. **PEL is enforceable; TLV and REL are not**
3. STEL = **15 minutes**, ≤4×/day, ≥60 minutes apart
4. Ceiling = never exceeded, instantaneous
5. Excursion limit: 3× the TLV for ≤30 min, never above 5×
6. Action level is typically **50% of the PEL**
7. Extended-shift adjustment; a 12-hour shift halves the limit
8. Inhalation is the primary route; **skin notation** means air sampling underestimates dose
9. Synergism (asbestos + smoking) vs. potentiation vs. additivity
10. Lower LD₅₀ = more toxic
11. Respirable = **4 µm** cut point, reaches the alveoli
12. Hearing conservation triggers at **85 dBA** (AL); controls required at 90 (PEL)
13. STS = **10 dB average shift at 2, 3, and 4 kHz**; the audiogram shows a **4 kHz notch**
14. Alpha is only an internal hazard, but **Q = 20**
15. Time–distance–shielding, ALARA, and shielding beta with plastic before lead
16. **APFs**: half-mask 10, full-facepiece APR 50, pressure-demand SCBA 10,000
17. `MUC = APF × OEL`, but **never an APR in IDLH**
18. Fit test **annually**; facial hair on the sealing surface disqualifies
19. **LEV beats dilution ventilation** for toxic, point-source contaminants
20. Bloodborne: universal precautions, HBV vaccine within **10 working days**, ECP reviewed
    **annually**, medical records **duration of employment + 30 years**
