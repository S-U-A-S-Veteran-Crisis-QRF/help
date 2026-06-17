---
title: Director's Dashboard — S.U.A.S. Veteran Crisis QRF
description: Operations dashboard for Jacob Silver, Founder/Director. Quick links and org status at a glance.
permalink: /dashboard/
sitemap: false
---

# Director's Dashboard

*For Jacob Silver, Founder/Director. Bookmark this page.*

> **In immediate crisis?** **Veterans Crisis Line: dial 988, press 1.** Text 838255. [VeteransCrisisLine.net](https://www.veteranscrisisline.net/)

---

## Quick actions

| If you want to… | Go here |
|---|---|
| Check email | [Gmail — jacobsilver@suasqrf.org](https://mail.google.com/) |
| Check the calendar | [Google Calendar](https://calendar.google.com/) |
| See what's broken / what's pending | [GitHub Issues](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues) |
| See what's in review | [GitHub PRs](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pulls) |
| See the live public site | [saus.noaerth.com](https://saus.noaerth.com/) |
| See if Pages deploy is green | [GitHub Actions](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/actions) |
| Manage donations | [GoFundMe — Support Our Heroes](https://www.gofundme.com/f/support-our-heroes-combating-veteran-isolation) |
| Manage Facebook | [Page](https://www.facebook.com/suasqrf/) · [Group](https://www.facebook.com/groups/451663376808281/) |
| Fix a tech problem | [RUNBOOK](./RUNBOOK.md) |
| Update site content | Edit [`index.md`](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/blob/main/index.md) on GitHub |

---

## Organization snapshot

- **Legal name**: S.U.A.S. Veteran Crisis QRF
- **EIN**: 88-3249428
- **IRS classification**: 501(c)(3) public charity, 170(b)(1)(A)(vi)
- **Effective date of exemption**: July 8, 2022
- **HQ**: 727 Edge Lane, Los Altos, CA 94024
- **Founder/Director**: Jacob Silver — jacobsilver@suasqrf.org — (925) 727-6109
- **Official IRS Determination Letter**: [PDF](./docs/IRS-Determination-Letter.pdf)
- **Charity profiles**: [Charity Navigator](https://www.charitynavigator.org/ein/883249428) · [GuideStar](https://www.guidestar.org/profile/88-3249428)

## Leadership directory

| Role | Person |
|---|---|
| Founder / Director / Asst. CFO | Jacob Sterling Silver |
| CEO | Mary Frances Declercq |
| CFO | Jose Alcantar |
| Vice President | Glen Cederholm |
| Secretary | Brant Cassidy Rigden Creamer |

---

## Tech stack — at a glance

| System | Where | Status |
|---|---|---|
| Public landing site | [saus.noaerth.com](https://saus.noaerth.com/) (GitHub Pages) | Live once DNS + Pages enabled |
| `suasqrf.org` domain | Registrar (TBD) | Down — DNS not set. See [RUNBOOK §1](./RUNBOOK.md#1-fix-the-domain-suasqrforg) |
| Old Google Site | `sites.google.com/view/suausqrf/home` | Inoperative — being retired |
| Google Workspace | [admin.google.com](https://admin.google.com/) | Active |
| Director email | `jacobsilver@suasqrf.org` | Active |
| Source repo | [GitHub](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help) | Active |

---

## Working with Claude (and any agent)

This repo auto-loads SUAS context for every Claude Code session via `.claude/skills/suas-bootstrap/`. All agents working SUAS — `suas-tech`, the main assistant, anything you spawn — read the same playbook.

Useful things to say:

- "Fix the domain." → Claude diagnoses DNS and gives you copy-paste records.
- "Update the landing page to mention [X]." → Claude opens a PR.
- "What's broken right now?" → Claude scans issues, Actions, and the live site.
- "Show me the dashboard." → opens this page.

The **suas-tech** subagent is the dedicated tech specialist. The main Claude session will route to it automatically for SUAS infrastructure questions.

This repo also ships gstack (Garry Tan's Claude Code framework) on session start. Useful slash commands for SUAS work:

- `/document-release` — refresh docs after a site change
- `/design-review` — audit the public site for visual issues
- `/cso` — security review (donor links, forms)
- `/learn` — preserve editorial decisions across sessions

---

## Veteran-safety checklist (before publishing anything public)

- [ ] Crisis Line (**988, press 1**) is on the page
- [ ] No veteran PII (names, contact info, intake details)
- [ ] No glorification of violence
- [ ] Tax-deductibility claims cite IRC §170
- [ ] Testimonials / photos have explicit consent

---

*Shut Up And Serve.*
