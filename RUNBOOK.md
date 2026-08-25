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
8. [Fix Hermes (desktop agent won't start)](#8-fix-hermes-desktop-agent-wont-start)

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

## 8. Fix Hermes (desktop agent won't start)

**Symptom.** The Hermes desktop app on the Windows machine never finishes starting. The log repeats:

```
[boot] Desktop boot failed: Could not persist ownership for the Hermes backend:
Command failed: powershell.exe -NoProfile -NonInteractive -Command ...
The shell cannot be started. A failure occurred during initialization:
The type initializer for 'System.Net.ServicePointManager' threw an exception.
```

It retries, auto-repairs, fails the same way, and gives up after three attempts.

### What's actually wrong

**Windows PowerShell is broken — Hermes is just the app that noticed.**

Hermes starts its backend successfully, then runs `powershell.exe` to read that process's start time so it can remember which process it owns. PowerShell won't start, so that step fails, and Hermes treats the failure as fatal.

The failure happens even with `-NoProfile`, which rules out the PowerShell profile and points at machine-level .NET configuration. Two usual culprits:

1. A corrupt or truncated `machine.config` (the .NET settings file Windows ships).
2. A `SchUseStrongCrypto` or `SystemDefaultTlsVersions` registry value written with the wrong type (text instead of number).

If it breaks **more than once**, something is rewriting those settings repeatedly — usually a VPN, antivirus, or corporate proxy tool.

### Fix (about 5 minutes)

The repair scripts are in `tools/hermes/`. They're `.bat` files on purpose: you can't use PowerShell to repair PowerShell.

1. On the Windows machine, open each link below and save the file to the Desktop
   (right-click the page → **Save as**, and make sure Windows keeps the `.bat`
   ending rather than adding `.txt`):
   - [hermes-diagnose.bat](https://raw.githubusercontent.com/S-U-A-S-Veteran-Crisis-QRF/help/main/tools/hermes/hermes-diagnose.bat)
   - [hermes-fix.bat](https://raw.githubusercontent.com/S-U-A-S-Veteran-Crisis-QRF/help/main/tools/hermes/hermes-fix.bat)
2. Double-click **`hermes-diagnose.bat`**. It changes nothing and writes `hermes-report.txt` to the Desktop. It will say whether PowerShell is the problem.
3. If it confirms PowerShell is broken: right-click **`hermes-fix.bat`** → **Run as administrator**.
4. The fix script backs everything up to the Desktop, then tries the least invasive repair first (registry values), retests, and only touches `machine.config` if it has to — and only after you type `YES`.
5. When it reports success, start Hermes.

### If the fix script can't do it

It will print these, in order, for an Administrator Command Prompt:

1. `sfc /scannow`
2. `DISM /Online /Cleanup-Image /RestoreHealth`
3. Reboot, run `hermes-fix.bat` again.
4. Reinstall .NET Framework 4.8 from Microsoft, reboot, run it again.

### Worth reporting upstream

This is also a Hermes bug: reading a process start time is a convenience, not a requirement, and failing to read it shouldn't block boot. A reasonable bug report:

> Hermes fails to boot when `powershell.exe` cannot start on the host. `claimBackendChild` treats the start-time lookup as fatal and aborts, even though the backend process started successfully. Suggested fix: degrade gracefully when the ownership probe fails, rather than failing the boot.

---

*This runbook lives in the repo. If you find a process that worked, add it here so the next person doesn't have to figure it out from scratch.*
