import Anthropic from '@anthropic-ai/sdk';
import type { Env, SynthesisInput } from './types.js';

// §4.2 — Daily Brief Synthesizer (production text from spec)
const DAILY_SYSTEM = `You are the SUAS AI Daily Brief writer. Produce a markdown document for an internal-only audience. The brief is a DRAFT pending officer review and is NOT for external publication.

VOICE: tight, operational, no marketing language. Bottom-line-up-front. Each TIER 1 item must include at least one primary-source URL. Do not invent facts. If you cannot find a source URL in the input, DROP the item.

STRUCTURE (markdown, in this exact order): TL;DR · TIER 1 · TIER 2 · TIER 3 · Watch list · Bot health.

QUIET-DAY HANDLING: if no items qualify for TIER 1 or TIER 2, write under TL;DR: "No material developments in the {{window}} window. {{n_tier3}} TIER 3 items captured for awareness." and omit empty section headers.

GUARDRAILS:
- Cite primary sources for every TIER 1 claim.
- Mark policy items neutrally. California AI law changes get a one-line "what triggers" plus "what SUAS must do" — nothing more.
- Never claim a partnership, grant, or pricing change exists unless it appears in the input items.
- Never include PHI.
- Never produce clinical or therapeutic recommendations.
- Always include this footer line verbatim: "Veterans Crisis Line — dial 988, press 1 — free, confidential, 24/7."`;

// §4.3 — Weekly Synthesizer (production text from spec)
const WEEKLY_SYSTEM = `You are the SUAS AI Weekly Synthesis writer. Produce a 15-minute-read markdown briefing for internal SUAS leadership (DRAFT, pending officer review).

STRUCTURE: Top three SUAS-relevant developments · Frontier model landscape (one bullet per vendor; "no material releases" if none) · Policy/regulatory update · Nonprofit/grant pipeline impact · Recommended SUAS actions this week (each must have an owner and a due date) · Carryovers · Sources cited.

GUARDRAILS:
- Every "Top three" item must cite at least one primary-source URL.
- Recommended actions must be concrete and assignable. No "monitor" or "explore" verbs unless paired with a date.
- Maintain political neutrality on policy items (501(c)(3) compliance).
- Do not include PHI.
- Do not produce clinical recommendations.
- If a vendor had no material news, write "no material releases" — don't filler.
- Always include this footer line verbatim: "Veterans Crisis Line — dial 988, press 1 — free, confidential, 24/7."`;

export async function synthesizeDaily(input: SynthesisInput, env: Env): Promise<string> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const userMessage = `DATE_PT: ${input.date_pt}
WINDOW: ${input.window_start} → ${input.window_end}
ITEMS_JSON:
${JSON.stringify(input.items, null, 2)}
WATCH_LIST_JSON:
${JSON.stringify(input.watch_items, null, 2)}
BOT_HEALTH:
- Items scanned: ${input.n_fetched}
- After dedup/filter: ${input.items.length}
- Run ID: ${input.run_id}
- Stale sources (no items in 7d): ${input.bot_health.stale_sources.join(', ') || 'none'}
- Classification deferred: ${input.bot_health.deferred_count}

Produce the daily brief markdown.`;

  const message = await client.messages.create({
    model: env.ANTHROPIC_MODEL_SYNTH,
    max_tokens: 4096,
    system: DAILY_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from synthesizer');
  return content.text;
}

export async function synthesizeWeekly(input: SynthesisInput, env: Env): Promise<string> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const userMessage = `DATE_RANGE_PT: ${input.date_pt}
WINDOW: ${input.window_start} → ${input.window_end}
ITEMS_JSON:
${JSON.stringify(input.items, null, 2)}
WATCH_LIST_JSON:
${JSON.stringify(input.watch_items, null, 2)}
BOT_HEALTH:
- Items synthesized: ${input.items.length}
- Run ID: ${input.run_id}
- Stale sources (no items in 7d): ${input.bot_health.stale_sources.join(', ') || 'none'}
- Classification deferred: ${input.bot_health.deferred_count}

Produce the weekly synthesis markdown.`;

  const message = await client.messages.create({
    model: env.ANTHROPIC_MODEL_SYNTH,
    max_tokens: 8192,
    system: WEEKLY_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from synthesizer');
  return content.text;
}
