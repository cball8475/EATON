# ASP Formula and Constant Sheet

**M** = memorize; the exam may test whether you know it, and it won't be given.
**R** = recognize; the formula is usually embedded in the stem, but you must know what the
terms mean and what units they take.

You will **not** get a formula sheet on exam day. What you get is the formula *inside the
question* — unless the question is testing the formula itself. Everything marked **M** below
is the set that has burned candidates.

---

## Constants to memorize outright

| Constant | Value | Where |
|---|---|---|
| Incidence rate base | **200,000** hours (100 employees × 2,000 hr) | TRIR, DART, severity |
| NIOSH load constant | **51 lb / 23 kg** | Lifting equation |
| Hand speed constant | **63 in/sec** | Machine safety distance |
| Molar volume | **24.45 L/mol** at 25 °C, 760 mmHg (24.04 at 20 °C) | ppm ↔ mg/m³ |
| Standard air velocity constant | **4005** | `V = 4005√VP` |
| Dilution ventilation constant | **403** | ft³ vapor per pint |
| OSHA noise TWA constant | **16.61** (pairs with 90 dBA and the 5 dB exchange) | Dose → TWA |
| NRR correction | **−7 dB**, then **×0.5** under OSHA's derate policy | Hearing protection |
| Gravity | **32.2 ft/s² / 9.81 m/s²** | Physics, fall protection |
| Water | **62.4 lb/ft³ · 7.48 gal/ft³ · 8.34 lb/gal** | Storage capacity |
| Atmospheric pressure | 14.7 psi = 760 mmHg = 101.3 kPa = 407 in w.g. | Gas laws |
| Percent to ppm | **1% = 10,000 ppm** | LEL, gas readings |
| rad/rem conversions | 1 Gy = 100 rad · 1 Sv = 100 rem · 1 Ci = 3.7 × 10¹⁰ Bq | Radiation |
| TVL/HVL relation | **TVL = 3.32 × HVL** | Shielding |

---

## Safety metrics

| Formula | Tag |
|---|---|
| `Incidence rate = (N × 200,000) / Employee-hours` | **M** |
| `N = (Rate × EH) / 200,000` (the reverse) | **M** |
| `Severity rate = (Lost days × 200,000) / EH` | M |
| `EH ≈ employees × 2,000 hr/yr` | M |
| `EMR = Actual losses / Expected losses` | M |

---

## Financial

| Formula | Tag |
|---|---|
| `ROI = (Gain − Cost) / Cost × 100` | M |
| `Payback (yr) = Initial cost / Annual savings` | M |
| `FV = PV(1 + i)ⁿ` · `PV = FV / (1 + i)ⁿ` | R |
| `PV of annuity = A × [1 − (1+i)⁻ⁿ] / i` | R |
| `NPV = Σ[CFₜ / (1+i)ᵗ] − Initial cost` | R |
| `Benefit-cost ratio = PV benefits / PV costs` (accept if > 1.0) | M |
| `Sales needed to offset a loss = Loss / Profit margin` | **M** |
| `Total cost = Direct × (1 + indirect ratio)`; traditional Heinrich ratio **4:1** | M |

---

## Statistics, probability, reliability

| Formula | Tag |
|---|---|
| `x̄ = Σx / n` | M |
| `s² = Σ(x − x̄)² / (n − 1)` sample · `σ² = Σ(x − µ)² / N` population | **M** (which n to use) |
| `SD = √variance` · `CV = s / x̄` | M |
| `z = (x − µ) / σ`; 68 / 95 / 99.7 for ±1, 2, 3σ | M |
| `P(A and B) = P(A) × P(B)` independent | M |
| `P(A or B) = P(A) + P(B) − P(A and B)` | M |
| `P(at least one) = 1 − P(none)` | **M** |
| `ₙCᵣ = n! / [r!(n−r)!]` · `ₙPᵣ = n! / (n−r)!` | R |
| Series reliability: `R = R₁ × R₂ × …` | **M** |
| Parallel reliability: `R = 1 − (1−R₁)(1−R₂)…` | **M** |
| `R(t) = e^(−λt)`, `λ = 1/MTBF` | R |
| `Availability = MTBF / (MTBF + MTTR)` | R |
| `RPN = Severity × Occurrence × Detection` (1–10 each, 1–1,000) | **M** |
| FTA: **AND gate = multiply**; **OR gate = `1 − Π(1−Pᵢ)`** | **M** |

---

## Noise

| Formula | Tag |
|---|---|
| OSHA permissible duration `T = 8 / 2^((L − 90)/5)` | **M** |
| ACGIH permissible duration `T = 8 / 2^((L − 85)/3)` | M |
| `Dose % = 100 × Σ(Cₙ / Tₙ)` | **M** |
| `TWA = 16.61 log₁₀(D/100) + 90` (OSHA) | M |
| `TWA = 10 log₁₀(D/100) + 85` (ACGIH) | R |
| `L_total = 10 log₁₀(Σ10^(Lᵢ/10))` | R |
| Two equal sources = **+3 dB**; ten equal = **+10 dB** | **M** |
| Point source: `L₂ = L₁ − 20 log(d₂/d₁)` → **−6 dB per doubling**; line source −3 dB | **M** |
| `Protected level = TWA − (NRR − 7)`; OSHA derate `TWA − [(NRR − 7) × 0.5]` | **M** |
| Dual protection: higher NRR **+5 dB**, then derate | M |

---

## Fall protection

| Formula / value | Tag |
|---|---|
| `Total fall distance = free fall + deceleration + harness stretch + worker height below D-ring + safety factor` | **M** |
| `F = W(h + d) / d` (impact force) | R |
| `v = √(2gh)` (impact velocity) | R |
| Max free fall **6 ft** · max deceleration **3.5 ft** · MAF **1,800 lbf** (harness) / 900 (belt) | **M** |
| Anchorage **5,000 lb** per person, or **2× MAF** under a qualified person's design | **M** |
| Triggers: **4 ft** general industry · **5 ft** shipyards · **6 ft** construction · **8 ft** longshoring · **10 ft** scaffolds | **M** |
| Guardrail: top rail **42 in ± 3**, **200 lbf**; midrail **21 in**; toeboard **3.5 in** | **M** |

---

## Trenching

| Value | Tag |
|---|---|
| Type A **¾:1 (53°)** · Type B **1:1 (45°)** · Type C **1½:1 (34°)** · stable rock vertical | **M** |
| Protective system at **5 ft**; PE design at **20 ft**; egress within **25 ft** lateral for ≥4 ft; spoil **2 ft** back | **M** |
| `Top width = bottom width + 2 × (depth × slope ratio)` | M |

---

## Rigging and load

| Formula / value | Tag |
|---|---|
| `T = (Load / n) × (L / H)` = `(Load / n) / sin θ` | **M** |
| Tension factors: 90° = 1.00 · 60° = 1.155 · 45° = 1.414 · **30° = 2.00** · 15° = 3.86 | **M** |
| `WLL = Breaking strength / Design factor`; slings **5:1**, hooks and personnel lifting **10:1** | M |
| Forklift derate: `New capacity = (Rated capacity × Rated load center) / Actual load center` | **M** |
| Standard load center **24 in** | M |
| `Load moment = Load × radius` | R |

---

## Ventilation and flow

| Formula | Tag |
|---|---|
| `Q = V × A` | **M** |
| `V = 4005 √VP` · `TP = SP + VP` | M |
| Plain hood `Q = V(10X² + A)`; flanged `Q = 0.75V(10X² + A)` | **M** |
| Booth `Q = V × A_face`; canopy `Q = 1.4 × P × H × V` | R |
| Dilution `Q = (403 × SG × ER × K × 10⁶) / (MW × C)` | R |
| Purge `t = −(V/Q) ln(C₂/C₁)` | **M** |
| Buildup `C(t) = (G/Q)(1 − e^(−Qt/V))` | R |
| `ACH = (Q × 60) / V_room` | M |
| Mixing factor **K = 1 (perfect) to 10 (poor)**; divide effective Q by K | M |

---

## Heat and cold

| Formula | Tag |
|---|---|
| Indoor / no solar load: `WBGT = 0.7 NWB + 0.3 GT` | **M** |
| Outdoor with solar load: `WBGT = 0.7 NWB + 0.2 GT + 0.1 DB` | **M** |
| Note: the **indoor equation has no dry-bulb term** | **M** |

---

## Ergonomics

| Formula | Tag |
|---|---|
| `RWL = LC × HM × VM × DM × AM × FM × CM` | **M** |
| `LC = 51 lb (23 kg)` | **M** |
| `HM = 25/H` (in) — 1.0 if H ≤ 10 in, 0 if H > 25 in | **M** |
| `VM = 1 − 0.0075|V − 30|` (in) | M |
| `DM = 0.82 + 1.8/D` (in) — 1.0 if D < 10 in | M |
| `AM = 1 − 0.0032A` (degrees) | M |
| FM and CM from tables; CM good 1.00 / fair 0.95 / poor 0.90 | R |
| `LI = Load weight / RWL`; thresholds **1.0** and **3.0** | **M** |

---

## Industrial hygiene

| Formula | Tag |
|---|---|
| `mg/m³ = (ppm × MW) / 24.45` · `ppm = (mg/m³ × 24.45) / MW` | **M** |
| `TWA = Σ(CᵢTᵢ) / Σ Tᵢ` — divide by **8** when the unsampled period is zero-exposure | **M** |
| Mixture `E_m = Σ(Cᵢ / Tᵢ)`; **> 1.0 = overexposure** | **M** |
| `TLV_mix = 1 / Σ(fᵢ / TLVᵢ)` | R |
| `C (mg/m³) = mass collected (mg) / volume sampled (m³)` | M |
| `Volume (L) = flow (L/min) × time (min)`; `m³ = L / 1,000` | **M** |
| Desorption efficiency correction: `corrected mass = reported mass / DE` | M |
| `MUC = APF × OEL` | **M** |
| `Required protection factor = Concentration / OEL` | M |
| Brief & Scala shift adjustment `RF = (8/h) × [(24 − h)/16]`; 12-hr shift → **0.5** | M |
| ACGIH excursion: ≤3× TLV for ≤30 min, never >5× | M |

---

## Fire

| Formula | Tag |
|---|---|
| `LEL_mix = 1 / Σ(fᵢ / LELᵢ)` (Le Chatelier) | R |
| `Q = K √P` (sprinkler discharge) | R |
| % of LEL → % by volume: `(%LEL reading / 100) × LEL` | **M** |
| Extinguisher travel distance: **A = 75 ft · B = 50 ft · D = 75 ft · K = 30 ft** | **M** |
| Flammable/combustible split at **100 °F** flash point (NFPA 30 / 1910.106) | **M** |
| RCRA ignitability at **140 °F** — a different number on purpose | **M** |

---

## Radiation

| Formula | Tag |
|---|---|
| `I₁d₁² = I₂d₂²` (inverse square) | **M** |
| `A = A₀(½)^(t / t½)` | **M** |
| `I = I₀(½)^(x / HVL)` · `I = I₀e^(−µx)` | M |
| `rem = rad × Q`; Q: gamma/beta/X = 1, thermal n = 5, fast n = 10, **alpha = 20** | **M** |
| `Dose = dose rate × time` | M |

---

## Physics

| Formula | Tag |
|---|---|
| `F = ma` · `W = mg` | M |
| `KE = ½mv²` · `PE = mgh` | **M** |
| `W = Fd` · `P = W/t = Fv` | M |
| `p = mv` · `FΔt = mΔv` | R |
| `F_f = µN` | M |
| `v = v₀ + at` · `v² = v₀² + 2ad` · `d = v₀t + ½at²` | R |
| `P = F/A` · `P = ρgh` (0.433 psi per ft of water) | M |
| `PV = nRT` · `P₁V₁/T₁ = P₂V₂/T₂` (absolute temperature) | **M** |

---

## Electrical

| Formula | Tag |
|---|---|
| `V = IR` | **M** |
| `P = VI = I²R = V²/R` | **M** |
| Series `R = ΣRᵢ` · Parallel `1/R = Σ(1/Rᵢ)` | M |
| `Z = √(R² + (X_L − X_C)²)` | R |
| GFCI trip **4–6 mA**; let-go **6–25 mA**; fibrillation **1,000–4,300 mA** | **M** |
| Arc flash boundary at **1.2 cal/cm²**; shock threshold **50 V** | **M** |

---

## Machine guarding

| Formula | Tag |
|---|---|
| `Ds = K(Ts + Tc + Tr + Tbm) + Dpf`, `K = 63 in/sec` | **M** |
| Grinder work rest **1/8 in**, tongue guard **1/4 in** | **M** |

---

## Geometry you'll need

| Shape | Formula |
|---|---|
| Circle area | `A = πr² = πd²/4` |
| Cylinder volume | `V = πr²h` |
| Rectangular prism | `V = lwh` |
| Sphere volume | `V = (4/3)πr³` |
| Cone volume | `V = (1/3)πr²h` |
| Circumference | `C = 2πr = πd` |
| Right triangle | `a² + b² = c²`; `sin θ = opp/hyp`, `cos θ = adj/hyp`, `tan θ = opp/adj` |

---

## The seven numbers most likely to be the difference

1. **200,000**
2. **51 lb**
3. **6 ft free fall / 3.5 ft deceleration / 1,800 lbf / 5,000 lb anchor**
4. **19.5% – 23.5% oxygen and < 10% LEL**
5. **85 dBA action level / 90 dBA PEL / 5 dB exchange**
6. **24.45**
7. **A = 75 ft, B = 50 ft** extinguisher travel distance
