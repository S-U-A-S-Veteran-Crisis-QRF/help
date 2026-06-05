# Reskin Checklist — handoff to a Claude session

**Prerequisite:** `source_ams_test_coin.3mf` is present in this folder.
If it isn't, stop and tell Jacob to do Step A in README.md first.

A `.3mf` is a renamed zip. Inside it you'll find:
- `3D/3dmodel.model` — XML mesh and per-object metadata
- `Metadata/` — slicer settings, filament assignments
- Texture / SVG assets if the model uses image regions

## Tasks for the Claude session

1. **Unzip** `source_ams_test_coin.3mf` to a temp dir. Inventory the
   files. Identify which asset drives the obverse emblem.
2. **Replace** that asset with `../01_challenge_coin_generator/suas_logo.svg`
   (rasterize to PNG at the same dimensions as the source asset if the
   source is PNG; keep as SVG if the source is SVG).
3. **Edit** the model XML to update any text labels:
   - top arc → `SHUT UP AND SERVE`
   - bottom arc → `988 - PRESS 1`
4. **Verify filament assignments** in `Metadata/`:
   - slot 1 → navy (PLA Matte Dark Blue 10103)
   - slot 2 → gold (PLA Silk Gold 13601)
   - slot 3 → ivory (PLA Matte Ivory White 10100) ← crisis-line text
   - slot 4 → gunmetal (PLA Matte Dark Grey 10102)
5. **Rezip** as `suas_ams_coin_v1.3mf`. Do not change the zip's
   internal structure or Bambu Studio will reject it.
6. **Report** to Jacob: confirm crisis-line text landed on slot 3,
   confirm filename, list any structural assumptions you had to make.

## Hard rules

- Do not modify the geometry of the coin body, the rim, or the text
  extrusions. Reskin only.
- Do not commit `source_ams_test_coin.3mf` or `suas_ams_coin_v1.3mf`
  to git (binary, large). Leave them in this folder ignored.
- Crisis-line text must end up on the highest-contrast filament slot
  relative to the field color. If filament assignments change, re-verify.
