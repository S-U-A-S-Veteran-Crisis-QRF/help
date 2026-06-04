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

**Symptoms**: people typing `suasqrf.org` see a "site can't be reached" error, or the wrong page, or an expired-domain parking page.

### Diagnose (5 min)

1. Open https://lookup.icann.org/en/lookup and search `suasqrf.org`. Look for:
   - **Registry Expiration Date** — if past, domain is expired
   - **Name Servers** — if blank, no DNS
   - **Registrar** — who you bought it from
2. Open https://dnschecker.org/?query=suasqrf.org → check for A records

### Fix path A: Domain expired
- Log in to your registrar
- Renew the domain
- Wait for renewal to propagate (usually instant)
- Then follow Fix path B

### Fix path B: DNS not configured
- Log in to registrar → DNS Manager
- Add **A records** for the apex (`@` or blank):
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- Add **CNAME record** for `www`:
  ```
  www  →  s-u-a-s-veteran-crisis-qrf.github.io
  ```
- Save. Wait 5–60 min for DNS propagation.
- In GitHub: Settings → Pages → Custom domain: `suasqrf.org` → Save
- Once DNS check passes, enable **"Enforce HTTPS"**

### Fix path C: Don't know which registrar
- Check your credit card statements for "domain" or "GoDaddy/Namecheap/etc."
- Or visit https://lookup.icann.org/en/lookup — the Registrar field shows who holds it
- If you find a registrar but no longer have the login, use their account recovery flow with `jacobsilver@suasqrf.org`

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
We're rebuilding everything at `suasqrf.org` (GitHub Pages). The Google Site duplicates effort. Consider taking it offline once `suasqrf.org` is live.

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
