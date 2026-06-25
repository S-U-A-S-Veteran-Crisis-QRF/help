import type { RunLedgerEntry } from './types.js';

// §2.5 — SUAS_NEWS_RUN_LEDGER Durable Object
// Persists per-run metrics for §10.4 dashboard tracking.
export class RunLedger {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/start') {
      const entry = (await request.json()) as RunLedgerEntry;
      await this.state.storage.put(`run:${entry.run_id}`, entry);
      return new Response('ok');
    }

    if (request.method === 'PATCH' && url.pathname === '/complete') {
      const update = (await request.json()) as Partial<RunLedgerEntry> & { run_id: string };
      const existing = await this.state.storage.get<RunLedgerEntry>(`run:${update.run_id}`);
      if (existing) {
        const merged = { ...existing, ...update };
        await this.state.storage.put(`run:${update.run_id}`, merged);
      }
      return new Response('ok');
    }

    if (request.method === 'GET' && url.pathname === '/runs') {
      const all = await this.state.storage.list<RunLedgerEntry>({ prefix: 'run:' });
      const entries = [...all.values()].sort((a, b) =>
        b.started_at.localeCompare(a.started_at)
      ).slice(0, 30);
      return new Response(JSON.stringify(entries), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET' && url.pathname === '/metrics') {
      const all = await this.state.storage.list<RunLedgerEntry>({ prefix: 'run:' });
      const entries = [...all.values()];
      const completed = entries.filter(e => e.completed_at);

      const metrics = {
        total_runs: entries.length,
        completed_runs: completed.length,
        avg_tier1_per_run:
          completed.length > 0
            ? completed.reduce((s, e) => s + e.n_tier1, 0) / completed.length
            : 0,
        delivery_success_rate:
          completed.length > 0
            ? completed.filter(
                e =>
                  e.delivery_results.drive !== false &&
                  e.delivery_results.email !== false &&
                  e.delivery_results.slack !== false
              ).length / completed.length
            : 0,
        last_run: entries[0]?.started_at ?? null,
      };

      return new Response(JSON.stringify(metrics), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
