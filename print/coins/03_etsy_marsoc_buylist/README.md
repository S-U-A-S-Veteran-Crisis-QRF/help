# Path 3 — Marketplace buylist for a SUAS-style coin STL

**Status: HONEST CEILING.** This was supposed to be a curated list of
3 specific Etsy listings. I cannot deliver that from this environment
because Etsy, Cults3D, MakerWorld, CGTrader, and Thangs are all on the
sandbox egress denylist (`x-deny-reason: host_not_allowed` for every
host I tried — see `fetch-attempt.log`). I am not going to invent
listing titles, sellers, or prices. Fabricated buylists are how Jacob
ends up paying a seller who doesn't exist.

What this folder gives you instead:
1. A **search playbook** — the exact queries that surface the right
   listings, in priority order.
2. A **vetting rubric** — what to check before clicking Buy.
3. A **fill-in buylist template** — paste 3 real listings into it and
   it becomes the deliverable.
4. `INSTRUCTIONS.md` — what to do *after* purchase to get a 4-color
   `.3mf` on the A1 Mini.

---

## Search playbook (run these in this order)

Run each on Etsy first, then Cults3D, then MakerWorld free section.

1. `multicolor challenge coin stl AMS` — best hit rate; sellers who
   write "AMS" usually mean their file is already filament-split.
2. `marsoc challenge coin 3d print file` — finds spearhead/raider
   aesthetic. Most results are single-color; we want the ones with
   "multicolor" or "multi-filament" in the description.
3. `veteran challenge coin stl multi color` — catches the donor-safe
   end of the aesthetic (less skull, more eagle/flag).
4. `bambu A1 mini challenge coin 3mf` — narrowest, highest quality;
   if any results exist, they're pre-tuned for the exact printer.

Stop when you have 5 candidates that pass the vetting rubric below.
Pick the best 3 and fill in the table.

---

## Vetting rubric — check each before buying

| Check | Why it matters | Pass = |
|---|---|---|
| Multi-filament native (`.3mf` with color regions, not just colored STL) | Otherwise you're back to manual paint-by-numbers in the slicer | Listing says "AMS-ready" or "multi-color 3mf" |
| Commercial-use / nonprofit-use license | SUAS is a 501(c)(3) — coins given to donors/volunteers are arguably commercial use | License explicitly allows nonprofit/redistribution, OR you message the seller and get it in writing |
| Aesthetic fit | We want restrained military, not edgelord skull-stack | Look at the preview render — would you wear this on a uniform? |
| No real unit insignia | Don't buy a coin with the actual MARSOC raider crest, Ranger scroll, or SF crest — those are protected | Custom emblem only |
| Size ≥ 40 mm | Under 40 mm, the crisis-line text won't print legibly on a 0.4 mm nozzle | Listed diameter ≥ 40 mm |
| Editable text regions | We need to add "988 PRESS 1" | Seller confirms text is editable, or file is an OpenSCAD / Fusion source not just STL |

If a listing fails any row, drop it. Three pass-all listings beats six maybes.

---

## Buylist template — fill this in after you search

Paste your top 3 into this table and this README becomes the deliverable
you asked for.

| # | Title | Seller / URL | Price | License | Multi-filament? | Why it fits SUAS | What we'd adapt |
|---|---|---|---|---|---|---|---|
| 1 | _(paste)_ | _(paste)_ | _(paste)_ | _(paste)_ | Y/N | _(one line)_ | _(one line)_ |
| 2 | _(paste)_ | _(paste)_ | _(paste)_ | _(paste)_ | Y/N | _(one line)_ | _(one line)_ |
| 3 | _(paste)_ | _(paste)_ | _(paste)_ | _(paste)_ | Y/N | _(one line)_ | _(one line)_ |

---

## Veteran-safety filter (applies to all three picks)

Per `CLAUDE.md`:
- The coin will be handed to donors, volunteers, and veterans — treat
  it as donor-facing. **No glorification of violence.** Skip listings
  with weapons-as-centerpiece, skulls with bullet holes, or "punisher"
  imagery. A spearhead or eagle is fine. A pile of brass is not.
- **Crisis-line must fit.** If the design has no available real estate
  for "988 PRESS 1" on the reverse, reject it — that text isn't optional.
- **No real unit insignia.** SUAS is not a military unit; using one
  would misrepresent the org.

---

## What Jacob does next

1. Open Etsy. Run query #1 from the playbook.
2. Apply the vetting rubric to every candidate.
3. Paste the 3 best into the buylist table above and save this file.
4. Read `INSTRUCTIONS.md` for the post-purchase workflow.
5. Buy → download → follow `INSTRUCTIONS.md`.

---

## QC self-check (suas-qc rubric)

- Crisis line accounted for? **Yes — vetting rubric requires room for it.**
- PII? None.
- Plain language? Yes.
- Violence imagery? Filter explicitly excludes it.
- Tax claims? None.
- Honest about ceiling? **Yes — at the top of this file.** I did not
  fabricate listings to fake a complete deliverable.
