export type SourceKind = 'rss' | 'atom' | 'scrape' | 'json';
export type Reliability = 'A' | 'B' | 'C';
export type SuasRelevance = 1 | 2 | 3 | 4 | 5;
export type Tier = 1 | 2 | 3;
export type HandoffTarget =
  | 'grant-bot'
  | 'finance-director'
  | 'compliance-officer'
  | 'legal-liaison'
  | 'clinical-liaison'
  | 'tech'
  | 'none';

export interface Source {
  id: string;
  publisher: string;
  kind: SourceKind;
  url: string;
  feed_url: string | null;
  expected_cadence_days: number;
  reliability: Reliability;
  suas_relevance: SuasRelevance;
  enabled: boolean;
  notes?: string;
}

export interface RawItem {
  source_id: string;
  publisher: string;
  url: string;
  title: string;
  pub_date: string;
  body_excerpt: string;
  fetched_at: string;
}

export interface ClassifiedItem {
  id: string;
  source: {
    publisher: string;
    url_canonical: string;
    fetched_at: string;
    feed: string;
  };
  headline: string;
  tier: Tier;
  tags: string[];
  summary: string;
  suas_impact_note: string;
  primary_sources: string[];
  handoff: HandoffTarget[];
  review_status: 'draft-internal-only';
}

export interface ClassifierResponse {
  tier: Tier;
  tags: string[];
  summary: string;
  suas_impact_note: string;
  primary_sources: string[];
  handoff: HandoffTarget[];
}

export interface WatchItem {
  id: string;
  tier: Tier;
  headline: string;
  url: string;
  first_seen: string;
  mentioned_in_daily: string[];
  promoted_to_weekly: boolean;
}

export interface RunLedgerEntry {
  run_id: string;
  brief_kind: 'daily' | 'weekly';
  started_at: string;
  completed_at?: string;
  n_fetched: number;
  n_kept: number;
  n_tier1: number;
  n_tier2: number;
  n_tier3: number;
  delivery_results: DeliveryResult;
  errors: string[];
}

export interface DeliveryResult {
  drive: boolean | string;
  email: boolean | string;
  slack: boolean | string;
  mcp: string | null;
  errors: string[];
}

export interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

export interface MCPPayload {
  schema_version: 'suas.news.v1';
  run_id: string;
  generated_at: string;
  brief_kind: 'daily' | 'weekly';
  items: ClassifiedItem[];
  delivery: {
    drive: string | null;
    email_message_id: string | null;
    slack_ts: string | null;
    mcp_ack: string | null;
  };
}

export interface HandoffPayload {
  from_agent: 'suas-news-bot';
  version: '1.0.0';
  to_agent: string;
  run_id: string;
  item_id: string;
  tier: Tier;
  tags: string[];
  headline: string;
  primary_sources: string[];
  suas_impact_note: string;
  deadline_iso?: string;
  recommended_action?: string;
  review_status: 'draft-internal-only';
}

export interface SynthesisInput {
  date_pt: string;
  window_start: string;
  window_end: string;
  items: ClassifiedItem[];
  watch_items: WatchItem[];
  bot_health: {
    delivery_status: Record<string, boolean>;
    stale_sources: string[];
    deferred_count: number;
  };
  run_id: string;
  n_fetched: number;
}

export interface Env {
  // KV Namespaces
  SUAS_NEWS_SEEN: KVNamespace;
  SUAS_NEWS_WATCH: KVNamespace;
  // R2
  SUAS_BRIEFS: R2Bucket;
  // Durable Object
  SUAS_NEWS_RUN_LEDGER: DurableObjectNamespace;
  // Browser Rendering (for scrape sources)
  BROWSER: Fetcher;
  // Secrets (set via wrangler secret put)
  ANTHROPIC_API_KEY: string;
  RESEND_API_KEY: string;
  SLACK_BOT_TOKEN: string;
  GDRIVE_SERVICE_ACCOUNT_JSON: string;
  MCP_TOKEN: string;
  // Vars (set in wrangler.toml [vars])
  SUAS_TZ: string;
  ANTHROPIC_MODEL_CLASSIFY: string;
  ANTHROPIC_MODEL_SYNTH: string;
  MCP_ENDPOINT: string;
  SLACK_CHANNEL_ID: string;
  FOUNDER_EMAIL: string;
}
