---
title: Director's Dashboard — S.U.A.S. Veteran Crisis QRF
description: Operations dashboard for Jacob Silver, Founder/Director. Quick links and org status at a glance.
permalink: /dashboard/
sitemap: false
---

# Director's Dashboard

*For Jacob Silver, Founder/Director. Bookmark this page.*

> **In immediate crisis?** **Veterans Crisis Line: dial 988, press 1.** Text 838255. [VeteransCrisisLine.net](https://www.veteranscrisisline.net/)

## Live status

[![Pages deploy](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/actions/workflows/pages.yml/badge.svg)](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/actions/workflows/pages.yml)
[![Open PRs](https://img.shields.io/github/issues-pr/S-U-A-S-Veteran-Crisis-QRF/help?label=open%20PRs)](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pulls)
[![Open issues](https://img.shields.io/github/issues/S-U-A-S-Veteran-Crisis-QRF/help?label=open%20issues)](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues)
[![Last commit](https://img.shields.io/github/last-commit/S-U-A-S-Veteran-Crisis-QRF/help)](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/commits/main)
[![PRs merged](https://img.shields.io/github/issues-pr-closed-raw/S-U-A-S-Veteran-Crisis-QRF/help?label=merged%20PRs)](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pulls?q=is%3Apr+is%3Amerged)

---

## Quick actions

| If you want to… | Go here |
|---|---|
| Check email | [Gmail — jacobsilver@suasqrf.org](https://mail.google.com/) |
| Check the calendar | [Google Calendar](https://calendar.google.com/) |
| See what's broken / what's pending | [GitHub Issues](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues) |
| See what's in review | [GitHub PRs](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pulls) |
| See the live public site | [s-u-a-s-veteran-crisis-qrf.github.io/help](https://s-u-a-s-veteran-crisis-qrf.github.io/help/) |
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
| Public landing site | [GitHub Pages](https://s-u-a-s-veteran-crisis-qrf.github.io/help/) | Live |
| `suasqrf.org` domain | Registrar (TBD) | Down — DNS not set. See [RUNBOOK §1](./RUNBOOK.md#1-fix-the-domain-suasqrforg) |
| Old Google Site | `sites.google.com/view/suausqrf/home` | Inoperative — being retired |
| Google Workspace | [admin.google.com](https://admin.google.com/) | Active |
| Director email | `jacobsilver@suasqrf.org` | Active |
| Source repo | [GitHub](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help) | Active |

---

## Your AI staff

Every Claude session on this repo auto-loads SUAS context via the `suas-bootstrap` skill and the SessionStart hook. The roster below is your standing crew. Each has a charter file in the repo; click through to read it.

| Agent | Role | Charter | Cost / latency |
|---|---|---|---|
| **suas-tech** | **Reactive tech support.** Site down, email broken, DNS, Pages deploy. Diagnoses first, then acts. | [`.claude/agents/suas-tech.md`](./.claude/agents/suas-tech.md) | Sonnet — fast |
| **suas-project-finisher** | **Proactive backlog driver.** Picks up open issues + PRs + failing deploys and drives each to merged/closed. Auto-merges its own PRs on green. | [`.claude/agents/suas-project-finisher.md`](./.claude/agents/suas-project-finisher.md) | Sonnet — fast |
| **suas-bootstrap** (skill) | **Auto-loads SUAS context into every agent.** Mission, leadership, working rules, RUNBOOK, gstack surface. | [`.claude/skills/suas-bootstrap/SKILL.md`](./.claude/skills/suas-bootstrap/SKILL.md) | n/a — skill, not an agent |
| **gstack commands** | Garry Tan's [23-command Claude framework](https://github.com/garrytan/gstack), fetched on every session. Useful: `/document-release`, `/design-review`, `/cso`, `/benchmark`, `/learn`, `/ship`, `/retro`. | [`.claude/hooks/suas-session-start.sh`](./.claude/hooks/suas-session-start.sh) | varies |

### How to call them

| You say… | What happens |
|---|---|
| "Fix the domain." | Main session diagnoses DNS and gives you copy-paste records (often via `suas-tech`). |
| "Update the landing page to mention [X]." | Main session opens a PR. |
| "What's broken right now?" | Main session scans issues, Actions, live site. |
| "Finish this project." / "Drive the backlog." | Spawns `suas-project-finisher` to clear open threads autonomously. |
| "Show me the dashboard." | Opens this page. |

## Recent agent activity

<div id="agent-activity" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <em>Loading recent agent PRs from GitHub…</em>
</div>

<script>
(async () => {
  const target = document.getElementById('agent-activity');
  try {
    const resp = await fetch('https://api.github.com/repos/S-U-A-S-Veteran-Crisis-QRF/help/pulls?state=all&per_page=30&sort=updated&direction=desc');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const prs = await resp.json();
    const agentPRs = prs.filter(p => (p.head && p.head.ref || '').startsWith('claude/')).slice(0, 12);
    if (!agentPRs.length) {
      target.innerHTML = '<em>No agent PRs yet. As Claude opens PRs on <code>claude/*</code> branches, they will appear here.</em>';
      return;
    }
    const stateOf = p => p.merged_at ? '✅ merged' : (p.state === 'closed' ? '❌ closed' : '🟡 open');
    const when = p => (p.merged_at || p.closed_at || p.updated_at || '').slice(0, 10);
    const rows = agentPRs.map(p =>
      `<tr>
        <td><a href="${p.html_url}">#${p.number}</a></td>
        <td><a href="${p.html_url}">${p.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</a></td>
        <td>${stateOf(p)}</td>
        <td>${when(p)}</td>
        <td><code>${p.head.ref}</code></td>
      </tr>`
    ).join('');
    target.innerHTML =
      `<table style="width:100%; border-collapse: collapse;">
         <thead><tr style="text-align:left; border-bottom: 2px solid #ccc;">
           <th>PR</th><th>What an agent did</th><th>State</th><th>Date</th><th>Branch</th>
         </tr></thead>
         <tbody>${rows}</tbody>
       </table>
       <p style="font-size: 0.85em; color: #666;">Live from the GitHub API · only PRs on <code>claude/*</code> branches are shown · refresh to update.</p>`;
  } catch (e) {
    target.innerHTML =
      `<em>Could not load live activity (GitHub API may be rate-limited from your IP).
       View the full agent PR history on
       <a href="https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pulls?q=is%3Apr+head%3Aclaude">GitHub</a>.</em>`;
  }
})();
</script>

---

## Veteran-safety checklist (before publishing anything public)

- [ ] Crisis Line (**988, press 1**) is on the page
- [ ] No veteran PII (names, contact info, intake details)
- [ ] No glorification of violence
- [ ] Tax-deductibility claims cite IRC §170
- [ ] Testimonials / photos have explicit consent

---

*Shut Up And Serve.*
