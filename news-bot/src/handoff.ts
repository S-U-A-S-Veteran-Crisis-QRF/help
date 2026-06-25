import type { ClassifiedItem, HandoffPayload, Env } from './types.js';

// §9.1 — Hand-off routing table
export async function routeHandoffs(
  items: ClassifiedItem[],
  runId: string,
  env: Env
): Promise<void> {
  const tier1 = items.filter(i => i.tier === 1 && !i.handoff.every(h => h === 'none'));

  for (const item of tier1) {
    for (const target of item.handoff) {
      if (target === 'none') continue;

      const payload: HandoffPayload = {
        from_agent: 'suas-news-bot',
        version: '1.0.0',
        to_agent: target,
        run_id: runId,
        item_id: item.id,
        tier: item.tier,
        tags: item.tags,
        headline: item.headline,
        primary_sources: item.primary_sources,
        suas_impact_note: item.suas_impact_note,
        review_status: 'draft-internal-only',
      };

      // Extract ISO deadline if present in impact note or tags
      const deadlineMatch =
        item.suas_impact_note.match(/\b(20\d\d-\d{2}-\d{2})\b/) ??
        item.summary.match(/\b(20\d\d-\d{2}-\d{2})\b/);
      if (deadlineMatch) {
        payload.deadline_iso = `${deadlineMatch[1]}T00:00:00Z`;
      }

      // §9.3 — File drop (authoritative, R2 immutable record) + MCP notification
      await Promise.allSettled([
        dropHandoffFile(payload, env),
        notifyMCP(target, payload, env),
      ]);
    }
  }
}

// File drop to R2/_handoffs/{agent}/{run_id}/{item_id}.json
async function dropHandoffFile(payload: HandoffPayload, env: Env): Promise<void> {
  const key = `_handoffs/${payload.to_agent}/${payload.run_id}/${payload.item_id}.json`;
  await env.SUAS_BRIEFS.put(key, JSON.stringify(payload, null, 2), {
    httpMetadata: { contentType: 'application/json' },
    customMetadata: { review_status: 'draft-internal-only' },
  });
}

// MCP tool call /v1/handoff/{agent_name}
async function notifyMCP(target: string, payload: HandoffPayload, env: Env): Promise<void> {
  if (!env.MCP_ENDPOINT) return;

  const base = env.MCP_ENDPOINT.replace(/\/v1\/ingest$/, '');

  try {
    await fetch(`${base}/v1/handoff/${target}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MCP_TOKEN}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Non-fatal: file drop is the authoritative channel; downstream agents
    // have a "scan _handoffs/ on startup" recovery loop (§9.3).
  }
}
