import type { Source, RawItem } from './types.js';

// Playwright via Cloudflare Browser Rendering (@cloudflare/playwright)
// wrangler.toml: [browser] binding = "BROWSER"
// Usage: const browser = await launch(env.BROWSER)
// Docs: developers.cloudflare.com/browser-rendering/

export async function scrapeUrl(source: Source, browser: Fetcher): Promise<RawItem[]> {
  const now = new Date().toISOString();

  try {
    // Dynamic import so the Worker doesn't fail if @cloudflare/playwright is absent in dev
    const { launch } = await import('@cloudflare/playwright');
    const b = await launch(browser);
    const page = await b.newPage();

    await page.goto(source.url, { waitUntil: 'networkidle', timeout: 60_000 });

    const extracted = await page.evaluate(() => {
      const results: Array<{ title: string; href: string; date: string; excerpt: string }> = [];
      const seen = new Set<string>();

      const selectors = [
        'article a[href]',
        '[class*="post"] a[href]',
        '[class*="news"] a[href]',
        '[class*="card"] a[href]',
        'h2 a[href]',
        'h3 a[href]',
        'li a[href]',
      ];

      for (const selector of selectors) {
        for (const el of document.querySelectorAll(selector)) {
          const link = el as HTMLAnchorElement;
          const href = link.href;
          const rawTitle = (link.innerText ?? link.textContent ?? link.getAttribute('aria-label') ?? '').trim();

          if (!href || rawTitle.length < 15 || seen.has(href)) continue;

          try {
            const u = new URL(href);
            if (u.pathname === '/' || u.pathname.length < 5) continue;
          } catch { continue; }

          seen.add(href);

          const container = link.closest('article, [class*="post"], [class*="card"], [class*="news"], li');
          const dateEl = container?.querySelector('time, [class*="date"], [datetime]');
          const date =
            (dateEl as HTMLElement | null)?.getAttribute('datetime') ??
            (dateEl as HTMLElement | null)?.innerText?.trim() ??
            '';
          const excerptEl = container?.querySelector('p, [class*="excerpt"], [class*="summary"], [class*="desc"]');
          const excerpt = ((excerptEl as HTMLElement | null)?.innerText ?? '').trim().slice(0, 500);

          results.push({ title: rawTitle, href, date, excerpt });
          if (results.length >= 25) return results;
        }
        if (results.length >= 25) break;
      }

      return results;
    });

    await page.close();
    await b.close();

    return extracted.map(item => ({
      source_id: source.id,
      publisher: source.publisher,
      url: item.href,
      title: item.title,
      pub_date: item.date ? toIso(item.date) : now,
      body_excerpt: item.excerpt,
      fetched_at: now,
    }));
  } catch (err) {
    console.error(`Scraper error [${source.id}]:`, err);
    return [];
  }
}

function toIso(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
}
