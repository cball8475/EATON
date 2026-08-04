# Domain 4 — Fire Prevention and Protection (12%)

~21 scored items — tied for the second-largest domain. Heavy on definitions, numbers, and
classification systems. Note the blueprint puts **electrical hazards and hazardous area
classification inside this domain**, not in Domain 2, because they're ignition sources.

---

## 1. Fire science fundamentals

### Tetrahedron and triangle

**Fire triangle:** fuel + oxygen + heat.
**Fire tetrahedron:** fuel + oxygen + heat + **uninhibited chemical chain reaction**.

The fourth leg is why halon and clean agents work — they interrupt the chain reaction
chemically rather than removing a leg physically. Match the agent to the leg it removes:

| Agent | Removes |
|---|---|
| Water | Heat (cooling) — highest specific heat and latent heat of vaporization of common agents |
| Foam | Oxygen (smothering, and a vapor seal) |
| CO₂ | Oxygen (dilution) and some cooling |
| Dry chemical | **Chain reaction** (primarily), plus smothering |
| Halon / clean agents (FM-200, FE-13, Novec 1230) | **Chain reaction** |
| Inert gas (IG-55, IG-541, Inergen) | Oxygen (dilution to ~12–15%) |
| Wet chemical (Class K) | Chain reaction + **saponification** (cooling and a soapy crust over the fuel) |
| Dry powder (Class D) | Smothering and heat absorption — **not** dry chemical |

### Combustible dust pentagon

Fuel + oxygen + heat + **dispersion** (dust suspended in a cloud) + **confinement**. Add the
last two to a triangle and you get a deflagration/explosion instead of a fire.

### Stages of fire

Incipient → growth → **flashover** → fully developed → decay.

**Flashover** = the near-simultaneous ignition of all exposed combustible surfaces in a
compartment, typically at ~1,100 °F ceiling temperature. Non-survivable.
**Backdraft** = a ventilation-induced deflagration when oxygen is admitted to an
oxygen-depleted, superheated compartment full of unburned pyrolysis products.
**Rollover/flameover** = flame propagation through the hot gas layer at the ceiling, ahead of
the fire.

### Heat transfer

**Conduction** (through solids/contact) · **convection** (through fluid movement — the
dominant mode of vertical fire spread in buildings) · **radiation** (electromagnetic, no
medium needed — the mode that ignites exposures across a separation distance, and it obeys
the inverse square law).

### Fire classes and extinguishing agents

| Class | Fuel | Agents |
|---|---|---|
| **A** | Ordinary combustibles — wood, paper, cloth, most plastics | Water, foam, ABC dry chemical, water mist |
| **B** | Flammable **liquids and gases** | Foam, CO₂, dry chemical, clean agent. **Never a straight water stream** — it spreads the fuel |
| **C** | **Energized electrical equipment** | Non-conductive: CO₂, dry chemical, clean agent. De-energize and it becomes A or B |
| **D** | **Combustible metals** — magnesium, titanium, sodium, potassium, lithium, zirconium | **Dry powder** only (Met-L-X, graphite, copper). Water can react violently and produce hydrogen |
| **K** | Cooking oils and fats in commercial kitchens | **Wet chemical** (potassium acetate/citrate) — saponification |

**Class C is defined by the energized equipment, not by the fuel.** Once de-energized, the
fire is classified by what's actually burning. That is a stock exam question.

---

## 2. Flammability properties

| Property | Definition | Why it matters |
|---|---|---|
| **Flash point** | Lowest temperature at which a liquid gives off enough vapor to form an **ignitable mixture near the surface** — flashes but does not sustain | The single most important flammability property. It classifies the liquid |
| **Fire point** | Temperature at which vapor production sustains combustion — typically a few degrees above the flash point | |
| **Autoignition temperature (AIT)** | Temperature at which a material ignites **with no external ignition source** | Always far above the flash point. A hot surface can ignite a liquid below its AIT if there's a spark, or above AIT with nothing at all |
| **LEL/LFL** | Minimum vapor concentration in air that will propagate flame | Below LEL = **too lean** |
| **UEL/UFL** | Maximum concentration that will propagate flame | Above UEL = **too rich** (and it becomes flammable as it dilutes — the reason a rich headspace is still deadly) |
| **Flammable range** | UEL − LEL | Wider = more dangerous. Acetylene 2.5–100%; hydrogen 4–75% |
| **Vapor density** | Weight of vapor relative to air (air = 1.0) | **>1 = sinks** and travels along the floor to distant ignition sources (gasoline ~3–4, propane 1.5). <1 = rises (methane 0.55, hydrogen 0.07, ammonia 0.6) |
| **Specific gravity** | Liquid density relative to water (water = 1.0) | <1 floats — why water is a bad agent for a hydrocarbon spill fire |
| **Vapor pressure** | Pressure exerted by vapor above its liquid at a given temperature | Higher VP = more volatile = lower flash point |
| **Boiling point** | | Used with flash point to sort NFPA 30 Class IA vs. IB |
| **Minimum ignition energy (MIE)** | Energy needed to ignite the most ignitable mixture | Hydrogen ~0.02 mJ; a human static discharge is ~10–30 mJ. That contrast is the point |

**Common LEL/UEL values worth recognizing:**

| Gas | LEL | UEL |
|---|---|---|
| Methane | 5% | 15% |
| Propane | 2.1% | 9.5% |
| Hydrogen | 4% | 75% |
| Acetylene | 2.5% | **100%** |
| Carbon monoxide | 12.5% | 74% |
| Gasoline vapor | ~1.4% | ~7.6% |
| Ammonia | 15% | 28% |

**Le Chatelier's mixture rule:**

```
LEL_mix = 1 / Σ(fᵢ / LELᵢ)     where fᵢ = volume fraction of component i in the fuel mixture
```

**Gas detector readings:** a combustible-gas indicator reads **% of LEL**, not % by volume.
10% of the LEL of methane (LEL = 5% vol) is 0.5% by volume = 5,000 ppm. Confined-space entry
requires **<10% LEL**. Many meters are calibrated on one gas (usually methane or pentane) and
need a **response factor** correction for others — the reading is wrong otherwise.

### NFPA 30 / OSHA 1910.106 liquid classification

| Class | Flash point | Boiling point |
|---|---|---|
| **IA** | < 73 °F | < 100 °F |
| **IB** | < 73 °F | ≥ 100 °F |
| **IC** | 73 °F – < 100 °F | — |
| **II** | 100 °F – < 140 °F | — |
| **IIIA** | 140 °F – < 200 °F | — |
| **IIIB** | ≥ 200 °F | — |

**Class I = flammable. Classes II and III = combustible.** The dividing line is **100 °F**
flash point. (OSHA's 2012 HazCom-aligned definition uses ≤ 199.4 °F / 93.3 °C as the
flammable-liquid boundary for classification purposes — if a stem cites HazCom, use that;
if it cites NFPA 30 or 1910.106 storage, use the table.)

**Storage limits (1910.106 / NFPA 30):** flammable liquids in **safety cans** (≤5 gal, with
a spring-closing lid, spout cover, and **flame arrester**); flammable-liquid storage
cabinets limited to **60 gal of Class I/II** (120 gal total including Class III), labeled
**"FLAMMABLE — KEEP FIRE AWAY"**; no more than **three cabinets per fire area**; inside
storage rooms with fire-rated construction, curbs or sloped floors for containment, and
ventilation of **1 cfm/ft² (minimum 150 cfm)**.

### NFPA 704 — the fire diamond

| Quadrant | Color | Hazard |
|---|---|---|
| Left | **Blue** | Health |
| Top | **Red** | Flammability |
| Right | **Yellow** | Instability/reactivity |
| Bottom | **White** | Special: **W̶** (reacts with water), **OX** (oxidizer), **SA** (simple asphyxiant) |

Ratings **0 (minimal) to 4 (severe)** — the reverse of GHS, where Category 1 is worst. NFPA
704 is designed for **emergency responders**, not for workplace hazard communication; it
does not satisfy HazCom labeling on its own. HMIS is the workplace analogue and uses a
similar 0–4 scale with a PPE letter code.

---

## 3. Electrical hazards as ignition sources

This is Domain 4 in the blueprint. The electrical fundamentals (Ohm's law, GFCI, 70E,
grounding vs. bonding, hazardous location classes) are written up in
[`02-safety-programs.md`](02-safety-programs.md) §5. What Domain 4 adds is the **ignition**
framing:

- **Electrostatic discharge** — generated by liquid flow through pipes and filters, splash
  filling, pneumatic conveying of powders, and belt friction. Controls: **bonding** the
  container to the dispensing vessel and **grounding** the system (≤10⁶ Ω), bottom or
  dip-pipe filling instead of splash filling, reducing flow velocity, relaxation time before
  gauging or sampling, humidification, ionization, conductive footwear and flooring.
  **Bonding and grounding a drum during transfer is the answer to the drum-transfer question,
  every time.**
- **Overcurrent protection** — fuses and breakers protect conductors from overload and short
  circuit. Overloaded circuits, undersized extension cords, and daisy-chained power strips
  are common ignition scenarios.
- **Arc flash** — see 70E in Domain 2. Boundary at **1.2 cal/cm²**.
- **Ground fault circuit interrupters** — shock protection, not fire protection. **AFCIs**
  (arc-fault circuit interrupters) are the fire-protection device, detecting arcing faults.
- **Grounding and bonding** — grounding provides a fault path to earth; bonding equalizes
  potential between conductive parts. Both are required for static control on flammable
  transfers.
- **Hazardous (classified) locations** — Class I gases, Class II dusts, Class III fibers;
  Division 1 normal / Division 2 abnormal; Groups A–D (gases) and E–G (dusts).
  **Intrinsically safe** equipment limits energy below the ignition threshold and is the
  preferred approach for instruments; **explosionproof** enclosures contain an internal
  explosion and cool the escaping gases — they do not exclude the gas.

---

## 4. Hot work

**Hot work** = any work producing sparks, flames, or heat: welding, cutting, brazing,
soldering, grinding, torch-applied roofing, thawing pipes.

**Governing documents:** OSHA 1910.252 (general industry welding), 1926.352 (construction),
**NFPA 51B** (Standard for Fire Prevention During Welding, Cutting, and Other Hot Work), and
PSM element 9 for covered processes.

**The hierarchy is: move the work to a designated safe area first.** Only if that's
impossible do you write a permit.

**Hot work permit requirements:**

- **35 ft** radius clear of combustibles (or combustibles covered with fire-resistant
  material/guards). This is the number they ask.
- Openings, cracks, and floor/wall penetrations within 35 ft protected — sparks fall and
  travel far further than people expect, and floor openings are the classic loss cause
- Sprinklers in service; fire extinguishers or a charged hose line immediately available
- **Fire watch** during the work, plus after: OSHA 1910.252 requires **at least 30 minutes**
  after completion; **NFPA 51B (2019) requires 60 minutes**, and additionally a monitored
  area for up to 4 hours in some cases. If the stem cites NFPA, answer 60; if it cites OSHA,
  answer 30. If it's generic, 30 minutes is OSHA's floor and 60 is best practice.
- Fire watch trained in extinguisher use and how to sound the alarm; may have no other duties
- Permit issued by a **permit-authorizing individual**, time-limited, posted at the job
- Confined-space and LOTO requirements layered on where applicable
- Containers that held flammables must be cleaned, purged, and tested — **never weld on a
  drum or tank until it's been rendered gas-free.** Inerting or filling with water are
  accepted approaches.

**Welding health hazards** (Domain 6 overlap): metal fume fever from zinc/galvanized
(flu-like, self-limiting, "Monday morning fever"), **hexavalent chromium** from stainless
(OSHA PEL 5 µg/m³, AL 2.5 µg/m³), manganese (neurological), cadmium (acute pulmonary edema —
lethal), **ozone and nitrogen oxides** from UV, **phosgene** when chlorinated solvents like
degreasers are hit by UV, UV arc eye (photokeratitis), and oxygen displacement in confined
spaces. Local exhaust at the arc is the control; the shade number of the lens is the eye
control (shade 10–14 for arc welding depending on amperage).

---

## 5. Combustible dust

**Any combustible material can burn rapidly when finely divided.** The threshold used in
practice: material passing a **40-mesh sieve (≤ 420 µm)**. Finer = more surface area = more
violent.

**Dust pentagon:** fuel, oxygen, ignition, **dispersion**, **confinement**.

**Secondary explosion** is the killer: the primary blast shakes loose accumulated dust on
beams, ledges, and equipment, dispersing it into a much larger cloud that then ignites.
**Imperial Sugar (2008)** and **West Pharmaceutical (2003)** are the canonical CSB cases.
This is why housekeeping is not a cosmetic issue in dust facilities.

**Kst and deflagration classes:**

| Class | Kst (bar·m/s) | Severity |
|---|---|---|
| St 0 | 0 | Non-explosible |
| **St 1** | > 0 – 200 | Weak to moderate (most agricultural, plastic, wood dusts) |
| **St 2** | 201 – 300 | Strong |
| **St 3** | > 300 | Very strong (aluminum, magnesium) |

Also relevant: **Pmax** (maximum explosion pressure), **MEC** (minimum explosible
concentration), **MIE** (minimum ignition energy), and **layer/cloud ignition temperature**.

**Standards:** **NFPA 652** (fundamentals — requires a **Dust Hazard Analysis, DHA**),
NFPA 61 (agricultural/food), NFPA 484 (combustible metals), NFPA 654 (chemical, dyes,
plastics), NFPA 664 (wood), NFPA 68 (deflagration **venting**), NFPA 69 (explosion
**prevention** — inerting, oxidant reduction, suppression, isolation).

**Controls:** minimize dust generation and escape · **eliminate flat horizontal surfaces**
where dust accumulates · regular housekeeping with **vacuum, not compressed air or dry
sweeping** (both disperse the cloud) · dust collectors located **outside** and vented ·
explosion venting, suppression, and **isolation** (rotary valves, chokes) to stop propagation
· ignition source control (bonding/grounding, hazardous-location equipment, magnetic
separators and pneumatic tramp-metal removal, spark detection/extinguishing on ductwork) ·
housekeeping thresholds (accumulation over ~1/32 in — the thickness of a paperclip — across
5% of the floor area is a widely cited action threshold).

**Vacuums used in dust areas must be rated for the classification** — a shop vac is an
ignition source.

---

## 6. Fire detection

| Detector | Principle | Best for | Weakness |
|---|---|---|---|
| **Ionization smoke** | Radioactive source ionizes air; smoke particles disrupt current | **Fast, flaming** fires with small particles | Nuisance alarms near kitchens; slow on smoldering fires |
| **Photoelectric smoke** | Light scattering/obscuration by smoke | **Smoldering** fires with large particles | Slower on fast flaming fires |
| **Fixed-temperature heat** | Fusible element or bimetal at a set point | Dirty, dusty, high-nuisance areas | **Slowest** — significant fire before actuation |
| **Rate-of-rise heat** | Actuates on a rapid temperature rise (~12–15 °F/min) | Faster than fixed-temperature | Missed slow-growth fires; usually combined with fixed-temp |
| **Rate-compensated** | Combines both | Reduces the thermal-lag error | |
| **Flame (UV/IR)** | Detects radiant energy from flame | Fast, high-hazard areas — flammable liquid handling, aircraft hangars | Needs line of sight; false alarms from welding, sunlight, hot surfaces |
| **Air-sampling / aspirating (VESDA)** | Continuously draws air to a laser chamber | **Very early warning** — data centers, clean rooms, high-value assets | Cost |
| **Gas detection** | Combustible or toxic gas | Leak detection before ignition | Not a fire detector |

**Rule of thumb:** smoke detectors respond faster than heat detectors; heat detectors are for
places where smoke detection would nuisance-alarm constantly. Flame detectors are the fastest
where a flaming fire is the credible scenario.

**Notification and alarm:** NFPA 72 (National Fire Alarm and Signaling Code). Manual pull
stations near exits, along the natural egress path, travel distance ≤200 ft. Audible signal
**at least 15 dBA above ambient** or 5 dBA above the maximum sound level lasting 60 seconds;
temporal-three pattern for evacuation. Visible (strobe) notification for the hearing impaired.

---

## 7. Fire suppression

### Sprinkler systems

| System | How it works | Where used |
|---|---|---|
| **Wet pipe** | Water in the pipes at all times; the fused sprinkler flows immediately | The default — simplest, most reliable, fastest |
| **Dry pipe** | Pipes hold pressurized air; a dry-pipe valve releases water when a head fuses | **Freezing environments** (unheated warehouses, loading docks, parking garages). Slower — there's a delay while air evacuates |
| **Preaction** | Requires **two events**: a detection device operates **and** a sprinkler fuses. Single- or double-interlock | Water-sensitive occupancies — data centers, museums, archives. Prevents accidental discharge |
| **Deluge** | **All heads are open**; a detection system opens the deluge valve and the entire area is flooded | High-hazard, fast-spreading — flammable liquid areas, aircraft hangars, transformer decks |
| **Water mist** | Fine droplets; cooling plus local oxygen displacement | Machinery spaces, marine, where water damage or supply is limited |
| **Foam-water** | Foam concentrate injected | Flammable liquid hazards |

**Sprinklers control fires; they rarely extinguish them alone — and only the heads over the
fire operate** (except deluge). The "all the sprinklers go off like in the movies" idea is a
classic distractor.

**Sprinkler temperature ratings and frame color codes:**

| Rating | Temperature | Color |
|---|---|---|
| Ordinary | 135–170 °F | Uncolored / black |
| Intermediate | 175–225 °F | **White** |
| High | 250–300 °F | **Blue** |
| Extra high | 325–375 °F | **Red** |
| Very extra high | 400–475 °F | **Green** |
| Ultra high | 500–575 °F | **Orange** |

Glass bulb liquid colors run a different scale (orange 135 °F, red 155, yellow 175, green
200, blue 286, purple 360, black 440+).

**Design and clearance:** **18 in minimum clearance** below sprinkler deflectors for storage
— the most-commonly-cited sprinkler violation in a warehouse. NFPA 13 occupancy hazard
classifications: Light, Ordinary Group 1 and 2, Extra Hazard Group 1 and 2, plus special
storage criteria. Density/area method: design density in gpm/ft² over a design area.

**Hydraulics:**

```
Q = K √P        Q = flow (gpm), K = sprinkler K-factor, P = pressure (psi)
```

Note **P is under a square root** — quadrupling the pressure only doubles the flow. Standard
½-in orifice K ≈ 5.6; large-orifice and ESFR heads run much higher (11.2, 14.0, 25.2).

**Control valves must be supervised** (locked open, tamper-switched, or under a weekly
inspection program). **A closed valve is the single most common cause of sprinkler-system
failure.**

### Standpipes and hose (NFPA 14)

- **Class I** — 2½-in connections for **fire department** use
- **Class II** — 1½-in hose stations for **trained occupants** (largely discouraged now)
- **Class III** — both

### Special hazard systems

- **CO₂** — leaves no residue, non-conductive. **Lethal at design concentrations** (34%+ for
  most fuels vs. an IDLH of 40,000 ppm = 4%). Requires pre-discharge alarms, time delay,
  lockout for occupied spaces, and it is a recognized fatality hazard in total-flooding
  applications.
- **Clean agents (NFPA 2001)** — halocarbon (FM-200/HFC-227ea, FE-13, Novec 1230) and inert
  gas (IG-01, IG-55, IG-100, IG-541). Designed to leave breathable atmospheres. Halon 1301
  is phased out under the Montreal Protocol (ozone depletion) — existing systems may
  continue but the agent isn't produced.
- **Kitchen hood systems (NFPA 96 / UL 300)** — wet chemical, must shut down fuel/power on
  discharge, semiannual inspection.
- **Fire pumps (NFPA 20)** — weekly no-flow churn test (or monthly for electric under the
  current edition) and **annual flow test**.

### Portable fire extinguishers (1910.157 / NFPA 10)

**Travel distance to an extinguisher:**

| Class | Maximum travel distance |
|---|---|
| **A** | **75 ft** |
| **B** | **50 ft** |
| **C** | Based on the underlying A or B hazard |
| **D** | **75 ft** |
| **K** | **30 ft** |

**Inspection and maintenance:** **monthly visual inspection** (in place, accessible, seal
intact, gauge in range, no damage) · **annual maintenance** by a qualified person ·
**hydrostatic test**: 12 years for dry chemical (stored pressure), **5 years for CO₂ and
water/wetting agent**, and 5 years for hose. Internal examination intervals vary by type.

**Rating numbers:** a **4-A:20-B:C** extinguisher — the A number is a relative measure
(1-A ≈ 1.25 gal of water); the **B number is the approximate square feet** of flammable
liquid fire a non-expert can extinguish; **C carries no number**, it only indicates
non-conductivity.

**Use: P-A-S-S** — **P**ull the pin, **A**im at the base of the fire, **S**queeze the handle,
**S**weep side to side. Stand 6–8 ft back, back away — never turn your back.

**The employer may instead have a total evacuation policy** and remove extinguishers from
the workplace, in which case the training requirement drops away. If extinguishers are
provided for employee use, employees must be trained **upon initial assignment and at least
annually**.

---

## 8. Passive protection, egress, and housekeeping

- **Fire-resistance ratings** — assemblies rated in hours (1-, 2-, 3-, 4-hour) by ASTM E119
  testing. **Firewalls** are structurally independent and extend through the roof;
  **fire barriers** and **fire partitions** are lesser. **Penetrations must be firestopped**
  with a listed system — an unsealed conduit penetration voids the rating of the whole wall.
- **Fire doors** must be self-closing or automatic-closing, and **never blocked, wedged, or
  propped open**. Annual inspection under NFPA 80.
- **Flame spread index (ASTM E84 / NFPA 255)**: Class A (0–25), Class B (26–75), Class C
  (76–200). Lower is better. Red oak = 100 by definition, inorganic reinforced cement board = 0.
- **Means of egress (1910.36–.37 / NFPA 101)**: three parts — **exit access, exit, exit
  discharge**. At least **two exit routes** (more if the number of employees, size, or
  arrangement won't allow safe evacuation), located **as far apart as practical**. Exit
  routes must be **permanent**, adequately lit, **unlocked from the inside**, unobstructed,
  and marked by a sign reading **"EXIT"** with letters at least 6 in high and 3/4 in stroke
  width. Doors swing in the direction of travel when serving 50+ occupants or a high-hazard
  area. Exit route capacity sized to the occupant load; minimum ceiling 7 ft 6 in, minimum
  width 28 in. **Dead-end corridors** limited (generally 20 ft, 50 ft in sprinklered
  occupancies).
- **Emergency lighting** and illuminated exit signs, tested monthly (30 s) and annually
  (90 min).
- **Housekeeping** is a fire-prevention control, not tidiness: control accumulation of
  combustibles, keep oily rags in **self-closing metal containers** emptied daily
  (spontaneous heating of linseed-oil rags is a real ignition mechanism), maintain the 18-in
  sprinkler clearance, keep aisles and exits clear, separate incompatible materials,
  and keep electrical panels clear (**36 in working clearance** under NFPA 70/1910.303).
- **Separation and segregation** — separate by distance and barriers: oxidizers away from
  flammables and organics, acids from bases, water-reactives from all water sources,
  flammables from ignition sources, **oxygen cylinders 20 ft from fuel gas or a 5-ft
  half-hour-rated barrier**. Store flammables in approved cabinets, not on open shelves; keep
  them out of ordinary domestic refrigerators (the compressor and light are ignition sources
  — use a **lab-safe/explosion-proof** unit).

---

## 9. Signs and labels

- **ANSI Z535** — the standard for safety signs, colors, and symbols. Signal words match GHS:
  **DANGER** (red — imminent hazard, will result in death or serious injury), **WARNING**
  (orange — could result in death or serious injury), **CAUTION** (yellow — could result in
  minor or moderate injury), **NOTICE** (blue — property damage or a practice, **not**
  personal injury), **SAFETY INSTRUCTIONS** (green).
- OSHA 1910.145 defines the older scheme: **Danger (red/black/white)**, **Caution
  (yellow/black)**, **Safety instruction (green/white)**.
- Fire equipment identification is **red**; the location of fire equipment must be marked so
  it's visible from a distance where extinguishers are obstructed from view.
- **"NO SMOKING"** signage in flammable storage and dispensing areas.
- NFPA 704 diamonds on tanks, entrances to storage rooms, and building entries — for
  responders. See §2.

---

## 20 things they actually ask — Domain 4

1. The fourth leg of the tetrahedron is the **uninhibited chemical chain reaction**
2. The dust pentagon adds **dispersion** and **confinement**
3. Class D = combustible metals = **dry powder**, never water; Class K = wet chemical
4. Class C is defined by **energized equipment**, and reclassifies once de-energized
5. **Flash point** classifies a liquid; **100 °F** divides flammable from combustible
6. NFPA 30 Class IA vs. IB is decided by **boiling point**
7. Vapor density >1 means the vapor travels along the floor to a remote ignition source
8. Above the UEL is still lethal — it becomes flammable as it dilutes
9. A combustible gas meter reads **% of LEL**, not % by volume; confined space limit **<10%**
10. NFPA 704: **4 = worst**; GHS: **Category 1 = worst**
11. Blue/red/yellow/white = health/flammability/instability/special (W̶, OX, SA)
12. Hot work: **35 ft** radius, fire watch **30 min (OSHA) / 60 min (NFPA 51B)**
13. Never weld on a container until it's been cleaned, purged, and tested gas-free
14. Bonding **and** grounding for flammable liquid transfer — static is the ignition source
15. Combustible dust: secondary explosions, vacuum instead of compressed air, NFPA 652 DHA
16. Ionization = fast flaming; photoelectric = smoldering; heat detectors are slowest
17. Wet vs. dry vs. preaction vs. deluge, and which occupancy each fits
18. Only the sprinklers over the fire operate; **18 in clearance** below deflectors
19. Extinguisher travel distance: **A = 75 ft, B = 50 ft, K = 30 ft**; monthly inspection,
    annual maintenance, **CO₂ hydrotest at 5 years, dry chemical at 12**
20. Two exit routes minimum, unlocked from the inside, 6-in "EXIT" letters
