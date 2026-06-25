import type { Env, DeliveryResult, SlackBlock } from './types.js';

export async function deliverAll(
  markdown: string,
  html: string,
  plaintext: string,
  slackBlocks: SlackBlock[],
  mcpPayload: object,
  subject: string,
  runId: string,
  briefKind: 'daily' | 'weekly',
  env: Env
): Promise<DeliveryResult> {
  const result: DeliveryResult = {
    drive: false,
    email: false,
    slack: false,
    mcp: null,
    errors: [],
  };

  const [driveRes, emailRes, slackRes, mcpRes] = await Promise.allSettled([
    withRetry(() => deliverToDrive(markdown, runId, briefKind, env)),
    withRetry(() => deliverEmail(html, plaintext, subject, env)),
    withRetry(() => deliverSlack(slackBlocks, subject, env)),
    deliverMCP(mcpPayload, env),
  ]);

  if (driveRes.status === 'fulfilled') {
    result.drive = driveRes.value;
  } else {
    result.errors.push(`GDrive: ${driveRes.reason}`);
  }

  if (emailRes.status === 'fulfilled') {
    result.email = emailRes.value;
  } else {
    result.errors.push(`Email: ${emailRes.reason}`);
  }

  if (slackRes.status === 'fulfilled') {
    result.slack = slackRes.value;
  } else {
    result.errors.push(`Slack: ${slackRes.reason}`);
  }

  if (mcpRes.status === 'fulfilled') {
    result.mcp = mcpRes.value;
  } else {
    result.errors.push(`MCP: ${mcpRes.reason}`);
  }

  return result;
}

// Google Drive upload via service account JWT (§2.3 — GDrive delivery)
async function deliverToDrive(
  markdown: string,
  runId: string,
  briefKind: 'daily' | 'weekly',
  env: Env
): Promise<string> {
  const sa = JSON.parse(env.GDRIVE_SERVICE_ACCOUNT_JSON);
  const token = await getServiceAccountToken(sa);
  const date = runId.slice(0, 10);
  const filename = `${date}.md`;

  const metadata = JSON.stringify({
    name: filename,
    mimeType: 'text/markdown',
    description: `SUAS AI ${briefKind} brief — ${date} — DRAFT INTERNAL ONLY`,
  });

  const boundary = 'suas_news_boundary';
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: text/markdown; charset=UTF-8',
    '',
    markdown,
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    }
  );

  if (!res.ok) {
    throw new Error(`Drive ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string };
  return `drive://SUAS_QRF/AI_Intelligence/${briefKind}/${filename} (id:${data.id})`;
}

// Service account JWT signing for Google APIs
async function getServiceAccountToken(sa: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );

  const signingInput = `${header}.${payload}`;
  const keyPem = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const keyBuffer = Uint8Array.from(atob(keyPem), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

// §3.4 — Email via Resend
async function deliverEmail(
  html: string,
  plaintext: string,
  subject: string,
  env: Env
): Promise<string> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'suas-news-bot@suasqrf.org',
      to: [env.FOUNDER_EMAIL],
      subject,
      html,
      text: plaintext,
      headers: {
        'List-Id': 'suas-ai-news.suasqrf.org',
        'X-SUAS-Brief-Run-Id': subject,
        'X-SUAS-Review-Status': 'draft-internal-only',
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { id?: string };
  return data.id ?? 'sent';
}

// §3.5 — Slack via chat.postMessage + Block Kit
async function deliverSlack(
  blocks: SlackBlock[],
  fallbackText: string,
  env: Env
): Promise<string> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: env.SLACK_CHANNEL_ID,
      text: fallbackText,
      blocks,
    }),
  });

  const data = (await res.json()) as { ok: boolean; ts?: string; error?: string };
  if (!data.ok) throw new Error(`Slack: ${data.error}`);
  return data.ts ?? 'sent';
}

// §2.3 — MCP hand-off to localhost:8080 via Cloudflare Tunnel
async function deliverMCP(payload: object, env: Env): Promise<string | null> {
  if (!env.MCP_ENDPOINT) return null;

  try {
    const res = await fetch(env.MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MCP_TOKEN}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`MCP ${res.status}`);
    return 'ack';
  } catch {
    return null; // MCP is non-fatal; queue JSON to R2 pending-mcp/ if needed
  }
}

// Exponential backoff retry: delays [0, 30s, 5min] matching §2.6 failure modes
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  const delays = [0, 30_000, 300_000];

  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(delays[i]);
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
    }
  }

  throw new Error('unreachable');
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
