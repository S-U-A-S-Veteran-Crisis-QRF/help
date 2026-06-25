import type { Env, Source } from './types.js';
import rawSources from './sources.json';
import { fetchFeed } from './feeds.js';
import { scrapeUrl } from './scraper.js';
import { dedup } from './dedup.js';
import { classifyBatch } from './classifier.js';
import { synthesizeDaily, synthesizeWeekly } from './synthesizer.js';
import {
  buildMCPPayload,
  buildSlackBlocks,
  markdownToPlaintext,
  markdownToHtml,
  assertCitationDiscipline,
} from './formatter.js';
import { deliverAll } from './delivery.js';
import { routeHandoffs } from './handoff.js';
import {
  loadWatchList,
  updateWatchList,
  markWatchItemsAsWeekly,
  archiveBrief,
  detectStaleSources,
  recordLastItem,
} from './state.js';

export { RunLedger } from './ledger.js';

const sources = rawSources as Source[];

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // §6.1 — DST-aware dispatch: both PDT and PST crons registered; exit early if
    // local time doesn't match expected trigger hour.
    const localHour = getLocalHour(env.SUAS_TZ);
    const localDOW = getLocalDOW(env.SUAS_TZ); // 0=Sun … 6=Sat

    let briefKind: 'daily' | 'weekly' | null = null;

    if (localHour === 6 && localDOW >= 1 && localDOW <= 5) {
      briefKind = 'daily';
    } else if (localHour === 16 && localDOW === 5) {
      briefKind = 'weekly';
    }

    if (!briefKind) {
      console.log(
        `[cron] Fired ${controller.cron} — local hour ${localHour} DOW ${localDOW} — no-op (DST guard)`
      );
      return;
    }

    ctx.waitUntil(runBrief(briefKind, env));
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', version: '1.0.0' });
    }

    // Manual trigger — protected by MCP_TOKEN
    if (url.pathname === '/run' && request.method === 'POST') {
      const auth = request.headers.get('Authorization');
      if (!auth || auth !== `Bearer ${env.MCP_TOKEN}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      const body = (await request.json().catch(() => ({}))) as { kind?: string };
      const kind = body.kind === 'weekly' ? 'weekly' : 'daily';
      ctx.waitUntil(runBrief(kind, env));
      return Response.json({ status: 'triggered', kind });
    }

    return new Response('SUAS AI Frontier-Seven Monitor v1.0.0', { status: 200 });
  },
};

// ─── Core run logic ──────────────────────────────────────────────────────────

async function runBrief(briefKind: 'daily' | 'weekly', env: Env): Promise<void> {
  const startedAt = new Date().toISOString();
  const runId = `${startedAt}-${briefKind}`;
  const errors: string[] = [];

  console.log(`[${runId}] Starting`);

  // §10.2 — Only enabled sources
  const enabled = sources.filter(s => s.enabled);

  // ── 1. Fetch ─────────────────────────────────────────────────────────────
  const allRaw = [];

  for (const source of enabled) {
    try {
      if (source.kind === 'rss' || source.kind === 'atom' || source.kind === 'json') {
        const result = await fetchFeed(source);
        if (result.error) {
          errors.push(`Fetch ${source.id}: ${result.error}`);
        }
        allRaw.push(...result.items);
        if (result.items.length > 0) {
          await recordLastItem(source.id, result.items[0].fetched_at, env);
        }
      } else if (source.kind === 'scrape') {
        if (!env.BROWSER) {
          errors.push(`Scrape ${source.id}: BROWSER binding not available`);
          continue;
        }
        const items = await scrapeUrl(source, env.BROWSER);
        allRaw.push(...items);
        if (items.length > 0) {
          await recordLastItem(source.id, items[0].fetched_at, env);
        }
      }
    } catch (err) {
      errors.push(`Source ${source.id}: ${err}`);
    }
  }

  console.log(`[${runId}] Fetched ${allRaw.length} raw items from ${enabled.length} sources`);

  // ── 2. Dedup ─────────────────────────────────────────────────────────────
  const fresh = await dedup(allRaw, env);
  console.log(`[${runId}] After dedup: ${fresh.length} new items`);

  // ── 3. Classify (Haiku 4.5) ───────────────────────────────────────────
  const classified = await classifyBatch(fresh, env, errors);
  const deferredCount = errors.filter(e => e.startsWith('Classification deferred')).length;

  console.log(
    `[${runId}] Classified: ${classified.length} items — T1:${classified.filter(i => i.tier === 1).length} T2:${classified.filter(i => i.tier === 2).length} T3:${classified.filter(i => i.tier === 3).length}`
  );

  // ── 4. Watch list & stale sources ────────────────────────────────────
  const [watchItems, staleSources] = await Promise.all([
    loadWatchList(env),
    detectStaleSources(enabled, env),
  ]);

  // ── 5. Synthesize (Sonnet 4.6) ────────────────────────────────────────
  const datePt = formatDatePt(env.SUAS_TZ);
  const windowStart = new Date(
    Date.now() - (briefKind === 'weekly' ? 7 : 1) * 24 * 60 * 60 * 1000
  ).toISOString();

  const synthInput = {
    date_pt: datePt,
    window_start: windowStart,
    window_end: startedAt,
    items: classified,
    watch_items: watchItems,
    bot_health: {
      delivery_status: {},
      stale_sources: staleSources,
      deferred_count: deferredCount,
    },
    run_id: runId,
    n_fetched: allRaw.length,
  };

  let markdown: string;
  try {
    markdown =
      briefKind === 'daily'
        ? await synthesizeDaily(synthInput, env)
        : await synthesizeWeekly(synthInput, env);
  } catch (err) {
    errors.push(`Synthesis failed: ${err}`);
    markdown = buildFallbackBrief(runId, briefKind, classified, errors);
  }

  // §8.5 — Post-formatter citation-discipline linter (TIER 1 must carry URL)
  try {
    assertCitationDiscipline(markdown);
  } catch (lintErr) {
    errors.push(`Citation lint: ${lintErr}`);
    // Do not abort delivery; surface the error in the brief footer
    markdown += `\n\n> ⚠️ Citation discipline warning: ${lintErr}`;
  }

  // ── 6. Format outputs ─────────────────────────────────────────────────
  const tier1Count = classified.filter(i => i.tier === 1).length;
  const tier2Count = classified.filter(i => i.tier === 2).length;

  const subject =
    briefKind === 'daily'
      ? `SUAS AI Daily — ${datePt} — ${tier1Count} TIER 1 · ${tier2Count} TIER 2`
      : `SUAS AI Weekly — wk of ${datePt} — top 3 + action items`;

  const html = markdownToHtml(markdown, subject);
  const plaintext = markdownToPlaintext(markdown);
  const slackBlocks = buildSlackBlocks(
    markdown,
    classified,
    runId,
    datePt,
    allRaw.length
  );
  const mcpPayload = buildMCPPayload(runId, briefKind, classified, {});

  // ── 7. Archive to R2 (§2.5 — Object Lock 2,557d set at bucket level) ─
  await archiveBrief(markdown, runId, briefKind, env);

  // ── 8. Deliver (all channels in parallel, each independently retried) ─
  const deliveryResult = await deliverAll(
    markdown,
    html,
    plaintext,
    slackBlocks,
    mcpPayload,
    subject,
    runId,
    briefKind,
    env
  );

  if (deliveryResult.errors.length > 0) {
    errors.push(...deliveryResult.errors);
  }

  console.log(`[${runId}] Delivered: drive=${!!deliveryResult.drive} email=${!!deliveryResult.email} slack=${!!deliveryResult.slack} mcp=${deliveryResult.mcp}`);

  // ── 9. Update watch list & route hand-offs ────────────────────────────
  await updateWatchList(classified, runId, env);
  if (briefKind === 'weekly') {
    await markWatchItemsAsWeekly(env);
  }
  await routeHandoffs(classified, runId, env);

  console.log(`[${runId}] Done. Total errors: ${errors.length}`);
  if (errors.length > 0) {
    console.warn(`[${runId}] Errors:`, errors);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLocalHour(tz: string): number {
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  );
}

function getLocalDOW(tz: string): number {
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  }).format(new Date());
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[day] ?? 0;
}

function formatDatePt(tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function buildFallbackBrief(
  runId: string,
  briefKind: string,
  items: ReturnType<typeof classifyBatch> extends Promise<infer T> ? T : never,
  errors: string[]
): string {
  const tier1 = (items as { tier: number; headline: string; summary: string; primary_sources: string[]; source: { url_canonical: string } }[]).filter(i => i.tier === 1);
  const tier2 = (items as typeof tier1).filter(i => i.tier === 2);

  return `# SUAS AI ${briefKind === 'daily' ? 'Daily' : 'Weekly'} — ${runId}
*DRAFT — INTERNAL ONLY — Synthesis failed; raw classified items below*

## TL;DR
Synthesis engine encountered an error. ${errors.length} error(s) logged. Manual officer review required before use.

## TIER 1 — Action-required
${tier1.map(i => `- **${i.headline}** — ${i.summary}  \n  Source: ${i.primary_sources[0] ?? i.source.url_canonical}`).join('\n') || '_None_'}

## TIER 2 — Material
${tier2.map(i => `- **${i.headline}** — ${i.summary}`).join('\n') || '_None_'}

## Bot health
- Errors: ${errors.map(e => `  - ${e}`).join('\n')}
- Run ID: \`${runId}\`

---
Veterans Crisis Line — dial 988, press 1 — free, confidential, 24/7.`;
}
