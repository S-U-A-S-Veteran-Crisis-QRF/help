# S.U.A.S. Veteran Crisis QRF — 4-Color Service Badge

A printable 4-color service badge for the **Bambu Lab A1 Mini + AMS Lite**,
sliced in **Orca Slicer** (also opens in Bambu Studio).

## What's in this folder

| File | Purpose |
|---|---|
| `suas_badge_4color.3mf` | **Main file** — open this directly in Orca Slicer. All 4 parts pre-assembled with filament assignments. |
| `01_base_black.stl` | Part 1 — base disk (extruder 1) |
| `02_ring_red.stl` | Part 2 — outer ring (extruder 2) |
| `03_star_white.stl` | Part 3 — 5-point star (extruder 3) |
| `04_inner_star_gold.stl` | Part 4 — inner accent star (extruder 4) |
| `generate_badge.py` | Source script. Re-run to regenerate if you tweak dimensions. |

## Recommended filaments (AMS Lite slots)

| Slot | Color | Suggested Bambu PLA |
|---|---|---|
| 1 | Black | PLA Basic Black |
| 2 | Red | PLA Basic Red |
| 3 | White | PLA Basic White |
| 4 | Gold / Yellow | PLA Basic Sunflower Yellow or PLA Silk Gold |

## Print in Orca Slicer — quickstart

1. Open **Orca Slicer**.
2. Select printer profile **Bambu Lab A1 Mini 0.4 nozzle**.
3. `File → Open Project…` and choose `suas_badge_4color.3mf`.
4. In the right-hand panel you'll see four parts. Confirm each part's
   **Extruder** matches the table above. If Orca asks you to remap,
   assign part 1→filament 1, part 2→filament 2, etc.
5. **Recommended slice settings**
   - Layer height: **0.2 mm**
   - Walls: **3**, Top/Bottom layers: **4**
   - Infill: **15% grid** (it's a thin badge — infill barely matters)
   - Supports: **off** (design has no overhangs)
   - Prime tower: **on** (required for multi-color)
   - Brim: **off** unless adhesion is bad
6. Slice. Expected print time ~35–45 min, ~6 g filament total.

## If the 3MF colors don't auto-assign

Some Orca versions ignore Bambu-style filament metadata in imported
3MFs. Easiest fix:

1. Open `suas_badge_4color.3mf`.
2. Click each part in the Objects panel.
3. In the right inspector → **Filament** dropdown → pick the slot
   number matching the part name prefix (`01_*` → slot 1, etc.).

Or skip the 3MF and import the four STLs individually with
`File → Import → Import STL/OBJ…`, select all four, and **enable
"Load as single object"**. Each STL was generated at the same origin
so they auto-align. Then assign filaments as above.

## Dimensions

- Diameter: 70 mm
- Total thickness: 3.2 mm
- All features positioned around (0, 0, 0) so parts auto-align on import

## Veteran-safety notes

This is a physical morale / thank-you item — no veteran PII, no crisis
content baked into the model. Per repo rules, anything we publish on
behalf of the badge (event flyer, social post) must still carry the
**Veterans Crisis Line: dial 988, press 1**.
