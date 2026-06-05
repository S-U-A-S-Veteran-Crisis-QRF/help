---
name: suas-bootstrap
description: Auto-bootstrap SUAS context for every agent working in this repo. Loads org mission, leadership, tech stack, veteran-safety rules, RUNBOOK index, and the gstack slash-command surface. Use at the start of any SUAS task or whenever an agent needs SUAS grounding.
---

# SUAS Bootstrap

You are working inside the **S.U.A.S. Veteran Crisis QRF** repo — a 501(c)(3) nonprofit (EIN 88-3249428) that combats veteran isolation through peer support and community events. The founder/director is **Jacob Silver** (`jacobsilver@suasqrf.org`). He is non-technical and has explicitly said "I do not work on tech." Your job is to do as much as possible inside the repo and the tools you have, and give Jacob crisp, copy-paste-ready instructions for anything else.

## Mandatory pre-read

Before doing anything else, make sure you have the contents of these files in context (they live at the repo root):

1. `CLAUDE.md` — org context, working rules, Jacob's style
2. `RUNBOOK.md` — playbooks for known tech problems
3. `dashboard.md` — director's quick-action surface

If a session loads CLAUDE.md automatically, you can skip step 1. Always re-read `RUNBOOK.md` when a tech question comes up; the playbook is the source of truth, not your memory.

## Non-negotiable rules

These come from `CLAUDE.md`. They are not suggestions:

1. **Crisis line on every public-facing page**: Veterans Crisis Line — dial 988, press 1.
2. **No veteran PII in this repo.** Ever. This repo is public on GitHub.
3. **Plain language.** Reader is a tired veteran, not a tech specialist or grant officer.
4. **No glorification of violence.** Focus on connection.
5. **Tax language must be accurate.** Cite IRC §170 when stating deductibility.
6. **Sensitive content needs human review.** Testimonials, photos, stories → never auto-publish.

## How to operate

- **Diagnose first, act second.** Confirm the actual problem with tools (Bash, GitHub MCP, WebFetch) before suggesting a fix.
- **Do everything you can do.** File edits, branches, PRs, GitHub Actions, Pages config (`CNAME`, `_config.yml`) — all yours.
- **Be honest about limits.** You can't log in to Jacob's registrar, Google Workspace admin, or GoFundMe. When you hit a real limit, say so and give exact steps.
- **Copy-paste DNS, URLs, commands.** Vague descriptions don't help Jacob.
- **Open PRs, don't merge silently** on anything that touches public-facing content.
- **End every session with a one-screen summary**: what you did, what needs Jacob (with exact URLs/values), what's blocked.

## Available specialist agents

- **`suas-tech`** (Sonnet) — dedicated tech-support subagent. Route SUAS tech problems (site down, email broken, domain DNS, Pages deploy) to it via the `Agent` tool with `subagent_type: "suas-tech"`.
- **`suas-project-finisher`** (Sonnet) — director-level project finisher. Picks up the SUAS open-thread backlog (issues, failing deploys, unresolved PR comments, RUNBOOK gaps) and drives each to merged/closed/resolved. Invoke when Jacob says "finish this project", "handle the backlog", "drive open threads", or asks for autonomous follow-through.

## Available gstack slash commands

This repo's `.claude/settings.json` runs a SessionStart hook that fetches Garry Tan's [gstack](https://github.com/garrytan/gstack) at session start so its slash commands are available. Commands most relevant to SUAS:

| Command | When to use it |
|---|---|
| `/document-release` | After a site content change, refresh all docs to match. |
| `/design-review` | Audit the public Pages site for visual / accessibility issues. |
| `/cso` | Security review (donor links, any form, MX/DNS hygiene). |
| `/benchmark` | Track page speed / Core Web Vitals on the public site. |
| `/learn` | Preserve an editorial or branding decision across sessions. |
| `/ship` / `/land-and-deploy` | Open a PR / merge + verify Pages deploy. |
| `/retro` | Weekly retro of what shipped on the repo. |

If a gstack command isn't loaded, check the SessionStart hook output for fetch errors, then either re-run the hook or fall back to doing the task manually.

## End-of-task report format

```
### What I did
- [bullet]

### What needs Jacob
- [bullet with exact URL / value / click]

### What's blocked
- [bullet — only if relevant]
```

Keep it tight. Jacob reads briefly.
