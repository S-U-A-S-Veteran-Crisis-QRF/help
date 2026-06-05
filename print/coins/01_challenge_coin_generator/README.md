# Path 1 — MakerWorld Challenge Coin Generator

**Status:** Plan + input brief + placeholder logo. The generator itself
is a browser tool — you (Jacob) click through it in five minutes.

**Tool:** "Challenge Coin Generator" by Yannick Chenet
https://makerworld.com/en/models/1103761-challenge-coin-generator

It accepts an image + text and emits an AMS-ready 4-color `.3mf` you
slice and print on the A1 Mini. No CAD, no Blender, no polygon math.
This is why we're using it instead of hand-coding geometry.

---

## What Jacob does (5 steps, ~10 min)

1. Open the link above in a browser. Click **"Make"** (top right).
2. Upload `suas_logo.svg` from this folder as the obverse image.
3. Paste the **edge text** and **reverse text** from the brief below.
4. Pick the four filament slots from the **Filaments** section below.
5. Click **Generate**, download the `.3mf`, open in Bambu/Orca Studio,
   send to the A1 Mini.

That's it. The tool handles the displacement/extrusion automatically.

---

## Input brief

### Obverse (front) — image
- File: `suas_logo.svg` (this folder)
- Subject: SUAS shield monogram with star + "VETERAN CRISIS QRF" + "EST. 2022"
- Style: high-contrast black-on-white silhouette so the generator's
  color-pass cleanly separates foreground from background
- No combat imagery, no weapons, no skull. This coin is donor-safe so
  it can be handed out at events and to community partners without
  needing to explain context.

### Reverse text (top arc / bottom arc)
- Top arc: `SHUT UP AND SERVE`
- Bottom arc: `988 — PRESS 1`

The crisis line is the reverse anchor. Required by repo rules and it's
the actual reason the coin exists — something a veteran can keep in a
pocket that always knows the number.

### Edge text (wraps around the rim)
```
S.U.A.S. VETERAN CRISIS QRF  •  EIN 88-3249428  •  LOS ALTOS CA  •  NO ONE LEFT BEHIND  •
```
The bullets are intentional — they let the generator wrap cleanly
regardless of diameter. If the tool truncates, drop "LOS ALTOS CA" first.

### Diameter / thickness
- Diameter: **45 mm** (standard challenge-coin size; matches real
  MARSOC / unit coins so it feels right in hand)
- Thickness: **3.5 mm** (generator default is fine if 3.5 is unavailable)

---

## Filaments (Bambu PLA, 4-slot AMS)

| Slot | Role | Color | Recommended SKU |
|---|---|---|---|
| 1 | Coin base / field | Deep navy | **Bambu PLA Matte — Dark Blue** (`10103`) |
| 2 | Raised emblem + text | Warm metallic gold | **Bambu PLA Silk — Gold** (`13601`) |
| 3 | Star + crisis-line text accent | Off-white | **Bambu PLA Matte — Ivory White** (`10100`) |
| 4 | Edge ring / rim | Gunmetal | **Bambu PLA Matte — Dark Grey** (`10102`) |

Why these:
- Matte navy reads serious without going black-tactical.
- Silk gold is the closest single-filament approximation of a real
  minted brass coin. Avoid PLA Basic gold — it looks plastic.
- Ivory (not pure white) keeps the crisis-line text legible without
  the cheap "printer-paper" look pure white gives off PLA.
- Gunmetal rim frames the whole thing and hides minor layer lines.

**Honest ceiling:** A 3D-printed PLA coin will never match a struck
metal coin's weight or finish. It's a printable token, not a substitute
for a minted run. If/when SUAS wants to commission real metal coins,
this design becomes the artwork brief to a vendor like Signature Coins
or ChallengeCoins4Less.

---

## QC self-check (against suas-qc rubric)

- Crisis line present? **Yes — reverse bottom arc, "988 — PRESS 1".**
- PII? None.
- Plain language? Yes. "Shut Up And Serve" is the org motto, not jargon.
- Violence imagery? None. Shield + star + wordmark only.
- Tax-claim accuracy? No tax claims on a coin (correct — don't put
  "tax deductible" on a coin face).
- Modern-good check: compared to current MARSOC / Marine Raiders coins
  on Etsy, the design is intentionally less aggressive (no skull, no
  spearhead) because this is a community coin, not a unit coin. The
  visual ceiling is the generator itself; we're not trying to out-design
  a real mint.
