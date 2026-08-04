# Quick Reference — Last 48 Hours

Numbers only. No new material. Read this twice a day for the last two days, and dump the
starred items onto the whiteboard in the first five minutes of the exam.

---

## ★ Whiteboard dump list

```
200,000                          incidence rate base
51 lb / 23 kg                    NIOSH load constant, HM = 25/H, LI 1.0 / 3.0
6 / 3.5 / 1,800 / 5,000          free fall / decel / MAF / anchor
4 - 6 - 10 ft                    fall triggers: gen industry / construction / scaffold
3/4:1  1:1  1.5:1                trench A / B / C   (53° / 45° / 34°)
5 ft protective, 20 ft PE        excavation triggers
19.5 - 23.5% O2, <10% LEL        confined space
O2 -> flammable -> toxic         test order
85 AL / 90 PEL / 5 dB            OSHA noise;  ACGIH 85 / 3 dB
T = 8 / 2^((L-90)/5)             TWA = 16.61 log(D/100) + 90
NRR - 7, then x 0.5              hearing protector derate
+3 dB two equal sources; -6 dB per doubling of distance
24.45                            mg/m3 = ppm x MW / 24.45
10 / 50 / 10,000                 APF half / full APR / PD SCBA
75 / 50 / 30 ft                  extinguisher travel A / B / K
100 F flash point                flammable vs combustible (NFPA 30)
140 F flash point                RCRA D001 ignitable
1.2 cal/cm2                      arc flash boundary
63 in/sec                        machine safety distance constant
Q = V(10X^2 + A)                 hood, X in FEET
8 hr fatality / 24 hr amputation
```

---

## Rates and metrics

- `Rate = (N × 200,000) / employee-hours`
- TRIR = all recordables · DART = days away + restricted/transfer · Severity = lost **days**
- `EMR = actual / expected losses`; 1.0 = average
- `Sales to offset a loss = loss / profit margin`
- Heinrich indirect:direct = **4:1** (traditional)

## Noise

| | OSHA | ACGIH |
|---|---|---|
| Criterion | 90 dBA | 85 dBA |
| Action level | 85 dBA | — |
| Exchange | **5 dB** | **3 dB** |
| Ceiling | 115 dBA / 140 dB peak | 140 dBC peak |

`D = 100 × Σ(C/T)` · `TWA = 16.61 log(D/100) + 90` · two equal sources **+3 dB** · doubling
distance **−6 dB** (point) / −3 dB (line) · STS = **10 dB avg at 2/3/4 kHz** · recordable
STS also needs **25 dB** total shift · **4 kHz notch**

## Fall protection

Free fall **6 ft** · deceleration **3.5 ft** · MAF **1,800 lbf** harness (900 belt) · anchor
**5,000 lb** or 2× MAF · guardrail **42 in ± 3 / 200 lbf**, midrail 21 in / 150 lbf, toeboard
3.5 in · ladder pitch **4:1**, side rails 3 ft above landing · triggers 4 / 5 / 6 / 8 / 10 ft
(general industry / shipyard / construction / longshoring / scaffold)

## Trenching

A ¾:1 (53°) · B 1:1 (45°) · C 1½:1 (34°) · rock vertical
5 ft protective system · **20 ft PE design** · egress within **25 ft** for ≥4 ft · spoil
**2 ft** back · daily competent-person inspection · **Type C cannot be benched**

## Rigging

30° = **2.0×** · 45° = 1.414 · 60° = 1.155 · design factor **5:1** slings, **10:1** hooks and
personnel lifting · forklift `(rated × 24) / actual load center` · standard load center
**24 in**

## Confined space

Three criteria: enter and work · limited entry/exit · not for continuous occupancy
Four permit criteria: hazardous atmosphere · engulfment · trapping configuration · any other
recognized serious hazard
**O₂ 19.5–23.5% · flammable <10% LEL · toxic below PEL** · test **O₂ first**
Entrant / attendant (stays outside, never enters to rescue) / entry supervisor
Retrieval line + **mechanical device for vertical spaces over 5 ft**
(c)(5) alternate procedures = atmosphere **controlled** by ventilation
(c)(7) reclassification = hazards **eliminated**

## LOTO

Prepare → notify → shut down → isolate → apply devices → **release stored energy and
verify**
Annual inspection by an authorized employee **not using** the procedure · authorized /
affected / other · tagout needs an additional means

## Electrical

`V = IR` · `P = VI = I²R = V²/R` · GFCI **4–6 mA**, protects people · let-go **6–25 mA** ·
fibrillation **1,000–4,300 mA** · arc flash boundary **1.2 cal/cm²** · shock threshold
**50 V** · Class I gas / II dust / III fiber · Div 1 normal / Div 2 abnormal · intrinsically
safe limits energy; explosionproof contains the explosion

## Machine guarding

`Ds = 63(Ts + Tc + Tr + Tbm) + Dpf` · work rest **1/8 in** · tongue guard **1/4 in** ·
fixed guard is the preferred type

## PSM (14 elements)

PHA revalidated **5 years** · compliance audit **3 years** · training refresher **3 years** ·
incident investigation initiated **48 hours** · reports kept 5 years · applicability at
**10,000 lb** of flammable

## Ergonomics

`RWL = 51 × HM × VM × DM × AM × FM × CM` · `HM = 25/H` · `VM = 1 − 0.0075|V−30|` ·
`DM = 0.82 + 1.8/D` · `AM = 1 − 0.0032A` · `LI = load/RWL`, thresholds **1.0** and **3.0**
RULA = upper limb (7 = change immediately) · REBA = whole body · Snook = push/pull/carry ·
median nerve = thumb/index/middle · clearance → large user, reach → small user ·
**no OSHA ergonomics standard**

## Fire

Tetrahedron: fuel, oxygen, heat, **chain reaction** · dust pentagon adds **dispersion +
confinement**
Classes: A ordinary · B liquids/gases · C **energized** · D metals (dry powder) · K cooking
oils (wet chemical)
NFPA 30: **IA** <73 FP / <100 BP · **IB** <73 / ≥100 · **IC** 73–100 · **II** 100–140 ·
**IIIA** 140–200 · **IIIB** ≥200. **Flammable/combustible split at 100 °F**
NFPA 704: blue health / red flammability / yellow instability / white special. **4 = worst**
(GHS **1 = worst**)
Hot work: **35 ft**, fire watch **30 min OSHA / 60 min NFPA 51B**
Extinguishers: A **75 ft** · B **50 ft** · D 75 ft · K **30 ft**; monthly inspection, annual
maintenance, **CO₂ hydro 5 yr, dry chem 12 yr**; **PASS**
Sprinklers: wet / dry (freezing) / preaction (two events, data centers) / deluge (all heads
open); **18 in clearance**; `Q = K√P`
Detectors: ionization = fast flaming · photoelectric = smoldering · heat = slowest
Cabinet limit **60 gal** Class I/II · safety can **5 gal** with flame arrester
Egress: two routes, unlocked inside, **"EXIT"** letters 6 in / 3/4 in stroke

## Emergency

Priorities: **life safety → stabilization → property/environment**
EAP oral if **≤10 employees**; six elements including **accounting for employees**
HAZWOPER: awareness (notify) · operations **8 hr, defensive** · technician **24 hr,
offensive** · specialist · IC. Site worker **40 hr + 3 days**, **8 hr annual refresher**
PPE: A vapor-tight · B same respiratory, splash only · C APR, known contaminant · D nuisance
Zones: exclusion (hot) / contamination reduction (warm, decon) / support (cold)
ICS: Command, Operations, Planning, Logistics, Finance · span of control **3–7 (5)** ·
Safety Officer stops unsafe work · unity ≠ unified command
Eyewash: **10 sec / 55 ft · 15 min · 60–100 °F**, weekly activation
BIA first · **RTO** = downtime · **RPO** = data loss
Violence: Type I criminal (most fatal) · II client (most common assault) · III coworker ·
IV personal
**RUN – HIDE – FIGHT**

## Industrial hygiene

PEL enforceable · TLV/REL are not · **STEL 15 min**, ≤4×/day, ≥60 min apart · Ceiling
instantaneous · excursion 3× for ≤30 min, never >5× · action level typically **50% of PEL**
`mg/m³ = ppm × MW / 24.45` · mixture `ΣC/T > 1` = overexposure · `MUC = APF × OEL`
12-hr shift → **half** the limit (Brief & Scala)
Particle cuts: inhalable **100 µm** · thoracic **10 µm** · respirable **4 µm**
APF: filtering facepiece/half APR **10** · full APR **50** · PAPR loose hood 25 · PAPR full
1,000 · **PD SCBA 10,000** · never an APR in IDLH
N/R/P and 95/99/100 · HEPA **99.97% at 0.3 µm** · fit test **annually** · no facial hair on
the seal
Radiation: `I₁d₁² = I₂d₂²` · `A = A₀(½)^(t/t½)` · alpha **Q = 20**, internal only · 1 Gy =
100 rad, 1 Sv = 100 rem · NRC 5 rem/yr, **0.5 rem declared pregnant**, 0.1 rem public
Bloodborne: universal precautions · HBV vaccine **10 working days** · ECP reviewed
**annually** · sharps log (11+ employees) · training **annually** · records **employment +
30 yr**
Silica PEL **50 µg/m³** (AL 25) · asbestos **0.1 f/cc** (EL 1.0 over 30 min) · lead **50**
(AL 30) · hex chrome **5** (AL 2.5) · benzene **1 ppm** (STEL 5)
WBGT indoor `0.7 NWB + 0.3 GT` · outdoor `0.7 NWB + 0.2 GT + 0.1 DB` · heat stroke = hot skin,
confusion, **emergency**

## Environmental

RCRA = now, cradle-to-grave · CERCLA = past contamination
**F** non-specific · **K** specific · **P** acute · **U** toxic
**ICRT**: ignitable **<140 °F** (D001) · corrosive **pH ≤2 or ≥12.5** (D002) · reactive
(D003) · toxic TCLP (D004+)
**VSQG ≤100 kg · SQG 100–1,000 kg (180/270 days) · LQG ≥1,000 kg (90 days)**
Satellite accumulation **55 gal** · containers **closed except when adding/removing** ·
generator liability **never transfers**
Criteria pollutants: **PM, O₃, CO, SO₂, NO₂, Pb** (not CO₂) · Title V major source ·
188 HAPs under NESHAP/MACT
SPCC **1,320 gal** aboveground · NPDES = point source · construction stormwater at **1 acre**
EPCRA: **Tier II March 1 · TRI Form R July 1**
ISO 14001: **aspect = cause, impact = effect**
Waste hierarchy: **source reduction** → recycle → energy recovery → treatment → disposal
GHG: **Scope 1 direct · Scope 2 purchased energy · Scope 3 value chain**

## Training and culture

Kirkpatrick **1 Reaction · 2 Learning · 3 Behavior · 4 Results** (Phillips 5 = ROI)
Bloom revised: **Remember, Understand, Apply, Analyze, Evaluate, Create**
ADDIE · training only fixes knowledge/skill deficits
**Competent = identify hazards + authority to correct** · **Qualified = degree, certificate,
professional standing, or demonstrated expertise** · PE required for excavations >20 ft
Bradley: **Reactive → Dependent → Independent → Interdependent**
Just culture: error (console) / at-risk (coach) / reckless (discipline)
Reason: **slip** (execution) · **lapse** (memory) · **mistake** (plan) · **violation**
(deliberate)
ABC model: consequences **Soon, Certain, Positive** drive behavior
Endsley SA: **perception → comprehension → projection**; most failures at Level 1
Rising near-miss reporting = **good sign**

## Legal

OSHA enforces (Labor) · NIOSH researches (HHS) · **OSHRC adjudicates** (independent)
GDC 5(a)(1) four elements: hazard · **recognized** · death or serious physical harm ·
**feasible abatement**. Applies only where **no specific standard** exists
Inspection priority: **imminent danger → fatality/catastrophe → complaints → programmed**
Citation within **6 months** · contest within **15 working days** · post **3 working days**
or until abated · repeat = **5 years** · willful/repeat ≈ **10×** serious
Report: **fatality 8 hr · hospitalization/amputation/eye 24 hr**
Post 300A **Feb 1 – Apr 30** · retain **5 years**
**22 state plans** private + public · **7** public only
Multi-employer: **creating · exposing · correcting · controlling**
Negligence: **duty · breach · causation · damages**
Workers' comp: **no-fault, exclusive remedy**; third-party suits are the exception
Records: exposure **30 yr** · medical **employment + 30 yr** · BBP training 3 yr · noise
measurements 2 yr · manifests 3 yr
11(c) retaliation complaint: **30 days**
Risk transfer moves the **financial consequence only** — never the OSHA duty

---

## Ten distinctions that decide close questions

1. **GHS Category 1 = worst · NFPA 704 rating 4 = worst**
2. **NFPA 30 flammable at <100 °F · RCRA ignitable at <140 °F**
3. **Confined space alternate procedures = hazard *controlled* · reclassification = hazard
   *eliminated***
4. **Grounding** = path to earth · **bonding** = equal potential between parts
5. **GFCI protects people · overcurrent devices protect conductors**
6. **HAZWOPER operations = defensive · technician = offensive**
7. **Unity of command** = one supervisor · **unified command** = multi-agency shared
8. **Competent person** = recognize + authority · **qualified person** = credential or
   demonstrated expertise
9. **Clearance dimensions → large user · reach dimensions → small user**
10. **ISO 14001 aspect = cause · impact = effect**

---

## The last thing to read

When a question asks for the **best control**, take the highest feasible level of the
hierarchy. When it asks for the **first step**, look for assessment, notification, or
verification — not action. When it asks what a safety professional should do about something
outside their competence, the answer is **refer to the appropriate professional**. And when
production, cost, or convenience is weighed against a clear danger to people, **people win**.

Sleep. You know this.
