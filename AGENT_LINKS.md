# Agent & Claude Resources for S.U.A.S. Veteran Crisis QRF

A curated set of links — verified high-quality, mostly official — that can help Claude (and contributing developers) optimize work on this repo and for SUAS operations more broadly.

This file is meant for technical contributors and for any Claude session working on SUAS code. Pin or reference it for context.

---

## How Claude is Used at SUAS

SUAS uses Claude as a force multiplier for a small nonprofit. Practical applications:

- **Site & content**: drafting, editing, accessibility, copy
- **Donor outreach**: thank-you letters, grant narratives, email drafts
- **Operations**: intake form processing, event coordination, reporting
- **Code**: this repo (`help`) — managed through Claude Code and PRs
- **Compliance**: drafting Form 990 narrative, summarizing meeting notes

---

## Official Anthropic / Claude Repositories

The canonical sources. Trust these first.

| Repo | Purpose |
|---|---|
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | The Claude Code CLI itself — issues, releases, docs |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | Python SDK for building custom Claude agents |
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | Notebooks and recipes — practical Claude API examples |
| [anthropics/claude-quickstarts](https://github.com/anthropics/claude-quickstarts) | Starter templates for Claude-powered apps |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Official directory of Claude Code plugins |
| [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Plugins for knowledge workers — directly relevant to nonprofit ops |
| [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) | GitHub Action — run Claude on PRs and issues automatically |
| [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) | GitHub Action — AI security review of code changes |

## Model Context Protocol (MCP) — Tool Integrations

MCP is the standard for connecting Claude to external tools (Gmail, Drive, Slack, calendars, etc.).

| Repo | Purpose |
|---|---|
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Official catalog of MCP servers (Gmail, Drive, Slack, GitHub, more) |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | Community registry of MCP servers |
| [modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector) | Visual testing tool for MCP servers |
| [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) | Build custom MCP servers in Python |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | Build custom MCP servers in TypeScript |

## Curated Community Lists

| Repo | Purpose |
|---|---|
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Skills, hooks, slash-commands, plugins for Claude Code |
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | Broad catalog of MCP servers across categories |

> **Note**: community lists move fast and quality varies. Verify any third-party tool before installing it — especially anything that touches SUAS donor data, veteran intake records, or Google Workspace.

## Jekyll Themes (for this site)

GitHub Pages uses Jekyll by default. Drop one of these into `_config.yml` to give the site real styling. See issue [#3](https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues/3).

| Theme | Best for |
|---|---|
| [jekyll-theme-cayman](https://github.com/pages-themes/cayman) | Clean, fast, minimal — good default |
| [mmistakes/minimal-mistakes](https://github.com/mmistakes/minimal-mistakes) | Highly customizable, blog + landing page |
| [cotes2020/jekyll-theme-chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) | Feature-rich, dark mode, good for content-heavy sites |
| [just-the-docs/just-the-docs](https://github.com/just-the-docs/just-the-docs) | Documentation-style with built-in search |

## Workflow Automation

Useful for SUAS ops (donor follow-up, event coordination, intake processing).

| Repo | Purpose |
|---|---|
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | Self-hostable workflow automation with native AI — connect Gmail, Forms, Sheets, Slack, etc. |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Browser automation via MCP — useful for scraping public data or driving web UIs |
| [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Chrome DevTools for AI agents — debugging the live site |

## Anthropic Documentation

Not GitHub, but the official docs Claude will reference:

- [Claude Code docs](https://docs.claude.com/en/docs/claude-code/overview)
- [Claude API docs](https://docs.claude.com/en/api/overview)
- [Claude Agent SDK docs](https://docs.claude.com/en/docs/agent-sdk/overview)
- [MCP specification](https://modelcontextprotocol.io/)

## For Contributors Working on This Repo

If you are a developer using Claude Code on this repo:

1. **Read** [CONTRIBUTING.md](./CONTRIBUTING.md) first
2. **Check** open issues at https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues — start with `good first issue`
3. **Reference** this file (`AGENT_LINKS.md`) when asking Claude for help — it grounds the assistant in our context
4. **Crisis-line safety**: any new page that could be read by a veteran must include 988 + 1 Veterans Crisis Line info

## Security & Data Caution

When using Claude or any agent with SUAS data:

- **Never** paste veteran PII (full names with contact info, intake details) into a chat that is not signed in to your authorized Workspace tools
- **Never** auto-respond to a veteran in crisis without human review
- **Always** prefer scoped tools (a Google Apps Script with specific permissions) over broad "full control" agents
- **Audit**: Workspace logs every action your account takes — keep it that way

---

*Last reviewed: May 2026. Anyone is welcome to PR updates as the ecosystem moves.*
