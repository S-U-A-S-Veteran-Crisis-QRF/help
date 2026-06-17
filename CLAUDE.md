# S.U.A.S. Veteran Crisis QRF — Project Context

This file is auto-loaded by Claude Code in every session on this repo. It exists so any Claude session — and any human contributor — has full project context immediately, without the user having to re-explain anything.

## Who We Are

**S.U.A.S. Veteran Crisis QRF** ("Shut Up And Serve" Veteran Crisis Quick Reaction Force) is an IRS-recognized 501(c)(3) public charity headquartered in Los Altos, California. We exist to combat veteran isolation through peer support and community events.

- **EIN**: 88-3249428
- **IRS classification**: 501(c)(3) public charity, 170(b)(1)(A)(vi)
- **Founded**: July 8, 2022
- **HQ**: 727 Edge Lane, Los Altos, CA 94024
- **Founder/Director**: Jacob Silver (`jacobsilver@suasqrf.org`)

### Leadership
- Jacob Sterling Silver — Founder/Director, Assistant CFO
- Mary Frances Declercq — CEO
- Jose Alcantar — CFO
- Glen Cederholm — Vice President
- Brant Cassidy Rigden Creamer — Secretary

## Mission Statement

> "To assist military personnel, veterans and their families to develop connections and have fun while adjusting to civilian life."

> "A soldier without a mission may have a difficult adjustment in civilian life. We aim to assist in bridging that gap. We adhere to the promise that no one is left behind."

## Our Tech Stack

| System | What it is | Status |
|---|---|---|
| `suasqrf.org` | Primary public domain | Currently down — DNS not pointing anywhere |
| `saus.noaerth.com` (GitHub Pages) | Public landing site, built from this repo | Configured via `.github/workflows/pages.yml` + `CNAME` |
| `sites.google.com/view/suausqrf/home` | Old Google Site | Reportedly inoperative |
| Google Workspace (Google for Nonprofits) | Email, Drive, Calendar | Active |
| `jacobsilver@suasqrf.org` | Founder/director email | Active |
| Facebook page + community group | Public-facing presence | Active |
| GoFundMe — "Support Our Heroes" | Donation channel | Active |

## Working in This Repo

### Key files
- `index.md` — public landing page (rendered by Jekyll at the site root)
- `_config.yml` — Jekyll theme + plugins + SEO config
- `CNAME` — tells GitHub Pages which custom domain to serve at
- `docs/IRS-Determination-Letter.pdf` — official 501(c)(3) proof, linked from `index.md`
- `RUNBOOK.md` — step-by-step playbooks for common tech tasks
- `AGENT_LINKS.md` — vetted Claude/MCP ecosystem links
- `CONTRIBUTING.md` — onboarding for outside contributors
- `.claude/agents/suas-tech.md` — specialized tech-support subagent

### Branch + PR conventions
- Default branch: `main`
- Feature branches: prefix with `claude/` for Claude-driven work
- PRs auto-deploy to GitHub Pages on merge via `.github/workflows/pages.yml`
- Always reference the related issue number in PR body

## Working Rules — Veteran-Centered

Because we serve veterans in crisis, these rules are non-negotiable:

1. **Crisis line on every public-facing page**: Veterans Crisis Line — dial 988 then press 1. Any new public page must include this prominently.
2. **No veteran PII in this repo**: no full names of intake clients, no contact info, no crisis disclosures, no event attendee lists, no donor details. This repo is public.
3. **Plain language**: assume the reader is a tired veteran, not a tech specialist or grant officer.
4. **No glorification of violence**: focus on connection and community, never on combat or service performance.
5. **Tax language must be accurate**: when stating deductibility, cite IRC Section 170. Don't invent legal claims.
6. **Sensitive content needs human review**: testimonials, stories, photos of veterans — never auto-publish; always get explicit consent.

## Jacob's Working Style (important context for assistants)

- Jacob is the founder and a non-technical operator. He has explicitly said "I do not work on tech."
- When he asks for something, infer scope and execute. He prefers action over excessive clarification.
- For risky or external actions (sending emails, posting publicly, paying for things), confirm first.
- For local repo work (file edits, branches, PRs), proceed directly.
- He communicates briefly. Match that energy — concise updates, short summaries.

## Current Open Threads

When a Claude session starts, scan these:
- Open issues: https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues
- Open PRs: https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/pulls
- See `RUNBOOK.md` for known broken systems and how to fix them
- See `.claude/agents/suas-tech.md` for the tech-support subagent's specific charter
