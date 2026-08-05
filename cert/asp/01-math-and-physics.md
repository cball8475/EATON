# Domain 1 — Mathematical Calculations (10%)

~18 scored items as a domain, but the same math reappears inside Domains 2, 4, and 6. Treat
this as the engine file for the whole exam.

Blueprint items: storage capacity · rigging/load · flow rates · trenching slope · noise ·
climate · fall protection · lagging indicators · NIOSH lifting · general physics ·
descriptive statistics · probability of failure · financial indicators · exposure
assessment · radiation · unit conversions.

---

## 1. Unit conversions — get these free

The exam buries conversions inside other problems. If you lose the conversion you lose the
question even with perfect method.

| Quantity | Conversions to know cold |
|---|---|
| Length | 1 in = 2.54 cm · 1 ft = 0.3048 m · 1 m = 3.281 ft · 1 mi = 5,280 ft = 1.609 km |
| Area | 1 ft² = 144 in² · 1 acre = 43,560 ft² |
| Volume | 1 ft³ = 7.48 gal = 28.32 L · 1 gal = 3.785 L = 231 in³ · 1 L = 1,000 cm³ · 1 pint = 473 cm³ |
| Mass | 1 lb = 453.6 g = 0.4536 kg · 1 kg = 2.205 lb · 1 ton = 2,000 lb · 1 tonne = 1,000 kg |
| Force | 1 lbf = 4.448 N · 1 kgf = 9.81 N |
| Pressure | 1 atm = 14.7 psi = 760 mmHg (torr) = 101.3 kPa = 29.92 in Hg = 407 in w.g. |
| Energy | 1 BTU = 1,055 J = 252 cal · 1 kWh = 3,412 BTU · 1 cal = 4.184 J |
| Power | 1 hp = 746 W = 550 ft·lb/s · 1 W = 1 J/s |
| Density of water | 62.4 lb/ft³ · 1 g/cm³ · 8.34 lb/gal |
| Temperature | °F = 1.8(°C) + 32 · K = °C + 273.15 · °R = °F + 459.67 |
| Radiation | 1 Gy = 100 rad · 1 Sv = 100 rem · 1 Ci = 3.7 × 10¹⁰ Bq |
| Concentration | 1% = 10,000 ppm · 1 ppm = 1,000 ppb |

**The one that gets people:** "1% = 10,000 ppm." LEL questions and gas-meter questions both
lean on it. 10% of the LEL of methane (LEL 5%) is 0.5% by volume = 5,000 ppm.

**Water weight shortcut:** a cubic foot of water weighs 62.4 lb and holds 7.48 gal. Storage
capacity questions ("how many gallons in a 6-ft-diameter, 10-ft-tall tank, and what does it
weigh?") are two-step: volume in ft³ → gallons → pounds.

### Worked: storage capacity

A vertical cylindrical tank, 8 ft inside diameter, 12 ft tall, filled to 10 ft with a
liquid of specific gravity 1.2. Capacity in gallons and weight of contents?

```
V = πr²h = π(4)²(10) = 502.65 ft³
gal = 502.65 × 7.48 = 3,759.8 gal
wt  = 502.65 ft³ × 62.4 lb/ft³ × 1.2 = 37,638 lb
```

Secondary containment sizing: the dike must hold the **largest single tank**, plus
freeboard for precipitation (EPA SPCC: "sufficient freeboard"; common practice adds the
25-yr/24-hr storm). Dike volume = area × height **minus** the volume displaced by the other
tanks sitting inside it. That subtraction is the trick.

---

## 2. Lagging indicators — incidence rates

**The base number is 200,000** = 100 full-time employees × 40 hr/wk × 50 wk/yr. Memorize
this. It is not given.

```
Rate = (N × 200,000) / EH
```

- `N` = number of cases of the type being measured
- `EH` = total hours **actually worked** by all employees in the period (not scheduled; no
  vacation, holidays, or sick leave)

| Rate | N is… |
|---|---|
| **TRIR / TCIR** (total recordable) | all OSHA-recordable cases |
| **DART** | cases with days away, restricted, **or** transfer |
| **LTC / DAFW rate** | cases with days away from work only |
| **Severity rate** | total lost **days** (not cases) |
| **Fatality rate** | fatalities (per 100,000 workers, or use 200,000,000 hrs for per-100k FTE) |

Other bases you may see: **1,000,000 hours** (used by many international/insurance metrics
and by ANSI Z16.1 historically) and **1,000 employees**. If the stem gives a base, use the
stem's base.

### Worked

A plant worked 1,250,000 hours. It had 14 recordable cases; 6 of those had days away, 3 had
restricted duty; 210 total days away were charged.

```
TRIR = (14 × 200,000) / 1,250,000 = 2.24
DART = (9 × 200,000) / 1,250,000 = 1.44        ← 6 away + 3 restricted
LTC  = (6 × 200,000) / 1,250,000 = 0.96
Sev  = (210 × 200,000) / 1,250,000 = 33.6
```

**Reverse the formula.** They love this: "How many recordables can a site with 450,000 hours
have and still hit a TRIR of 1.0?"

```
N = (Rate × EH) / 200,000 = (1.0 × 450,000)/200,000 = 2.25 → 2 cases
```

Two, not three — 3 cases puts you at 1.33. Round **toward compliance**, not by the .5 rule.

### Estimating hours when they don't give you hours

`EH ≈ employees × 2,000 hr/yr` for full-time. Adjust for overtime or part-time if the stem
says so. If the stem gives "average 45 hr/wk for 48 weeks," use 45 × 48 = 2,160.

### What counts (Domain 2 knowledge, Domain 1 math)

Recordable if work-related and results in: death · days away · restricted work or transfer ·
medical treatment beyond first aid · loss of consciousness · significant injury/illness
diagnosed by a physician or other licensed health care professional. Plus the special cases:
needlesticks with contaminated sharps, TB conversion, medical removal, and standard-threshold
hearing shift with 25 dB average.

**First aid (not recordable), the closed list:** OTC meds at OTC strength · tetanus
immunization · cleaning/flushing/soaking surface wounds · bandages/butterfly/Steri-Strips ·
hot or cold therapy · non-rigid support (elastic bandage) · temporary immobilization for
transport · drilling a nail to relieve pressure or draining a blister · eye patches ·
removing foreign bodies from the eye by irrigation or cotton swab · removing splinters by
tweezers/irrigation · finger guards · massage · drinking fluids for heat stress.

Anything else — prescription meds (even one dose), sutures, rigid splints, IV fluids — is
medical treatment and therefore recordable.

---

## 3. Financial indicators

| Metric | Formula | Note |
|---|---|---|
| ROI | `(Gain − Cost) / Cost × 100` | Some stems use `Net benefit / Cost` |
| Payback period | `Initial cost / Annual savings` | Years. Ignores time value |
| Benefit-cost ratio | `PV of benefits / PV of costs` | >1.0 = justified |
| Future value | `FV = PV(1 + i)ⁿ` | Compound growth |
| Present value | `PV = FV / (1 + i)ⁿ` | Discounting a single future amount |
| PV of an annuity | `PV = A × [1 − (1+i)⁻ⁿ] / i` | Equal payments each year |
| NPV | `Σ [Cashflowₜ / (1+i)ᵗ] − Initial cost` | >0 = accept |
| Sales to offset a loss | `Loss / Profit margin` | The safety-sells argument |
| Loss ratio | `Losses paid / Premiums earned` | Insurance |
| EMR (experience mod) | `Actual losses / Expected losses` | 1.0 = average; <1.0 = better than peers |

**Sales-to-offset is the classic ASP question.** A $75,000 loss at a 5% profit margin
requires `75,000 / 0.05 = $1,500,000` in additional sales to break even. The point of the
question is the magnitude, and the answer choices always include $3,750 (the margin on the
loss) as a distractor.

**Direct vs. indirect costs.** Heinrich's 1:4 ratio (indirect = 4× direct) is the classic;
modern estimates run 1:1 to 1:20 depending on severity — OSHA's $afety Pays uses a sliding
scale. If the stem gives a ratio, use it. If it doesn't and asks for the "traditional"
ratio, it wants 4:1. **Total cost = direct + indirect = direct × (1 + ratio).**

**Life-cycle cost** = acquisition + operating + maintenance + disposal, discounted. The
Prevention-through-Design argument: controls installed at design cost a fraction of controls
retrofitted. Know the concept for Domain 2, the discounting for here.

### Worked

A $60,000 machine guard is expected to prevent one $95,000 injury every 4 years. Company
discount rate 8%. 10-year horizon. Simple payback and BCR?

```
Annual benefit = 95,000 / 4 = $23,750
Payback = 60,000 / 23,750 = 2.53 years
PV of benefits = 23,750 × [1 − 1.08⁻¹⁰]/0.08 = 23,750 × 6.7101 = $159,365
BCR = 159,365 / 60,000 = 2.66  → justified
```

---

## 4. Descriptive statistics and probability

### Central tendency and spread

- **Mean** `x̄ = Σx / n` — sensitive to outliers
- **Median** — middle value; even n → average the two middle values. Use for skewed data
- **Mode** — most frequent; a dataset can be bimodal or have no mode
- **Range** = max − min
- **Variance**: sample `s² = Σ(x − x̄)² / (n − 1)` · population `σ² = Σ(x − µ)² / N`
- **Standard deviation** = √variance
- **Coefficient of variation** `CV = s / x̄ × 100%` — compares spread across different units.
  In IH sampling, CV is the measure of method precision (NIOSH methods target CV ≤ 0.05).

**n − 1 vs n is a real exam distinction.** Sample → `n − 1` (Bessel's correction). Population
→ `n`. The stem will say "a sample of" or "all of." On the TI-30XS, `Sx` is the sample SD
and `σx` is the population SD — pick the right one off the stat menu.

### Normal distribution

- 68% within ±1σ · 95% within ±2σ (precisely 1.96) · 99.7% within ±3σ
- z-score: `z = (x − µ) / σ`
- Occupational exposure data is **lognormal**, not normal. Take the log first, then it's
  normal. Hence **geometric mean** and **geometric standard deviation** in IH:
  `GM = antilog(Σ log xᵢ / n)`, and a GSD of 1.0 means zero variability.

### Probability rules

| Rule | Formula |
|---|---|
| Independent AND (both) | `P(A ∩ B) = P(A) × P(B)` |
| Mutually exclusive OR | `P(A ∪ B) = P(A) + P(B)` |
| Non-exclusive OR | `P(A ∪ B) = P(A) + P(B) − P(A ∩ B)` |
| Complement (at least one) | `P(≥1) = 1 − P(none)` |
| Conditional | `P(A\|B) = P(A ∩ B) / P(B)` |
| Permutations (order matters) | `ₙPᵣ = n! / (n − r)!` |
| Combinations (order doesn't) | `ₙCᵣ = n! / [r!(n − r)!]` |

**"At least one" always means `1 − P(none)`.** If a device fails 2% of the time and you use
5 independent devices, the probability at least one fails is `1 − 0.98⁵ = 1 − 0.9039 = 0.0961`.

### Reliability and probability of failure mode

| System | Reliability |
|---|---|
| Series (all must work) | `R = R₁ × R₂ × … × Rₙ` — always **lower** than the weakest link |
| Parallel / redundant (any one works) | `R = 1 − (1−R₁)(1−R₂)…(1−Rₙ)` |
| Exponential (constant failure rate) | `R(t) = e^(−λt)` where `λ = 1/MTBF` |
| MTBF | `Total operating time / number of failures` |
| Availability | `MTBF / (MTBF + MTTR)` |

**Fault tree gates map directly onto this.** An **AND** gate = parallel = multiply the
input probabilities (all must occur). An **OR** gate = series = `1 − Π(1 − Pᵢ)`, which for
small probabilities approximates the sum. Getting AND/OR backwards is the single most
common fault-tree error on this exam.

### Worked: fault tree

Top event occurs if (Sensor fails **AND** backup fails) **OR** operator error occurs.
P(sensor) = 0.05, P(backup) = 0.10, P(operator) = 0.02.

```
AND branch: 0.05 × 0.10 = 0.005
OR with operator: 1 − (1 − 0.005)(1 − 0.02) = 1 − (0.995)(0.98) = 1 − 0.9751 = 0.0249
```

≈ 2.5%. The rough-sum approximation (0.005 + 0.02 = 0.025) is close enough to pick the
answer, but use the exact form when the probabilities are large.

### FMEA risk priority number

`RPN = Severity × Occurrence × Detection`, each rated 1–10, so RPN ranges 1–1,000. Higher =
worse. **Detection is inverted** — a 10 means you're unlikely to detect it. That inversion
is a favorite trick.

---

## 5. Noise

### The exchange rate is the whole game

| | OSHA (29 CFR 1910.95) | ACGIH TLV |
|---|---|---|
| Criterion level | 90 dBA for 8 hr (PEL) | 85 dBA for 8 hr |
| Action level | 85 dBA TWA (hearing conservation program) | — |
| Exchange rate | **5 dB** | **3 dB** |
| Ceiling | 115 dBA (no exposure above); 140 dB peak impulse | 140 dBC peak |

**Permissible duration**

```
OSHA:  T = 8 / 2^((L − 90)/5)
ACGIH: T = 8 / 2^((L − 85)/3)
```

**Dose**

```
D(%) = 100 × (C₁/T₁ + C₂/T₂ + … + Cₙ/Tₙ)
```

`C` = actual hours at that level, `T` = permissible hours at that level. Dose > 100% =
overexposure.

**Dose → TWA**

```
TWA = 16.61 × log₁₀(D/100) + 90        (OSHA, 5 dB)
TWA = 10 × log₁₀(D/100) + 85           (ACGIH, 3 dB)
```

The 16.61 constant is `5 / log₁₀2`. It will usually be given, but know that it pairs with
the OSHA 5-dB rule and 90 — never mix it with 85.

### Worked: full noise problem

A press operator: 3 hr at 95 dBA, 4 hr at 88 dBA, 1 hr at 102 dBA. OSHA dose and TWA?

```
T₉₅  = 8 / 2^((95−90)/5)  = 8/2¹    = 4 hr
T₈₈  = 8 / 2^((88−90)/5)  = 8/2^-0.4 = 8/0.7579 = 10.56 hr
T₁₀₂ = 8 / 2^((102−90)/5) = 8/2^2.4  = 8/5.278  = 1.516 hr

D = 100 × (3/4 + 4/10.56 + 1/1.516)
  = 100 × (0.750 + 0.379 + 0.660) = 178.9%

TWA = 16.61 × log(178.9/100) + 90 = 16.61 × 0.2527 + 90 = 94.2 dBA
```

Over the 100% dose limit and over the 90 dBA PEL → engineering/administrative controls
required, hearing protection, and the employee is already in the hearing conservation
program (which triggers at 50% dose / 85 dBA TWA).

### Combining sound levels (decibels don't add)

```
L_total = 10 × log₁₀( 10^(L₁/10) + 10^(L₂/10) + … )
```

Shortcuts that beat the calculator:

| Difference between two levels | Add to the higher |
|---|---|
| 0–1 dB | +3 |
| 2–3 dB | +2 |
| 4–9 dB | +1 |
| ≥10 dB | +0 (ignore the quieter source) |

**Two identical machines = +3 dB, not double.** Ten identical machines = +10 dB. This is
Domain 1's "dual machinery" bullet.

### Distance

Point source, free field: `L₂ = L₁ − 20 log₁₀(d₂/d₁)` → **−6 dB per doubling of distance.**
Line source (a highway, a long pipe): **−3 dB per doubling.**

### Hearing protector attenuation (NRR)

```
Estimated protected exposure (dBA) = TWA(dBA) − (NRR − 7)
OSHA's additional 50% derate for comparing to the PEL:
   protected = TWA − [(NRR − 7) × 0.5]
Dual protection (plug + muff): add 5 dB to the higher NRR, then derate
```

The `−7` corrects for the C-weighted lab measurement being applied to A-weighted field
noise. If the stem gives dBC, don't subtract 7.

**Worked:** TWA 98 dBA, muff NRR 25, using OSHA's 50% derate:
`98 − [(25 − 7) × 0.5] = 98 − 9 = 89 dBA` → under the PEL, still above the action level.

---

## 6. Fall protection math

### Total fall distance

```
TFD = Free fall distance
    + Deceleration distance
    + Harness stretch / D-ring shift
    + Height of worker below D-ring (~5 ft to feet)
    + Safety factor (commonly 2–3 ft)
```

Regulatory caps (1910.140 / 1926.502):

| Parameter | Personal fall arrest limit |
|---|---|
| Maximum free fall | **6 ft** (and never contact a lower level) |
| Maximum deceleration distance | **3.5 ft** |
| Maximum arresting force, body harness | **1,800 lbf** |
| Maximum arresting force, body belt (banned for arrest) | 900 lbf |
| Anchorage strength | **5,000 lb** per employee, **or** 2× the maximum arresting force under a qualified person's design (safety factor of 2) |
| Rescue | "Prompt rescue" required |

**Worked:** 6-ft shock-absorbing lanyard, anchored at the D-ring level, worker 6 ft tall
with D-ring at 5 ft. Clearance needed?

```
Free fall               6.0 ft
Deceleration            3.5 ft
D-ring shift/stretch    1.0 ft
Worker below D-ring     5.0 ft
Safety factor           2.0 ft
                       ------
Total                  17.5 ft
```

A 6-ft lanyard on a 15-ft platform doesn't work. This is why SRLs (typically 2 ft of
deceleration, near-zero free fall) exist, and it is a classic exam answer.

Anchoring **above** the D-ring reduces free fall; anchoring at foot level can give 12 ft of
free fall with a 6-ft lanyard — over the limit before the deceleration device even engages.

### Force of impact

Energy method (the one they usually intend):

```
F = W(h + d) / d
```

where `W` = weight, `h` = free-fall distance, `d` = stopping (deceleration) distance. If the
stem ignores the extra `d` of travel during deceleration, `F = Wh/d` is the simplified form.

**Worked:** 220-lb worker, 6-ft free fall, deceleration device stops him in 3.5 ft.

```
F = 220(6 + 3.5)/3.5 = 220 × 2.714 = 597 lbf
```

Well under the 1,800-lbf limit. Now with a non-shock-absorbing lanyard stopping in 0.5 ft:
`F = 220(6.5)/0.5 = 2,860 lbf` — over the limit. That contrast *is* the question.

Impulse-momentum form: `F = m Δv / Δt`. Free-fall velocity at impact: `v = √(2gh)` with
`g = 32.2 ft/s²`.

**Worked:** falling 6 ft → `v = √(2 × 32.2 × 6) = √386.4 = 19.66 ft/s`.

---

## 7. Trenching and excavation

| Soil type | Max slope (H:V) | Angle from horizontal |
|---|---|---|
| Stable rock | Vertical | 90° |
| **Type A** | ¾ : 1 | **53°** |
| **Type B** | 1 : 1 | **45°** |
| **Type C** | 1½ : 1 | **34°** |

Type A ≥ 1.5 tsf unconfined compressive strength; Type B 0.5–1.5 tsf; Type C ≤ 0.5 tsf
(including submerged soil or soil with water freely seeping).

Other 1926 Subpart P numbers:

- Protective system required at **5 ft** deep (unless in stable rock and a competent person
  finds no cave-in potential)
- **20 ft** deep → protective system must be designed by a registered professional engineer
- Ladder/ramp/stairway within **25 ft of lateral travel** in trenches **4 ft** or deeper
- Spoil piles and equipment kept **2 ft** minimum from the edge
- Daily inspection by a **competent person**, before each shift and after rain
- Atmospheric testing required in excavations **>4 ft** where hazardous atmosphere could exist

**Worked:** Type B soil, trench 12 ft deep, 4 ft wide at the bottom. Total width at the top?

```
Slope 1:1 → horizontal run each side = 12 ft
Top width = 4 + 12 + 12 = 28 ft
```

**Benching**: Type A allows benching; Type B allows benching only with specific
configurations; **Type C cannot be benched** — slope it or shore/shield it.

---

## 8. Rigging and load calculations

### Sling tension

```
T = (Load / n) × (L / H)          n = number of legs
T = (Load / n) / sin θ            θ = angle from horizontal
```

`L` = sling length, `H` = vertical height from load to hook.

**Sling angle factors** (multiply the per-leg share by these):

| Angle from horizontal | Tension factor |
|---|---|
| 90° | 1.000 |
| 60° | 1.155 |
| 45° | 1.414 |
| **30°** | **2.000** |
| 15° | 3.86 |

**30° doubles the tension.** Below 30° is generally prohibited by rigging practice. The
smaller the angle, the higher the tension — geometry, not intuition.

**Worked:** 8,000-lb load, two-leg bridle at 45°.

```
Per leg vertical share = 8,000 / 2 = 4,000 lb
Tension = 4,000 × 1.414 = 5,657 lb per leg
```

Two 5,000-lb-rated slings are **not** adequate. That's the answer they want.

### Other rigging numbers

- **Design factor** (safety factor): 5:1 for slings and rigging hardware; 10:1 for hooks
  and for equipment used to lift personnel
- `Working load limit = Breaking strength / Design factor`
- **D/d ratio**: the ratio of the pin/drum diameter `D` to the rope diameter `d`; a low D/d
  sharply reduces sling capacity
- **Center of gravity**: the hook must be directly above the CG or the load tilts
- **Choker hitch** reduces capacity to ~75–80% of vertical rating; **basket hitch** at 90°
  doubles it (2×) but only when the legs are vertical
- **Critical lift** definitions vary by site; commonly >75% of crane capacity, tandem
  lifts, or lifts over occupied areas

### Crane load and stability

```
Load moment = Load × radius
Tipping occurs when load moment > resisting moment
Rated capacity = a % of tipping load (75% for mobile cranes on outriggers, 85% for
                 crawlers, 66⅔% on rubber tires per ASME B30.5)
```

**Powered industrial truck stability** uses the same idea:

```
Load × distance from front axle to load CG  ≤  Counterweight × distance to rear
Capacity at a longer load center = (rated capacity × rated load center) / actual load center
```

**Worked:** A truck rated 5,000 lb at a 24-in load center. Capacity at a 36-in load center?
`(5,000 × 24)/36 = 3,333 lb`. Attachments and lift height reduce it further — always check
the **data plate**.

---

## 9. Flow rates and ventilation

### Basic flow

```
Q = V × A
```

`Q` = cfm, `V` = velocity in fpm, `A` = duct/opening area in ft². A 12-in round duct is
`A = π(0.5)² = 0.785 ft²`.

**Velocity from velocity pressure** (standard air, 70°F, 0.075 lb/ft³):

```
V = 4005 √VP        (V in fpm, VP in inches of water gauge)
TP = SP + VP        Total = Static + Velocity pressure
```

**Capture velocities** (ACGIH):

| Condition | Capture velocity (fpm) |
|---|---|
| Released with no velocity into quiet air (evaporation from a tank) | 50–100 |
| Released at low velocity into moderately still air (spray booth, welding) | 100–200 |
| Active generation into rapid air motion (crushing, conveyor transfer) | 200–500 |
| Released at high velocity into very rapid air motion (grinding, abrasive blast) | 500–2,000 |

**Transport (duct) velocities:** vapors/gases 1,000–2,000 fpm · fumes 2,000–2,500 ·
average industrial dust 3,500–4,000 · heavy dust 4,000–4,500. Too low and dust drops out of
the duct; too high wastes energy and erodes elbows.

### Hood flow

```
Plain (unflanged) opening:  Q = V(10X² + A)
Flanged opening:            Q = 0.75 V(10X² + A)   ← flange saves 25% of the air
Booth:                      Q = V × A (face area)
Canopy hood:                Q = 1.4 × P × H × V    (P = perimeter, H = height above source)
```

`X` = distance from hood face to the contaminant source. Note the `X²` — **doubling the
distance quadruples the airflow required.** That's why "move the hood closer" is almost
always the right answer.

### Dilution ventilation

Steady-state for a liquid evaporating (ACGIH form):

```
Q(cfm) = (403 × SG × ER × K × 10⁶) / (MW × C)
```

- `403` = ft³ of vapor per pint of liquid at 70°F, 1 atm, per unit SG/MW
- `SG` = specific gravity of the liquid, `ER` = evaporation rate in **pints per minute**
- `MW` = molecular weight, `C` = desired concentration in **ppm**
- `K` = mixing factor, 1 (perfect mixing) to 10 (poor mixing). Typically 3–10 in practice

**Purge / decay** (no continuing generation):

```
t = −(V/Q) × ln(C₂/C₁)
```

**Buildup** toward steady state:

```
C(t) = (G/Q)(1 − e^(−Qt/V))
```

**Air changes per hour:** `ACH = (Q × 60) / V_room`. Rearranged, `Q = (ACH × V)/60`.

**Worked:** A 20,000 ft³ room has a contaminant at 800 ppm. Ventilation supplies 4,000 cfm
of clean air, mixing factor 1. How long to reach 50 ppm?

```
t = −(20,000/4,000) × ln(50/800) = −5 × ln(0.0625) = −5 × (−2.7726) = 13.9 minutes
```

With a mixing factor K = 3, the effective Q is Q/K = 1,333 cfm → 41.6 minutes.

---

## 10. Climate and environmental conditions

### Heat stress — WBGT

```
Indoors, or outdoors with no solar load:  WBGT = 0.7 NWB + 0.3 GT
Outdoors with solar load:                 WBGT = 0.7 NWB + 0.2 GT + 0.1 DB
```

`NWB` = natural wet bulb, `GT` = globe temperature, `DB` = dry bulb (ordinary air temp).
Natural wet bulb carries the **largest weight in both** — humidity dominates heat stress.
The indoor equation has **no dry-bulb term at all**; that omission is a favorite distractor.

**Clothing adjustment factors** are added to the measured WBGT before comparing to the TLV
(e.g., +2°C for cloth coveralls, +4 for double-layer, +10 for vapor-barrier suits).

ACGIH screening TLV (acclimatized, light work, 100% work): 30.0 °C WBGT; moderate 28.0;
heavy 26.0. Unacclimatized values run ~2.5–3 °C lower. Work-rest regimens reduce the
required WBGT as the work fraction rises.

**Heat illness escalation:** heat rash → heat cramps → heat syncope → **heat exhaustion**
(sweating, cool clammy skin, normal-to-slightly-elevated temp — treat with rest, fluids,
cooling) → **heat stroke** (hot dry *or* wet skin, confusion, core temp >104 °F, **medical
emergency**, call 911 and cool aggressively). The exam tests the exhaustion/stroke
distinction more than any formula.

**Acclimatization**: 20% exposure on day 1, increasing ~20%/day, 4–7 days for new workers
(NIOSH: 5 days for experienced-but-returning). Loss begins after ~4 days away.

### Cold

- **Wind chill** — formula will be given. Concept: wind increases convective heat loss;
  wind chill does not lower the actual air temperature, so it doesn't freeze water faster,
  only exposed skin.
- **Frostbite risk** rises sharply below −18 °C (0 °F) equivalent wind chill; frostbite in
  under 5 minutes at roughly −32 °C wind chill.
- **Hypothermia**: shivering (mild) → loss of shivering, confusion, slurred speech
  (moderate/severe — a medical emergency, and the stopped shivering is the danger sign, not
  a good sign).
- **Trench foot** occurs at temperatures well above freezing (up to ~60 °F) with wet feet.
- ACGIH TLV work/warm-up schedules key off air temperature **and** wind speed.

---

## 11. NIOSH lifting equation

```
RWL = LC × HM × VM × DM × AM × FM × CM
LI  = Load weight / RWL
```

| Term | Formula (inches) | Formula (cm) | Notes |
|---|---|---|---|
| **LC** load constant | **51 lb** | 23 kg | Fixed. Memorize |
| **HM** horizontal | 25/H | 25/H | H measured from the ankle midpoint to hand grasp. HM = 0 if H > 25 in |
| **VM** vertical | 1 − 0.0075\|V − 30\| | 1 − 0.003\|V − 75\| | Optimum at 30 in (knuckle height); VM = 0 above 70 in |
| **DM** distance | 0.82 + 1.8/D | 0.82 + 4.5/D | D = vertical travel. DM = 1 if D < 10 in; DM = 0 if D > 70 in |
| **AM** asymmetric | 1 − 0.0032A | same | A in degrees of twist. AM = 0 if A > 135° |
| **FM** frequency | Table | Table | Lifts/min, duration, and V above/below 30 in |
| **CM** coupling | Table | Table | Good 1.00 · Fair 0.95 · Poor 0.90 (varies with V) |

**Interpreting LI:**

- LI ≤ 1.0 → acceptable for nearly all healthy workers
- LI 1.0–3.0 → increased risk; redesign indicated
- LI > 3.0 → high risk to many workers; redesign the job

**Which multiplier to fix first:** the smallest one. HM is usually the offender, and it's
usually the cheapest to fix — move the load closer to the body. That's the exam answer.

**Worked:** A 40-lb box, H = 15 in, V = 20 in, D = 30 in, A = 30°, FM = 0.94, CM = 1.00.

```
HM = 25/15                = 0.667
VM = 1 − 0.0075|20 − 30|  = 1 − 0.075 = 0.925
DM = 0.82 + 1.8/30        = 0.82 + 0.06 = 0.880
AM = 1 − 0.0032(30)       = 1 − 0.096 = 0.904
RWL = 51 × 0.667 × 0.925 × 0.880 × 0.904 × 0.94 × 1.00 = 23.5 lb
LI = 40 / 23.5 = 1.70  → increased risk, redesign
```

Fix HM: bring H to 10 in → HM = 25/10 = 1.0 (capped at 1.0 since 25/10 = 2.5 → the multiplier
maxes at 1.0 when H ≤ 10 in). RWL becomes 35.2 lb, LI = 1.14. Still >1 but far better —
and it cost nothing but a conveyor height change.

**Equation assumptions** (they ask this): two-handed, smooth lifting, moderate temperature
(66–79 °F), unrestricted posture, good footing, no carrying/pushing/pulling, ≤ 8 hr shifts.
If any assumption is violated, the equation does not apply.

---

## 12. Exposure assessment math

### ppm ↔ mg/m³

```
mg/m³ = (ppm × MW) / 24.45        at 25 °C and 760 mmHg (NTP)
ppm   = (mg/m³ × 24.45) / MW
```

Use **24.45** at 25 °C. Use **24.04** (or 24.1) at 20 °C. The exam usually means 24.45; if
the stem specifies 20 °C, switch. Correcting molar volume for other conditions:
`V_m = 24.45 × (T/298) × (760/P)` with T in kelvin.

**Worked:** Toluene TLV-TWA is 20 ppm; MW = 92.
`mg/m³ = (20 × 92)/24.45 = 75.3 mg/m³`

### 8-hour TWA from samples

```
TWA = (C₁T₁ + C₂T₂ + … + CₙTₙ) / (T₁ + T₂ + … + Tₙ)
```

If the sample doesn't cover the full 8 hours and the unsampled period is genuinely
zero-exposure, divide by **8** instead of by the sampled time — that's the OSHA convention
for an 8-hr TWA and it's a common trap. Read the stem: "the employee was not exposed during
the remaining 2 hours" means divide by 8.

**Worked:** 2 hr at 150 ppm, 4 hr at 60 ppm, 2 hr at 0 ppm.
`TWA = (2×150 + 4×60 + 2×0)/8 = (300 + 240)/8 = 67.5 ppm`

### Mixtures — additive effects

```
E_m = C₁/T₁ + C₂/T₂ + … + Cₙ/Tₙ
```

`E_m > 1` = overexposure, even when no single substance exceeds its own limit. Applies when
the agents affect the **same target organ**. Independent effects → evaluate separately.

**Mixture TLV** (when needed): `TLV_mix = 1 / Σ(fᵢ/TLVᵢ)` with `f` = mass fraction.

### Concentration from a sample

```
C (mg/m³) = mass collected (mg) / volume sampled (m³)
Volume (L) = flow rate (L/min) × time (min);  m³ = L / 1,000
```

**Worked:** A charcoal tube sampled at 0.2 L/min for 240 min and the lab reports 1.8 mg of
xylene (MW 106). Concentration in ppm?

```
Volume = 0.2 × 240 = 48 L = 0.048 m³
C = 1.8 mg / 0.048 m³ = 37.5 mg/m³
ppm = (37.5 × 24.45)/106 = 8.65 ppm
```

Don't forget the **desorption efficiency** correction if the stem gives one: divide the
reported mass by DE (e.g., mass/0.95).

### Respirator selection

```
MUC (maximum use concentration) = APF × OEL
Required protection factor      = Measured concentration / OEL
```

Pick a respirator whose APF exceeds the required PF. Never select above the IDLH — IDLH
requires a full-facepiece pressure-demand SCBA or a combination supplied-air with escape
SCBA, regardless of the math. APF table lives in [`06-industrial-hygiene.md`](06-industrial-hygiene.md).

---

## 13. Radiation

### Inverse square law

```
I₁ d₁² = I₂ d₂²    →    I₂ = I₁ (d₁/d₂)²
```

Doubling distance cuts intensity to **one quarter**. Applies to point sources of ionizing
radiation, and to non-ionizing/RF sources in the far field.

**Worked:** 400 mR/hr at 2 ft. Dose rate at 8 ft? `400 × (2/8)² = 400 × 0.0625 = 25 mR/hr`.

### Decay and half-life

```
A = A₀ × (½)^(t / t½)        or        A = A₀ e^(−0.693t / t½)
```

**Worked:** A source reads 80 mCi. Half-life 8 days. Activity in 32 days?
`32/8 = 4 half-lives → 80 × (½)⁴ = 80/16 = 5 mCi`

### Shielding

```
I = I₀ e^(−µx)              µ = linear attenuation coefficient
I = I₀ × (½)^(x / HVL)      HVL = half-value layer
TVL = tenth-value layer = 3.32 × HVL
```

**Worked:** How many HVLs to reduce 640 mR/hr to 20 mR/hr?
`640/20 = 32 = 2⁵ → 5 half-value layers.`

### Dose

```
Dose = dose rate × time
Time-Distance-Shielding: the three controls, in that order of ease
```

| Unit pair | Relationship |
|---|---|
| rad ↔ gray | 1 Gy = 100 rad (absorbed dose) |
| rem ↔ sievert | 1 Sv = 100 rem (dose equivalent) |
| Ci ↔ Bq | 1 Ci = 3.7 × 10¹⁰ Bq (activity) |
| rem = rad × Q | Q: X/gamma/beta = 1, thermal neutrons = 5, fast neutrons/protons = 10, **alpha = 20** |

Alpha's quality factor of 20 is why alpha emitters are catastrophic **internally** and
harmless externally (stopped by skin/paper). That contrast is a guaranteed question.

---

## 14. General physics

| Quantity | Formula | Units |
|---|---|---|
| Force | `F = ma` | lb = slug·ft/s²; N = kg·m/s² |
| Weight | `W = mg` | g = 32.2 ft/s² = 9.81 m/s² |
| Work | `W = F × d` | ft·lb, J |
| Power | `P = W/t = F × v` | hp, W |
| Kinetic energy | `KE = ½mv²` | **v is squared — double the speed, quadruple the energy** |
| Potential energy | `PE = mgh` | |
| Momentum | `p = mv` | conserved in collisions |
| Impulse | `FΔt = mΔv` | the basis of every energy-absorbing control |
| Friction | `F_f = µN` | µ_static > µ_kinetic |
| Velocity | `v = v₀ + at` · `v² = v₀² + 2ad` · `d = v₀t + ½at²` | |
| Pressure | `P = F/A` | |
| Hydrostatic pressure | `P = ρgh` = 0.433 psi per ft of water | |
| Ideal gas | `PV = nRT` · `P₁V₁/T₁ = P₂V₂/T₂` | T in **absolute** units |
| Mechanical advantage | `MA = output force / input force` | levers, pulleys, inclined planes |

**Where physics actually shows up on this exam:**

- **Slips/trips**: coefficient of friction. ≥0.5 is the conventional threshold for a
  reasonably safe walking surface (ANSI/NFSI uses ≥0.42 wet DCOF for high-traction).
- **Vehicle/PIT**: stopping distance ∝ v², so a forklift at 8 mph needs 4× the stopping
  distance of one at 4 mph.
- **Machine guarding**: kinetic energy of ejected parts.
- **Pressure vessels**: `PV = nRT` and the reason a heated compressed-gas cylinder is a
  bomb. Cylinders have fusible plugs/rupture discs for exactly this.
- **Rigging**: statics and moments.
- **Fall protection**: impulse-momentum and the reason deceleration distance matters.

---

## 15. Machine guarding safety distance

```
Ds = K × (Ts + Tc + Tr + Tbm) + Dpf
```

- `K` = hand speed constant = **63 in/sec** (OSHA/ANSI B11.19)
- `Ts` = stop time of the machine · `Tc` = control-system response time
- `Tr` = response time of the presence-sensing device · `Tbm` = brake-monitor time
- `Dpf` = depth penetration factor for the light curtain (function of object sensitivity)

**Worked:** Total system stopping time 0.25 s, Dpf = 1.2 in.
`Ds = 63 × 0.25 + 1.2 = 15.75 + 1.2 = 16.95 in` — the light curtain must be at least
~17 in from the point of operation.

**Two-hand trip devices** (which fire on release, not hold) use the older
`Ds = 63 × Ts` with `Ts` measured to the ¼-revolution point of a full-revolution clutch
press: `Ts = ½ × (1/SPM) × 60`.

---

## 20 things they actually ask — Domain 1

1. `200,000` and what it represents (100 employees × 2,000 hr)
2. TRIR vs DART vs severity rate — which cases go in `N`
3. Reversing the incidence-rate formula to solve for allowable cases
4. OSHA 5-dB vs ACGIH 3-dB exchange rate, and the `T = 8/2^((L−90)/5)` form
5. Noise dose > 100% ≠ TWA > 90 — you must convert with `16.61 log(D/100) + 90`
6. Two identical noise sources add **3 dB**
7. Doubling distance from a point source drops 6 dB
8. NRR derate: `(NRR − 7)`, halved again under OSHA's 50% policy
9. Total fall distance includes the worker's height below the D-ring
10. Max free fall 6 ft, max deceleration 3.5 ft, MAF 1,800 lbf, anchor 5,000 lb
11. Trenching slopes: A = ¾:1, B = 1:1, C = 1½:1, and the 5-ft / 20-ft triggers
12. Sling tension at 30° from horizontal **doubles**
13. Forklift capacity derating for a longer load center
14. `Q = V(10X² + A)` and the `X²` consequence of moving a hood away
15. `LC = 51 lb` and that HM = 25/H
16. LI thresholds: 1.0 and 3.0
17. `mg/m³ = ppm × MW / 24.45`
18. Mixture rule `Σ C/T > 1` = overexposure even with no single exceedance
19. Inverse square law and half-value layers (`I₀/2ⁿ`)
20. Series reliability multiplies; parallel is `1 − Π(1 − R)`; FTA AND = multiply
