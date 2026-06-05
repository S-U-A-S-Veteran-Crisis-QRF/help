---
title: SUAS Projects — Status Board
description: Every active project for S.U.A.S. Veteran Crisis QRF, mapped to the PRs, issues, and sessions that built it.
permalink: /projects/
sitemap: false
---

# SUAS Projects — Status Board

> One page. Every project. What's done, what's in flight, what's blocked, who can unstick it.

Last reconstructed from the repo on 2026-06-05. Refresh: open Claude and say *"update the projects board."*

Legend: ✅ done · 🟡 in flight · 🔴 blocked on Jacob · ⚪ backlog (needs owner)

---

## 1. Public landing site — **🟡 live but unstyled**

The Jekyll site at `s-u-a-s-veteran-crisis-qrf.github.io/help/`.

| Status | Item | Where it lives |
|---|---|---|
| ✅ | Original homepage with mission, programs, donate, crisis line | [PR #1](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/1) → `index.md` |
| ✅ | Jekyll theme (Cayman), SEO meta, sitemap, IRS letter | [PR #10](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/10) |
| ⚪ | Logo + favicon + brand colors | [Issue #2](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/2) |
| ⚪ | Custom Open Graph social-preview image | [Issue #9](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/9) |
| ⚪ | Event calendar / upcoming events | [Issue #6](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/6) |
| ⚪ | Leadership bios + headshots | [Issue #5](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/5) |
| ⚪ | Photo gallery from past events | [Issue #4](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/4) |
| ⚪ | Veteran testimonials / impact stories | [Issue #8](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/8) |

**Blocker on backlog**: every ⚪ item needs **content + consent** (logo file, photos, bios, stories) — Jacob or a delegated content owner has to gather these. No code is blocking.

---

## 2. Custom domain — **🔴 blocked on Jacob (registrar DNS)**

Goal: `suasqrf.org` resolves to the GitHub Pages site.

| Status | Item | Where it lives |
|---|---|---|
| 🟡 | Repo-side CNAME + `_config.yml` for the custom domain | [PR #11](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/11) — open |
| 🔴 | Registrar DNS records (4 × A records + `www` CNAME) | RUNBOOK §1 |
| 🔴 | Enforce HTTPS once DNS check passes | GitHub Settings → Pages |

**Jacob action**: log in to whichever registrar holds `suasqrf.org`, add the A/CNAME records listed in [RUNBOOK §1](./RUNBOOK.md#1-fix-the-domain-suasqrforg), then merge PR #11. ICANN lookup if you can't remember who the registrar is: https://lookup.icann.org/en/lookup?q=suasqrf.org

---

## 3. Deployment pipeline (GitHub Pages) — **🔴 blocked on Jacob (one click)**

The GitHub Actions workflow that builds the Jekyll site and ships it to Pages on every push to `main`.

| Status | Item | Where it lives |
|---|---|---|
| ✅ | Actions workflow that builds Jekyll + uploads Pages artifact | [PR #12](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/12) |
| ❌ | "Auto-enable Pages" attempt that broke every deploy since June 4 | [PR #14](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/14) — **fix in flight** |
| 🟡 | Unbreak deploy: drop `enablement: true` from the workflow | [PR #17](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/17) — open, ready to merge |
| 🔴 | Enable Pages in repo Settings (one click) | Settings → Pages → Source: GitHub Actions |

**Jacob action — single click**: https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/settings/pages → Source: **GitHub Actions**. Then merge PR #17. Live site comes back.

---

## 4. AI agent stack — **🟡 in flight (most work this week)**

The Claude Code agent layer that lets Jacob run the org without doing tech.

| Status | Item | Where it lives |
|---|---|---|
| ✅ | `CLAUDE.md` org context + `suas-tech` reactive subagent + `RUNBOOK.md` | [PR #13](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/13) |
| ✅ | Director's dashboard + `suas-bootstrap` skill + SessionStart hook + gstack | [PR #16](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/16) |
| 🟡 | Always-on `@claude` GitHub Action (issue-driven, cloud-hosted) | [PR #15](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/15) — open, **needs `ANTHROPIC_API_KEY` repo secret** |
| 🟡 | `suas-project-finisher` autonomous backlog agent | [PR #17](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/17) — open |
| 🟡 | Dashboard upgrade: live status badges + AI staff roster + agent activity feed | [PR #18](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pull/18) — open |

**Jacob action**:
- Merge PRs #15, #17, #18 in any order (they don't conflict).
- For PR #15 to actually run, add a repo secret: Settings → Secrets and variables → Actions → New repository secret → name `ANTHROPIC_API_KEY`, value from https://console.anthropic.com.
- Enable repo auto-merge (Settings → Pull Requests → "Allow auto-merge") so future agent PRs land on green without you clicking.

---

## 5. Donor channel (GoFundMe) — **🟡 needs Jacob to paste rewrite**

| Status | Item | Where it lives |
|---|---|---|
| ✅ | GoFundMe page live: "Support Our Heroes — Combating Veteran Isolation" | https://www.gofundme.com/f/support-our-heroes-combating-veteran-isolation |
| 🟡 | Rewritten copy (tighter mission, impact tiers, verified org status) | Drafted in chat 2026-06-05 — Jacob to paste |
| ⚪ | Add donate-page QR code to dashboard + print materials | not started |

**Jacob action**: copy the rewrite from chat into GoFundMe → Manage → Edit → Story. Adjust the impact tiers ($25 / $100 / $500 / $1k / $5k) to match real event costs.

---

## 6. Content rules (always-on) — **✅ in effect**

These come from `CLAUDE.md` and every agent honors them. Listed here so contributors and donors can see the standard.

- Veterans Crisis Line (988, press 1) on every public-facing page
- No veteran PII anywhere in this public repo
- Plain language — reader is a tired veteran
- Tax-deductibility claims cite IRC §170
- Testimonials / photos require explicit consent

---

## What I'd do next if I had 30 minutes of Jacob's time

In priority order:

1. **Repo Settings → Pages → Source: GitHub Actions** (1 click, unblocks the live site)
2. **Repo Settings → Pull Requests → "Allow auto-merge"** (1 click, lets agents self-land PRs)
3. **Merge PRs #17 and #18** (unbreaks deploy + ships live agent dashboard)
4. **Add `ANTHROPIC_API_KEY` repo secret + merge PR #15** (turns on the `@claude` issue bot — Jacob can then drive everything from new issues)
5. **Registrar DNS for `suasqrf.org`** ([RUNBOOK §1](./RUNBOOK.md#1-fix-the-domain-suasqrforg)) — last step before the domain works

Everything else (content, photos, bios, testimonials) is content-blocked, not tech-blocked.

---

*Shut Up And Serve.*
