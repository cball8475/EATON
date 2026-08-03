# Deliverables

Documents produced for someone outside this repo — Kate, Laura, corporate. Generated
artifacts live here alongside the script that builds them, so a correction means editing
the script and re-running rather than hand-patching the output.

| File | For | Built by | Notes |
|---|---|---|---|
| `EHS_Project_Roadmap_2026-2027.xlsx` | Kate Fowler | `build.py` | Six-priority roadmap requested 31-Jul-2026, dated through Q2 2027. Kate fills column I on the Roadmap tab. |

## Rebuilding

```bash
cd deliverables && python3 build.py
```

Needs `openpyxl`. The workbook ships without cached formula values — the Summary tab
populates on first open in Excel. Formulas are Excel-2007-era only (`COUNTIF`, `SUM`,
`MAX`, `IF`); no `_xlfn.` prefixes and no spilling array functions, so nothing depends on
a recalculation pass that this environment cannot run.

Source data is D1, not this repo. Task and knowledge IDs referenced in the workbook
(`#521`, `KN #467`, …) resolve against the EHS command centre.
