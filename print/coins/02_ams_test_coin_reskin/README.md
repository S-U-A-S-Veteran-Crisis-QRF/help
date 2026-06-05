# Path 2 — Reskin the AMS Test Coin

**Status:** Plan only. The source `.3mf` cannot be downloaded from this
environment (MakerWorld blocks all egress from the sandbox — see
`fetch-attempt.log`). Jacob downloads it manually in a browser; the
reskin plan below is what gets executed afterward.

**Source model:** "Small Multicolor AMS-Test-Coin" by Nolan Schmelzling
https://makerworld.com/en/models/1348327-small-multicolor-ams-test-coin

Why this model: it's already a 4-filament `.3mf` engineered to exercise
all four AMS slots cleanly on a small footprint (~40 mm). That means
the slicer's color regions are already separated — we don't have to
re-author geometry, only swap which artwork lives in which region.

---

## What Jacob does (step-by-step)

### Step A — Download the source (browser, ~2 min)
1. Open the source URL above in a browser (signed into MakerWorld).
2. Click **Download** → pick the `.3mf` (not the STL).
3. Save it into this folder as `source_ams_test_coin.3mf`.

### Step B — Pick a path forward
Either:
- **(b1)** Open it in Bambu Studio / Orca Slicer and follow the reskin
  recipe below yourself (~30 min), or
- **(b2)** Drop the file into this folder, start a Claude Code session,
  and say *"do the reskin per `RESKIN_CHECKLIST.md`"* — that file is in
  this folder. A Claude session with file access can edit the embedded
  SVG/PNG layers inside the `.3mf` (a `.3mf` is just a zip).

Path b2 is faster but requires the source file to be present first.
Neither path can happen until Step A.

---

## Reskin plan — what to keep, what to swap

The source is a four-region multicolor coin. We keep the geometry and
the slot count; we replace the artwork on the obverse and the text on
the reverse.

| Region | Source content | SUAS replacement | AMS slot |
|---|---|---|---|
| Coin body / field | Solid color disc | Keep — recolor to navy | 1 |
| Obverse emblem | Test-pattern artwork | **SUAS shield monogram** (reuse `../01_challenge_coin_generator/suas_logo.svg`) | 2 (silk gold) |
| Reverse top text | Generic banner | `SHUT UP AND SERVE` | 3 (ivory) |
| Reverse bottom text | Generic banner | `988 — PRESS 1` | 3 (ivory) |
| Edge / rim | Color band | Keep — recolor to gunmetal | 4 |

Filament SKUs match Path 1's table so a single AMS load covers both
coins:

| Slot | Color | Bambu SKU |
|---|---|---|
| 1 | Deep navy | PLA Matte Dark Blue `10103` |
| 2 | Warm gold | PLA Silk Gold `13601` |
| 3 | Ivory white | PLA Matte Ivory White `10100` |
| 4 | Gunmetal | PLA Matte Dark Grey `10102` |

---

## Reskin recipe (Orca / Bambu Studio, ~30 min)

1. Open `source_ams_test_coin.3mf`. Confirm 4 filaments load.
2. Right-click the obverse emblem region → **Replace texture / SVG**.
   Point at `../01_challenge_coin_generator/suas_logo.svg`. Scale to fit
   inside the rim with ~2 mm margin.
3. Right-click the top-arc text region → edit text → `SHUT UP AND SERVE`.
4. Right-click the bottom-arc text region → edit text → `988 - PRESS 1`.
   (Use a hyphen, not an em-dash; slicer fonts often miss em-dash.)
5. Reassign filament slots per the table above. **Verify slot 3 (ivory)
   is the one driving the crisis-line text** — that's the readability
   anchor. If it lands on slot 1 (navy), the number disappears.
6. Slice → preview → confirm color transitions look clean → export
   `.3mf` named `suas_ams_coin_v1.3mf` into this folder.
7. Send to A1 Mini. Print one. Inspect. Iterate filament assignments
   only — don't touch geometry.

---

## Honest ceilings

- We can't pre-verify the source file's internal structure without
  downloading it. The reskin steps above assume Schmelzling exposed
  the obverse emblem as a swappable image region (most AMS test coins
  do, since the whole point is "demo your image here"). If he baked
  the artwork into mesh instead, step 2 becomes "remesh in Bambu
  Studio's modifier-part flow" — slower but still doable.
- 988 crisis-line text at ~40 mm diameter on a 0.4 mm nozzle is at the
  edge of legibility. If the first print is unreadable, scale the coin
  to 45 mm before reslicing — don't shrink the text inside a 40 mm coin.
- PLA coin ceiling from Path 1 applies here too: this is a printable
  token, not a struck-metal coin.

---

## QC self-check (suas-qc rubric)

- Crisis line present? **Yes — reverse bottom arc.**
- PII? None.
- Plain language? Yes.
- Violence imagery? None.
- Tax claims? None.
- Would this look amateur next to a real military coin? At 40 mm in
  PLA, yes — that's the medium, not the design. The branding itself
  (shield + star + clean wordmark) is restrained on purpose so it
  doesn't try to compete with a struck coin and lose.
