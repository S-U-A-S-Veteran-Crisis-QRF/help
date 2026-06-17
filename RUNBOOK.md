# SUAS Tech Runbook

Plain-language playbooks for common technical issues. Use this as a checklist when something breaks. Jacob can follow these directly without Claude, or Claude can execute them autonomously where possible.

> **For crisis support**, this is not the place. If someone is in immediate danger, call the **Veterans Crisis Line: 988, press 1**.

## Index

1. [Fix the domain (suasqrf.org)](#1-fix-the-domain-suasqrforg)
2. [Fix GitHub Pages deploy](#2-fix-github-pages-deploy)
3. [Fix the Google Site](#3-fix-the-google-site)
4. [Fix email (jacobsilver@suasqrf.org)](#4-fix-email-jacobsilversuasqrforg)
5. [Update the public landing page](#5-update-the-public-landing-page)
6. [Add a contributor / give someone repo access](#6-add-a-contributor)
7. [Escalation contacts](#7-escalation-contacts)

---

## 1. Fix the domain (suasqrf.org)

**Decision**: the public site at `suasqrf.org` is served by **Google Sites**. The GitHub Pages site at `s-u-a-s-veteran-crisis-qrf.github.io/help/` is an **internal director's dashboard only** and is not promoted publicly.

### Confirmed state (verified via DNS June 2026)

- ✅ Domain is **registered and active**
- ✅ Nameservers: Google Cloud DNS (`ns-cloud-d1..d4.googledomains.com`)
- ✅ Email works (MX → Google Workspace `aspmx.l.google.com`)
- ⚠️ Apex A record currently points to **Squarespace** (`198.185.159.145`) — this is the old/placeholder destination. We're moving it to **Google Sites**.
- Registrar: **Squarespace Domains** (was Google Domains; Google sold to Squarespace in 2024)

### Goal

Point `suasqrf.org` at the SUAS Google Site so visitors land on it.

### Step 1 — Get the Google Site ready

1. Sign in to https://sites.google.com with the Workspace account that owns it (your `@suasqrf.org` account, or `jacobsterlingsilver@gmail.com` if you set it up there).
2. Find the SUAS site in your sites list (or create one).
3. Edit content. Make sure the **Veterans Crisis Line (988, press 1)** is on the homepage — non-negotiable.
4. Click **Publish** (top right). Note the site URL.
5. **Share** → "General access" → **Anyone with the link → Viewer**.

### Step 2 — Add custom domain in Google Sites

1. In the site → Settings (⚙) → **Custom domains** → **Start setup** → **Use a custom domain**.
2. Enter `www.suasqrf.org`. Google may require the `www` form.
3. Google Sites will show you the DNS records to add. Typically:
   - **CNAME** `www` → `ghs.googlehosted.com.`
   - **TXT** at apex for domain verification (Google may auto-detect the existing `google-site-verification` TXT record)

### Step 3 — Add the DNS records at Squarespace

1. Sign in at https://account.squarespace.com (use `jacobsterlingsilver@gmail.com` — the email tied to the original Google Domains purchase).
2. **Domains** → `suasqrf.org` → **DNS**.
3. Add exactly the records Google Sites told you to add.
4. **For the apex** (`suasqrf.org` without `www`): set a **301 redirect** `suasqrf.org` → `https://www.suasqrf.org` so people typing the bare domain still land on the site. Squarespace Domains has a "Domain Forwarding" feature for this.
5. Save.

### Step 4 — Verify + go live

1. Wait 5–60 minutes for DNS to propagate.
2. Back in Google Sites → Custom domains → click **Verify**.
3. Google will check the records and connect the domain.
4. Visit `https://suasqrf.org` — should now land on the Google Site.

### If you forgot which Google account owns the site

Try in this order:
1. `jacobsilver@suasqrf.org` (Workspace primary)
2. `jacobsterlingsilver@gmail.com` (personal — likely registered Google Domains here)
3. Any other Workspace account on the org (Mary's? Glen's?)
4. Recovery: https://accounts.google.com/signin/recovery

---

## 2. Fix GitHub Pages deploy

**Symptoms**: site is live but updates aren't appearing, or a 404, or build fails.

### Diagnose
- Visit https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/actions
- Look at the latest "Deploy GitHub Pages" run
- Red = build broke, green = success

### Fix
- Click the red run → expand failed step → read error
- Most common: a typo in `_config.yml` or `index.md` front matter
- Open Claude Code, say "fix the GitHub Pages deploy" — it will read the workflow logs and propose a fix
- For a manual retry: Actions → click run → "Re-run all jobs"

---

## 3. Fix the Google Site

**Symptoms**: `sites.google.com/view/suausqrf/home` shows error, blank page, or "you need access."

### Diagnose
1. Log in at `sites.google.com` with the Google Workspace account that owns the site (probably your `@suasqrf.org` account)
2. Look in your sites list for "suausqrf"

### Fix paths
| What you see | What to do |
|---|---|
| Site exists but says "Draft" | Click **Publish** in the top right |
| Site exists but won't load publicly | Top-right Share → set "General access" to **Anyone with the link → Viewer** |
| Site appears broken | Edit the page → re-save → Publish |
| Site is gone | Check Trash in Google Drive within 30 days |

### Should we keep it?
**Yes — this is the public site.** Per the decision logged in §1, the Google Site is the canonical public-facing destination served at `suasqrf.org`. The GitHub Pages site is an internal director-only dashboard, not a replacement.

---

## 4. Fix email (jacobsilver@suasqrf.org)

**Symptoms**: emails bouncing, can't send, can't receive, password lost.

### Diagnose
- Try sending a test email to yourself from `gmail.com` → `jacobsilver@suasqrf.org`
- If it bounces, the MX records for `suasqrf.org` may be missing/wrong

### Fix MX records
- Log in to your registrar → DNS Manager
- Add MX records (Google Workspace standard):
  ```
  Priority 1   smtp.google.com
  ```
- (Older format used 5 separate MX records — either works if Google Workspace recommends it for your account.)
- Wait 1–4 hours

### Lost Google Workspace password
- Go to https://admin.google.com/recovery
- You'll need access to the recovery email/phone you set up
- For account recovery escalation: Google Workspace Support (sign in to admin.google.com → Support icon)

---

## 5. Update the public landing page

**To change the site content** (mission, events, donate link, etc.):

### Option A: Use Claude Code
- Open Claude Code on this repo (web or terminal)
- Say "update the landing page to [your change]"
- Review the PR Claude opens, then merge

### Option B: Edit on GitHub directly
1. Go to https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/blob/main/index.md
2. Click the pencil icon (top right)
3. Make your edit
4. Commit directly to `main` (or open a PR if you want review)
5. GitHub Actions will redeploy the site automatically within ~2 minutes

### Veteran-safety check before publishing
- Crisis Line (988+1) still on the page? ✅
- No veteran PII in the content? ✅
- Donate link still works? ✅

---

## 6. Add a contributor

To give someone access to help with the repo:

1. Go to https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/settings/access
2. Click **Add people**
3. Enter their GitHub username
4. Role:
   - **Read** — can view but not change
   - **Triage** — can manage issues
   - **Write** — can push code (most contributors)
   - **Maintain** — write + manage settings (trusted helpers)
   - **Admin** — full control (only you, for now)

Point new contributors at `CONTRIBUTING.md` and the open issues with `good first issue`.

---

## 7. Escalation contacts

When you need a human:

| Need | Contact |
|---|---|
| Google Workspace admin help | https://support.google.com/a → "Contact us" (signed in as admin) |
| Google for Nonprofits eligibility | https://www.google.com/nonprofits/account/u/0/contact-us |
| Domain registrar account recovery | Whoever holds the domain — check ICANN lookup |
| GitHub support | https://support.github.com |
| Charity legal/IRS questions | The CPA or attorney listed in SUAS records (not in this repo) |
| Crisis intervention for a veteran | **988 → press 1** (Veterans Crisis Line) |

---

*This runbook lives in the repo. If you find a process that worked, add it here so the next person doesn't have to figure it out from scratch.*
