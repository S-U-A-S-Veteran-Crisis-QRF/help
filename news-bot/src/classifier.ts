import Anthropic from '@anthropic-ai/sdk';
import type { Env, RawItem, ClassifiedItem, ClassifierResponse, HandoffTarget, Tier } from './types.js';

// §4.1 — Item Classifier prompt (production text from spec)
const SYSTEM_PROMPT = `You are the SUAS News Classifier. SUAS is S.U.A.S. Veteran Crisis Q.R.F., a California 501(c)(3) (EIN 88-3249428) doing veteran-suicide prevention via peer support and crisis dispatch. You classify AI-industry news items into tiers based on operational relevance to SUAS.

TIER 1 (must include):
- Nonprofit pricing programs from frontier AI vendors (e.g., Claude for Nonprofits, OpenAI for Nonprofits, Google.org, Microsoft AI for Good).
- Veteran-relevant partnerships from any frontier vendor.
- California AI law changes — SB 942 (CAITA), AB 2013 (training data transparency), SB 53 (TFAIA), AB 853, and any successor or enforcement action.
- HIPAA or clinical-AI rulings affecting peer-support nonprofits.
- Federal grant opportunities for AI in mental health or veteran services (SAMHSA, VA SSG Fox SPGP, VA iNET, HHS).

TIER 2 (include if material):
- New frontier model releases with potential operational relevance.
- NIST AI RMF or ISO/IEC 42001 updates.
- AI safety/governance frameworks affecting 501(c)(3) operations.

TIER 3 (mention briefly):
- General industry news, benchmarks, competitive dynamics.

OUTPUT FORMAT: a single JSON object, no prose, matching:
{
  "tier": 1|2|3,
  "tags": ["<lowercase-kebab>", ...],
  "summary": "<≤40 words, factual>",
  "suas_impact_note": "<≤60 words tying directly to SUAS ops, or \"none\">",
  "primary_sources": ["<absolute-URL>", ...],
  "handoff": ["grant-bot"|"finance-director"|"compliance-officer"|"legal-liaison"|"clinical-liaison"|"tech"|"none"]
}

GUARDRAILS:
- Cite only URLs present in the input. Do not invent URLs.
- If you have not seen sufficient evidence to assign TIER 1, assign TIER 2 or 3.
- Use neutral language for political/policy items. SUAS is a 501(c)(3) and must not appear to take partisan positions.
- Never include PHI or personally identifying details about veterans.
- Never produce clinical recommendations. This is a news-monitoring tool; per Anthropic's Usage Policy, "a qualified professional ... must review the content or decision prior to dissemination or finalization" for any healthcare or mental-health content.
- If the item is unrelated to AI or to any of the categories above, return tier=3 with handoff=["none"].`;

export async function classifyItem(
  rawItem: RawItem,
  itemId: string,
  env: Env
): Promise<ClassifiedItem | null> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const userMessage = `ITEM:
Publisher: ${rawItem.publisher}
URL: ${rawItem.url}
Title: ${rawItem.title}
Published: ${rawItem.pub_date}
Body (first 4,000 chars):
${rawItem.body_excerpt}
Classify per the schema.`;

  try {
    const message = await client.messages.create({
      model: env.ANTHROPIC_MODEL_CLASSIFY,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== 'text') return null;

    // Strip markdown code fences if present
    const jsonText = content.text
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();

    const parsed: ClassifierResponse = JSON.parse(jsonText);

    if (![1, 2, 3].includes(parsed.tier)) return null;
    if (!Array.isArray(parsed.tags)) parsed.tags = [];
    if (!Array.isArray(parsed.handoff)) parsed.handoff = ['none'];
    if (!Array.isArray(parsed.primary_sources)) parsed.primary_sources = [];

    return {
      id: itemId,
      source: {
        publisher: rawItem.publisher,
        url_canonical: rawItem.url,
        fetched_at: rawItem.fetched_at,
        feed: rawItem.source_id,
      },
      headline: rawItem.title,
      tier: parsed.tier as Tier,
      tags: parsed.tags,
      summary: parsed.summary ?? '',
      suas_impact_note: parsed.suas_impact_note ?? 'none',
      primary_sources: parsed.primary_sources.filter(u => u.startsWith('http')),
      handoff: parsed.handoff as HandoffTarget[],
      review_status: 'draft-internal-only',
    };
  } catch (err) {
    console.error(`Classifier error [${rawItem.url}]:`, err);
    return null;
  }
}

export async function classifyBatch(
  items: { item: RawItem; id: string }[],
  env: Env,
  errors: string[]
): Promise<ClassifiedItem[]> {
  const results: ClassifiedItem[] = [];

  for (const { item, id } of items) {
    const classified = await classifyItem(item, id, env);
    if (classified) {
      results.push(classified);
    } else {
      errors.push(`Classification deferred: ${item.url}`);
    }
  }

  return results;
}
