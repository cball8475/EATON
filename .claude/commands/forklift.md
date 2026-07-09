---
description: Ingest Powerfleet impact report to D1; build plant email + chart
---

# Skill: Forklift Impact Tracking & Plant Email

**Trigger:** Charlie drops a Powerfleet "Impact Detail by Operator" report (`.xls` or `.xlsx`),
or types `/forklift`. Also covers requests to regenerate the plant-wide impact email or pull
operator tallies / trend data.

**Purpose:** Maintain a persistent per-operator impact log in D1 for monthly/quarterly trending,
and generate the plant-wide High/Severe impact email + copy-paste chart. Email cadence: at least
3x/week (Mon, Wed, Fri).

---

## Counting rules (locked 06/30/2026)

- **Floor date: `2026-06-30`.** Only impacts dated 06/30 or later count toward the official tally.
  Anything earlier is stored for baseline but flagged `counts_toward_tally=0` and excluded from
  the tally view.
- **Dedup key:** `(operator, vehicle, impact_datetime, severity, impact_loc)`. The same impact
  appearing in both a weekly and a daily Powerfleet pull inserts once. This also collapses the
  exact-duplicate rows Powerfleet sometimes emits.
- **One row per impact event.** Tallies are computed on demand — never maintain a separate counter.

Two different questions run off the same table:
1. **Trending tally** (what Charlie asked for) — cumulative from the floor date. Use `v_forklift_tally`.
2. **Badge-deactivation enforcement** — rolling 14-day window, threshold = 1+ Severe OR 2+ High.
   Separate query (see below). Do not conflate the two.

---

## D1 location

- Database: `eaton-ehs-dashboard` (`62ce85d7-0cc1-4832-aa57-d5b09ceaa132`)
- Access: Cloudflare Developer Platform MCP → `d1_database_query`. (No Worker endpoint yet;
  add `/forklift` to the Worker only if a dashboard tile is wanted.)

### Table: `forklift_impacts`
```
id INTEGER PK
operator TEXT            -- "Last, First" as it appears in the report
operator_id TEXT         -- badge ID if present (usually NULL; only the manual single-incident format has it)
vehicle_raw TEXT         -- as-reported, e.g. "FS 00045" or "42"
vehicle TEXT             -- normalized, e.g. "F45", "F42"
impact_datetime TEXT     -- "YYYY-MM-DD HH:MM:SS"
impact_date TEXT         -- "YYYY-MM-DD"
severity TEXT            -- 'Severe' | 'High'  (CHECK constrained)
impact_loc TEXT          -- full, e.g. "Near WAP: AP 13 C108"
ap_location TEXT         -- extracted, e.g. "AP 13 C108"
engine_state TEXT
source_file TEXT
counts_toward_tally INTEGER  -- 1 if impact_date >= floor, else 0
ingested_at TEXT
UNIQUE(operator, vehicle, impact_datetime, severity, impact_loc)
```

### View: `v_forklift_tally`
Cumulative tally per operator+truck, floored at 06/30. Columns: operator, vehicle, severe, high,
total, first_impact, last_impact. Ordered worst-first.

### Table: `email_templates`
Reusable email shells. The forklift email lives here — pull it, don't retype boilerplate.
```
name TEXT UNIQUE     -- 'forklift_impact'
subject TEXT         -- 'Forklift Impact Report — High & Severe — {{DATE_RANGE}}'
body TEXT            -- boilerplate + {{PLACEHOLDER}} tokens
notes TEXT           -- fill rules + launch-only lines
version INTEGER
updated_at TEXT
```

---

## Parsing notes

- **`.xlsx`** (newer Powerfleet export): date cells are strings `YYYY-MM-DD HH:MM:SS`. Read with
  openpyxl, `data_only=True`.
- **`.xls`** (JasperReports binary, OLE2): date cells are **Excel serial numbers** (e.g. `46202.259`).
  Need `xlrd` (`pip install xlrd --break-system-packages`). Convert:
  `datetime(1899,12,30) + timedelta(days=serial)`.
- **Header row** is row index 1 (0-based) with columns at: Operator=2, Vehicle=3, Impact Date Time=4,
  Severity=5, Impact_Loc=10. Data starts next row; stop at the first row whose col 0 starts with "Report".
- **Vehicle normalize:** strip non-digits, drop leading zeros, prefix `F`. `FS 00045`→`F45`, `42`→`F42`,
  `FS 02040`→`F2040`.
- **AP extract:** regex `(AP \d+ \w+)` against impact_loc.
- **Severity map:** contains "SEVERE" → `Severe`, else → `High`.
- **Report period** is in the footer rows ("Report Period: …", "From/To Date: …"). Use it to set the
  email's date range, but never trust it for the tally — the tally floor is fixed at 06/30.

---

## Workflow when a report is dropped

1. Read the file from `/mnt/user-data/uploads`. Parse to rows (see notes above).
2. **Dedup-insert** into `forklift_impacts` with `ON CONFLICT(...) DO NOTHING`. Set
   `counts_toward_tally = 1 WHEN impact_date >= '2026-06-30' ELSE 0`.
3. Report what was new: rows inserted vs collapsed, and any operator who **newly crosses** the
   rolling-14-day enforcement threshold.
4. **Build the email from the stored template** (do NOT retype the boilerplate):
   a. `SELECT subject, body, notes FROM email_templates WHERE name='forklift_impact';`
   b. Fill the five placeholders from the current tally (rules below / in the `notes` column):
      `{{DATE_RANGE}}`, `{{FLAGGED_OPERATORS}}`, `{{MONITOR_LIST}}`, `{{UNASSIGNED_TRUCKS}}`,
      `{{LOCATION_NOTES}}`.
   c. Output via `message_compose_v1` (kind=email) using the filled subject + body.
   d. If a section has nothing, write "None this period." (for LOCATION_NOTES, omit the heading).
5. Regenerate the copy-paste HTML chart at `/mnt/user-data/outputs/forklift-impact-chart.html`
   (Operator / Severe / High / Truck; flagged rows red+bold, unassigned yellow).
6. Unassigned trucks: never flag a badge; call out the truck for inspection + "who's running it
   un-badged / what tasks." Keep these in their own section.
7. Surface location/equipment patterns (same AP across multiple trucks = aisle/layout suspect;
   same truck throwing severes under multiple operators = unit suspect).

### Placeholder fill rules (canonical copy lives in `email_templates.notes`)
- **{{DATE_RANGE}}** — report period, e.g. `06/30–07/02/2026`.
- **{{FLAGGED_OPERATORS}}** — one block per threshold-crosser (rolling 14d, 1+ Severe or 2+ High):
  `Name — Truck — X Severe, Y High` then indented bullets `Severity — AP loc — MM/DD H:MM AM/PM`.
- **{{MONITOR_LIST}}** — bullet per below-threshold operator:
  `Name — Truck — 1 High — AP loc — MM/DD time`.
- **{{UNASSIGNED_TRUCKS}}** — per unassigned truck: narrative line
  (`F## logged N impacts this period (S Severe, H High) with no operator badged in — concentrated at
  <APs>. The owning area needs to identify who has been operating F## and what tasks it is used for.
  I will reach out to Powerfleet to have this unit inspected.`) then impact bullets.
- **{{LOCATION_NOTES}}** — bullets for AP-across-multiple-trucks hotspots and same-truck/multi-operator
  equipment suspects.

### Launch-only lines (first send 06/30/2026 — not in the recurring template)
Stored in `email_templates.notes`. Only re-add if explicitly relaunching:
- After the AP-map line: "This email serves as our starting point."
- FLAGGED intro launch wording: "After today, we will begin counting impacts. If we were already
  counting, these operators' badges would be turned off pending investigation. Supervisors, we still
  need yall to complete your investigation for the below incidents."

### Editing the template
Change wording once, in D1 — never fork it into the skill:
```sql
UPDATE email_templates
SET body = '<new body>', version = version + 1, updated_at = datetime('now')
WHERE name = 'forklift_impact';
```

---

## Standard queries

**Official cumulative tally (the view):**
```sql
SELECT * FROM v_forklift_tally;
```

**By operator only (combine trucks):**
```sql
SELECT operator,
       SUM(CASE WHEN severity='Severe' THEN 1 ELSE 0 END) AS severe,
       SUM(CASE WHEN severity='High'   THEN 1 ELSE 0 END) AS high,
       COUNT(*) AS total
FROM forklift_impacts
WHERE impact_date >= '2026-06-30'
GROUP BY operator
ORDER BY severe DESC, high DESC;
```

**Badge-enforcement check (rolling 14 days, 1+ Severe or 2+ High):**
```sql
SELECT operator,
       SUM(severity='Severe') AS severe,
       SUM(severity='High')   AS high
FROM forklift_impacts
WHERE impact_date >= date('now','-13 days') AND operator <> 'Unassigned'
GROUP BY operator
HAVING severe >= 1 OR high >= 2;
```

**Monthly trend (per operator, per month):**
```sql
SELECT strftime('%Y-%m', impact_date) AS month, operator,
       SUM(severity='Severe') AS severe, SUM(severity='High') AS high, COUNT(*) AS total
FROM forklift_impacts
WHERE impact_date >= '2026-06-30'
GROUP BY month, operator
ORDER BY month, severe DESC;
```

**Quarterly trend (whole plant):**
```sql
SELECT
  CASE
    WHEN strftime('%m', impact_date) IN ('01','02','03') THEN strftime('%Y',impact_date)||'-Q1'
    WHEN strftime('%m', impact_date) IN ('04','05','06') THEN strftime('%Y',impact_date)||'-Q2'
    WHEN strftime('%m', impact_date) IN ('07','08','09') THEN strftime('%Y',impact_date)||'-Q3'
    ELSE strftime('%Y',impact_date)||'-Q4'
  END AS quarter,
  SUM(severity='Severe') AS severe, SUM(severity='High') AS high, COUNT(*) AS total
FROM forklift_impacts
WHERE impact_date >= '2026-06-30'
GROUP BY quarter ORDER BY quarter;
```

**Truck hotspots / AP hotspots:**
```sql
SELECT vehicle, COUNT(*) total FROM forklift_impacts WHERE impact_date>='2026-06-30' GROUP BY vehicle ORDER BY total DESC;
SELECT ap_location, COUNT(*) total FROM forklift_impacts WHERE impact_date>='2026-06-30' GROUP BY ap_location ORDER BY total DESC;
```

---

## Notes / gotchas

- `Sharpe, Angela` and `Sharper, Everette` are different people — both ran truck F28. Don't merge.
- Operator IDs (badge numbers) aren't in the standard report, only names. Dedup is name-based; watch
  for name spelling drift creating phantom operators.
- If a report fetch/parse fails, ask Charlie to re-export or paste; don't guess.
- The historical 06/21–06/29 rows are `counts_toward_tally=0`. To wipe the baseline later:
  `DELETE FROM forklift_impacts WHERE counts_toward_tally=0;`
- Template + tally are the source of truth. If the email wording needs to change permanently, update
  `email_templates`, not this file.
