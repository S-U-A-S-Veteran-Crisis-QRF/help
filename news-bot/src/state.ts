import type { Env, ClassifiedItem, WatchItem, Source } from './types.js';

// §2.5 — SUAS_NEWS_WATCH: carryover watch list (14-day TTL)

export async function loadWatchList(env: Env): Promise<WatchItem[]> {
  const listed = await env.SUAS_NEWS_WATCH.list({ prefix: 'watch:' });
  const items: WatchItem[] = [];

  for (const key of listed.keys) {
    const value = await env.SUAS_NEWS_WATCH.get<WatchItem>(key.name, 'json');
    if (value) items.push(value);
  }

  return items;
}

export async function updateWatchList(
  newItems: ClassifiedItem[],
  runId: string,
  env: Env
): Promise<void> {
  const tier1And2 = newItems.filter(i => i.tier <= 2);

  for (const item of tier1And2) {
    const key = `watch:${item.id}`;
    const existing = await env.SUAS_NEWS_WATCH.get<WatchItem>(key, 'json');

    const watchItem: WatchItem = existing ?? {
      id: item.id,
      tier: item.tier,
      headline: item.headline,
      url: item.source.url_canonical,
      first_seen: item.source.fetched_at,
      mentioned_in_daily: [],
      promoted_to_weekly: false,
    };

    if (!watchItem.mentioned_in_daily.includes(runId)) {
      watchItem.mentioned_in_daily.push(runId);
    }

    await env.SUAS_NEWS_WATCH.put(key, JSON.stringify(watchItem), {
      expirationTtl: 14 * 24 * 60 * 60,
    });
  }
}

export async function markWatchItemsAsWeekly(env: Env): Promise<void> {
  const listed = await env.SUAS_NEWS_WATCH.list({ prefix: 'watch:' });

  for (const key of listed.keys) {
    const item = await env.SUAS_NEWS_WATCH.get<WatchItem>(key.name, 'json');
    if (item && !item.promoted_to_weekly) {
      item.promoted_to_weekly = true;
      await env.SUAS_NEWS_WATCH.put(key.name, JSON.stringify(item), {
        expirationTtl: 14 * 24 * 60 * 60,
      });
    }
  }
}

// §2.5 — R2://suas-briefs/{daily|weekly}/YYYY-MM-DD.md (Object Lock 2,557d in Compliance mode)
export async function archiveBrief(
  markdown: string,
  runId: string,
  briefKind: 'daily' | 'weekly',
  env: Env
): Promise<void> {
  const date = runId.slice(0, 10);
  const key = `briefs/${briefKind}/${date}.md`;

  await env.SUAS_BRIEFS.put(key, markdown, {
    httpMetadata: { contentType: 'text/markdown; charset=UTF-8' },
    customMetadata: {
      run_id: runId,
      brief_kind: briefKind,
      review_status: 'draft-internal-only',
    },
  });
}

// Stale source detection: no items recorded in >7d
export async function detectStaleSources(sources: Source[], env: Env): Promise<string[]> {
  const stale: string[] = [];
  const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const source of sources.filter(s => s.enabled)) {
    const lastSeen = await env.SUAS_NEWS_WATCH.get(`last_item:${source.id}`);
    if (!lastSeen || new Date(lastSeen).getTime() < sevenDaysAgoMs) {
      stale.push(source.id);
    }
  }

  return stale;
}

export async function recordLastItem(sourceId: string, ts: string, env: Env): Promise<void> {
  await env.SUAS_NEWS_WATCH.put(`last_item:${sourceId}`, ts, {
    expirationTtl: 90 * 24 * 60 * 60,
  });
}
