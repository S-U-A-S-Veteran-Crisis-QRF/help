# SUAS AI Frontier-Seven Monitor

Cloudflare Worker that monitors the "frontier seven" AI labs and key regulatory/grant sources, classifies each item by SUAS operational impact, and delivers a daily brief (06:00 PT) and weekly synthesis (Friday 16:00 PT) to Google Drive, email, Slack, and MCP.

**Spec version:** 1.0.0  
**Maintainer:** John Sokol, Director of Technology, SUAS  
**Org:** S.U.A.S. Veteran Crisis Q.R.F. · EIN 88-3249428 · 501(c)(3)

---

## Week-1 Setup Checklist

### 1. Cloudflare resources

```bash
# Create KV namespaces
wrangler kv:namespace create SUAS_NEWS_SEEN
wrangler kv:namespace create SUAS_NEWS_WATCH

# Create R2 bucket — then enable Object Lock in Compliance mode at 2,557 days
# via Cloudflare dashboard (R2 → suas-briefs → Settings → Object Lock)
wrangler r2 bucket create suas-briefs

# Deploy Worker (registers Durable Object + cron triggers)
cd news-bot && npm install && wrangler deploy
```

### 2. Secrets

```bash
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put GDRIVE_SERVICE_ACCOUNT_JSON   # paste full JSON
wrangler secret put MCP_TOKEN
```

Paste the values interactively when prompted. Never commit secrets to this repo.

### 3. Update wrangler.toml with real KV namespace IDs

After step 1, copy the printed namespace IDs into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SUAS_NEWS_SEEN"
id = "<paste-real-id-here>"
```

### 4. Cloudflare Tunnel for MCP

The Worker delivers JSON to `http://localhost:8080` (your local MCP server) via a Cloudflare Tunnel:

```bash
cloudflared tunnel create suas-mcp
cloudflared tunnel route dns suas-mcp mcp.suasqrf.org
# Set MCP_ENDPOINT in wrangler.toml to the tunnel URL (not localhost)
```

### 5. Verify source list

```bash
# Confirm all 41 feed/scrape URLs return 200
node -e "
  const s = require('./src/sources.json');
  Promise.all(
    s.filter(x => x.enabled && (x.feed_url || x.url)).map(async x => {
      const url = x.feed_url ?? x.url;
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
        console.log(r.ok ? '✓' : '✗', x.id, r.status, url);
      } catch (e) { console.log('✗', x.id, url, String(e)); }
    })
  );
"
```

### 6. Test locally

```bash
npm run dev:scheduled
# Then in another terminal:
curl "http://localhost:8787/__scheduled?cron=0+13+*+*+1-5"
```

### 7. Apply for AI nonprofit discounts (concurrent with setup)

- **Anthropic Claude for Nonprofits:** https://claude.com/solutions/nonprofits (via Goodstack)
- **OpenAI for Nonprofits:** https://openai.com/nonprofits/ (up to 75% off)

Document both applications in the SUAS finance ledger.

---

## Architecture summary

```
Cron 06:00 PT (Mon-Fri) ──► daily brief
Cron 16:00 PT (Fri)     ──► weekly synthesis

Sources (41) → Feed Fetcher / Scraper → Dedup (KV SHA-256)
→ Classifier (Haiku 4.5) → Synthesizer (Sonnet 4.6)
→ Formatter (md / html / slack / mcp)
→ Delivery: Google Drive · Email (Resend) · Slack · MCP localhost:8080
→ Hand-offs: R2 file drop + MCP tool call per TIER 1 item
```

State:
- `SUAS_NEWS_SEEN` KV — dedup hashes, 30-day TTL
- `SUAS_NEWS_WATCH` KV — watch list carryovers, 14-day TTL
- `R2://suas-briefs/` — canonical archive, Object Lock 2,557d Compliance
- `RunLedger` Durable Object — per-run metrics

## Source inventory

41 sources across: Anthropic · OpenAI · Google DeepMind · Meta AI · Microsoft AI · xAI · Mistral · Stanford HAI · Partnership on AI · AI Now · NIST · The Verge · TechCrunch · Wired · CA Dept. of Technology · CA AG · CPPA · CA Legislature (SB 53 / AB 2013 / SB 942 / AB 853) · VA OIT · VA iNET · VA AI/NAII · SAMHSA · SSG Fox SPGP · Grants.gov

Full definitions in `src/sources.json`.

## Cost estimate

| Item | Monthly |
|---|---|
| Cloudflare Workers Paid (for Queues + Browser Rendering) | $5 |
| Anthropic Haiku 4.5 classification (~220 classifications/month) | ~$1 |
| Anthropic Sonnet 4.6 synthesis (~30 calls/month) | ~$4 |
| Resend email | $0 (free tier) |
| **Total** | **~$10** |

Set Anthropic spend alert at $15; hard ceiling at $30. See spec §2.7 for full assumptions.

## Quarterly maintenance (every 13 weeks)

Owner: John Sokol

1. Verify all 41 source URLs return 200 and feeds have advanced.
2. Re-confirm nonprofit program terms (Anthropic, OpenAI, Google, Microsoft).
3. Re-fetch `anthropic.com/legal/aup` and confirm healthcare/human-in-the-loop clauses unchanged.
4. Check xAI, Mistral, Meta AI for native RSS (switch off Playwright path if available).
5. Review TIER 1 false-positive rate; retune `src/classifier.ts` system prompt if >10% for 2 quarters.
6. Bump SKILL.md minor version; add entry to CHANGELOG.md.

## Compliance posture

- **HIPAA:** ingests only public news; no PHI at any layer.
- **501(c)(3) political neutrality:** policy items flagged with "what triggers / what SUAS must do" only; no editorial positions.
- **Anthropic AUP (effective Sep 15 2025):** human-review gate enforced via `review_status: draft-internal-only`; no clinical recommendations generated.
- **CA AI law:** SUAS is not a frontier developer, not a >1M-user GenAI provider; SB 53/AB 2013/SB 942/AB 853 do not bind SUAS directly. Bot monitors them for vendor impacts.
- **7-year retention:** R2 Object Lock Compliance mode, 2,557 days. Verify quarterly.

---

Veterans Crisis Line — dial **988, press 1** — free, confidential, 24/7.
