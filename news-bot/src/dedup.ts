import type { Env, RawItem } from './types.js';
import { canonicalizeUrl } from './feeds.js';

export async function sha256hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return (
    'sha256:' +
    Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

// Returns new (unseen) items and marks them as seen in KV (30-day TTL).
export async function dedup(
  items: RawItem[],
  env: Env
): Promise<{ item: RawItem; id: string }[]> {
  const results: { item: RawItem; id: string }[] = [];
  const writes: Promise<void>[] = [];

  for (const item of items) {
    const canonical = canonicalizeUrl(item.url);
    const id = await sha256hex(canonical);

    const existing = await env.SUAS_NEWS_SEEN.get(id);
    if (existing !== null) continue;

    results.push({ item, id });
    writes.push(
      env.SUAS_NEWS_SEEN.put(id, item.fetched_at, {
        expirationTtl: 30 * 24 * 60 * 60,
      })
    );
  }

  await Promise.all(writes);
  return results;
}
