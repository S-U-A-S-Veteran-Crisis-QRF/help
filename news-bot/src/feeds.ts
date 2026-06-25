import type { Source, RawItem } from './types.js';

export interface FetchResult {
  items: RawItem[];
  error?: string;
}

export async function fetchFeed(source: Source): Promise<FetchResult> {
  const feedUrl = source.feed_url ?? source.url;

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'SUAS-QRF-News-Bot/1.0 (+https://s-u-a-s-veteran-crisis-qrf.github.io/help/)',
        Accept: 'application/rss+xml, application/atom+xml, application/json, text/xml, */*',
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return { items: [], error: `HTTP ${response.status} ${response.statusText}` };
    }

    const text = await response.text();

    if (source.kind === 'json') {
      return parseJsonFeed(text, source);
    }

    return parseXmlFeed(text, source);
  } catch (err) {
    return { items: [], error: String(err) };
  }
}

function parseXmlFeed(xml: string, source: Source): FetchResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { items: [], error: `XML parse: ${parseError.textContent?.slice(0, 200)}` };
    }

    const now = new Date().toISOString();
    const isAtom =
      doc.documentElement.tagName === 'feed' ||
      doc.documentElement.getAttribute('xmlns') === 'http://www.w3.org/2005/Atom';

    return isAtom ? parseAtom(doc, source, now) : parseRss(doc, source, now);
  } catch (err) {
    return { items: [], error: `Parse error: ${err}` };
  }
}

function parseAtom(doc: Document, source: Source, now: string): FetchResult {
  const items: RawItem[] = [];

  for (const entry of doc.querySelectorAll('entry')) {
    const title = entry.querySelector('title')?.textContent?.trim() ?? '';
    const linkEl =
      entry.querySelector('link[rel="alternate"]') ?? entry.querySelector('link');
    const url = linkEl?.getAttribute('href') ?? '';
    const updated = entry.querySelector('updated')?.textContent?.trim() ?? '';
    const published = entry.querySelector('published')?.textContent?.trim() ?? updated;
    const content =
      entry.querySelector('content')?.textContent?.trim() ??
      entry.querySelector('summary')?.textContent?.trim() ??
      '';

    if (!url || !title) continue;

    items.push({
      source_id: source.id,
      publisher: source.publisher,
      url: canonicalizeUrl(url),
      title,
      pub_date: published ? toIso(published) : now,
      body_excerpt: stripHtml(content).slice(0, 4000),
      fetched_at: now,
    });
  }

  return { items };
}

function parseRss(doc: Document, source: Source, now: string): FetchResult {
  const items: RawItem[] = [];

  for (const item of doc.querySelectorAll('item')) {
    const title = item.querySelector('title')?.textContent?.trim() ?? '';
    // RSS <link> is a text node between tags (not an attribute)
    const link =
      item.querySelector('link')?.textContent?.trim() ??
      item.querySelector('guid')?.textContent?.trim() ??
      '';
    const pubDate =
      item.querySelector('pubDate')?.textContent?.trim() ??
      item.querySelector('dc\\:date')?.textContent?.trim() ??
      '';
    const description =
      item.querySelector('content\\:encoded')?.textContent?.trim() ??
      item.querySelector('description')?.textContent?.trim() ??
      '';

    if (!link || !title) continue;

    items.push({
      source_id: source.id,
      publisher: source.publisher,
      url: canonicalizeUrl(link),
      title,
      pub_date: pubDate ? toIso(pubDate) : now,
      body_excerpt: stripHtml(description).slice(0, 4000),
      fetched_at: now,
    });
  }

  return { items };
}

function parseJsonFeed(json: string, source: Source): FetchResult {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    const now = new Date().toISOString();
    const items: RawItem[] = [];

    // JSON Feed spec (jsonfeed.org) and common API shapes
    const feedItems = (
      (data.items ?? data.entries ?? data.data ?? data.results ?? []) as Record<string, unknown>[]
    );

    for (const item of feedItems) {
      const url = String(item.url ?? item.external_url ?? item.canonicalUrl ?? '');
      const title = String(item.title ?? item.name ?? '');
      const pubDate = String(item.date_published ?? item.date_modified ?? item.closeDate ?? '');
      const content = String(
        item.content_text ??
          stripHtml(String(item.content_html ?? '')) ??
          item.summary ??
          item.description ??
          ''
      );

      if (!url || !title) continue;

      items.push({
        source_id: source.id,
        publisher: source.publisher,
        url: canonicalizeUrl(url),
        title,
        pub_date: pubDate ? toIso(pubDate) : now,
        body_excerpt: content.slice(0, 4000),
        fetched_at: now,
      });
    }

    return { items };
  } catch (err) {
    return { items: [], error: `JSON parse: ${err}` };
  }
}

export function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Strip tracking params
    for (const param of [...u.searchParams.keys()]) {
      if (param.startsWith('utm_') || param === 'ref' || param === 'source' || param === 'fbclid') {
        u.searchParams.delete(param);
      }
    }
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return url;
  }
}

function toIso(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
