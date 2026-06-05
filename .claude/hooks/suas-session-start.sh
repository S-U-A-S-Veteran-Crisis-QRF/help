#!/usr/bin/env bash
# SUAS Veteran Crisis QRF — SessionStart hook.
# Runs at the start of every Claude Code session on this repo.
# Outputs a short bootstrap message into the agent's context and ensures
# the gstack slash-command surface is available.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GSTACK_DIR="${REPO_ROOT}/.gstack-cache"
GSTACK_REPO="https://github.com/garrytan/gstack.git"

echo "============================================================"
echo "S.U.A.S. Veteran Crisis QRF — session bootstrap"
echo "============================================================"
echo "501(c)(3) public charity · EIN 88-3249428 · Founder: Jacob Silver"
echo
echo "Mandatory reads for any SUAS task:"
echo "  - CLAUDE.md           org context + working rules"
echo "  - RUNBOOK.md          playbooks for known tech problems"
echo "  - dashboard.md        director's quick-action surface"
echo "  - .claude/skills/suas-bootstrap/SKILL.md"
echo
echo "Non-negotiable rules:"
echo "  1. Crisis line (988, press 1) on every public-facing page."
echo "  2. No veteran PII anywhere in this public repo."
echo "  3. Plain language — reader is a tired veteran."
echo "  4. Tax-deductibility claims must cite IRC Section 170."
echo "  5. Veteran testimonials / photos need explicit consent."
echo
echo "Specialist subagent available: suas-tech (route SUAS tech tickets to it)."
echo

# Best-effort fetch of gstack so its slash commands are available this session.
# Quiet, time-boxed, and never blocks session start on failure.
if command -v git >/dev/null 2>&1; then
  if [ ! -d "${GSTACK_DIR}/.git" ]; then
    if timeout 30 git clone --quiet --depth 1 --single-branch \
        "${GSTACK_REPO}" "${GSTACK_DIR}" 2>/dev/null; then
      echo "gstack: cloned into .gstack-cache (read-only reference)"
    else
      echo "gstack: clone skipped (network or timeout). Slash commands may be unavailable this session."
    fi
  else
    # Refresh non-fatally
    if timeout 15 git -C "${GSTACK_DIR}" pull --quiet --ff-only 2>/dev/null; then
      echo "gstack: refreshed in .gstack-cache"
    else
      echo "gstack: using cached copy in .gstack-cache"
    fi
  fi
  if [ -d "${GSTACK_DIR}" ]; then
    echo "gstack: skills available at .gstack-cache/  (run ./.gstack-cache/setup to install ~/.claude/skills/gstack)"
  fi
else
  echo "gstack: git not available, skipping clone."
fi

echo
echo "Director's dashboard:  ${REPO_ROOT}/dashboard.md"
echo "Live dashboard URL:    https://s-u-a-s-veteran-crisis-qrf.github.io/help/dashboard/"
echo "============================================================"
