# After purchase — convert the STL/3MF into a SUAS A1 Mini print

You bought a coin file. Now you need it to be a 4-color print on the
Bambu A1 Mini with the AMS lite. Two cases:

## Case A — Seller delivered a multi-color `.3mf`

This is the happy path. The file already has color regions assigned to
filament slots.

1. Open the `.3mf` in Bambu Studio (or Orca).
2. Confirm the printer profile is **Bambu Lab A1 Mini** with **AMS lite**.
   If it isn't, set it.
3. Confirm 4 filament slots load. If the file uses more than 4, you'll
   need to merge two compatible regions onto one slot — usually the
   rim and the field can share a color.
4. Map slots to the SUAS palette (matches Paths 1 and 2):
   - Slot 1 → PLA Matte Dark Blue (10103) — field
   - Slot 2 → PLA Silk Gold (13601) — raised emblem
   - Slot 3 → PLA Matte Ivory White (10100) — crisis-line text
   - Slot 4 → PLA Matte Dark Grey (10102) — rim
5. Edit text regions: top arc = `SHUT UP AND SERVE`, bottom arc =
   `988 - PRESS 1`. If the file's text isn't editable, see Case B step 3.
6. Slice. Preview the color-change layers. Print one as a test.

## Case B — Seller delivered single-color STL only

Slower, but workable.

1. Open the `.stl` in Bambu Studio. Add it as a single part.
2. Use **Modifier parts** (Bambu Studio → Add Modifier → Cuboid /
   Cylinder) to define color regions. One modifier per intended color
   region: field, emblem, top text, bottom text, rim. Assign each
   modifier its own filament slot.
3. For text, the cleanest path is: delete the STL's baked-in text
   (use a negative modifier to subtract it), then add new text via
   **Add Text** with the SUAS copy (`SHUT UP AND SERVE` /
   `988 - PRESS 1`) on the appropriate filament slot.
4. Map the 4 slots to the SUAS palette as in Case A step 4.
5. Slice. Expect more filament purges than a native `.3mf` — that's
   normal for modifier-driven multicolor.
6. Print one as a test. Iterate on modifier placement, not on geometry.

## Print settings (A1 Mini, both cases)

- Layer height: **0.16 mm** (text legibility at this scale needs it).
- Wall loops: **3**.
- Top/bottom layers: **5 / 5**.
- Infill: **15% gyroid** (coin sits in a hand, not under load).
- Filament purge volume: **leave default** for first print, tune down
  after you see the actual transitions.
- Build plate: **textured PEI**. The matte side reads as "minted"
  better than the smooth side does.

## After the first print

- If 988 text is unreadable: scale the whole coin up to 45 mm before
  reslicing. Do not shrink other regions to make room.
- If the gold looks plastic: the slot 2 filament is probably PLA Basic
  Gold, not Silk Gold. Swap it.
- If color bleeds at transitions: bump purge volume in slicer by 20%.

## What not to do

- Do not modify the licensed geometry and redistribute. If the license
  is non-commercial and you've edited the file, the edited file is
  also non-commercial — don't share it on MakerWorld.
- Do not print these to sell. SUAS can hand them out to donors,
  volunteers, and partners. Selling them changes the tax and license
  posture and isn't worth it.
