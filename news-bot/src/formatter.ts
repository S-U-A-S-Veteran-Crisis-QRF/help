import type { ClassifiedItem, DeliveryResult, MCPPayload, SlackBlock } from './types.js';

// §3.3 — MCP JSON payload
export function buildMCPPayload(
  runId: string,
  briefKind: 'daily' | 'weekly',
  items: ClassifiedItem[],
  delivery: Partial<DeliveryResult>
): MCPPayload {
  return {
    schema_version: 'suas.news.v1',
    run_id: runId,
    generated_at: new Date().toISOString(),
    brief_kind: briefKind,
    items,
    delivery: {
      drive: typeof delivery.drive === 'string' ? delivery.drive : null,
      email_message_id: typeof delivery.email === 'string' ? delivery.email : null,
      slack_ts: typeof delivery.slack === 'string' ? delivery.slack : null,
      mcp_ack: null,
    },
  };
}

// §3.5 — Slack Block Kit (max 50 blocks per spec + Slack limits)
export function buildSlackBlocks(
  markdown: string,
  items: ClassifiedItem[],
  runId: string,
  datePt: string,
  nFetched: number
): SlackBlock[] {
  const tier1 = items.filter(i => i.tier === 1);
  const tier2 = items.filter(i => i.tier === 2);
  const tier3 = items.filter(i => i.tier === 3);

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `SUAS AI Daily — ${datePt}` },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Draft — internal only.* ${nFetched} scanned · ${items.length} kept · ${tier1.length} TIER 1 · ${tier2.length} TIER 2 · ${tier3.length} TIER 3`,
        },
      ],
    },
    { type: 'divider' },
  ];

  // TL;DR extracted from markdown
  const tldrMatch = markdown.match(/## TL;DR\n([\s\S]*?)(?=\n## |\n# |\Z)/);
  if (tldrMatch) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*TL;DR* — ${tldrMatch[1].trim().slice(0, 2000)}` },
    });
    blocks.push({ type: 'divider' });
  }

  // TIER 1 items (up to 5)
  for (const item of tier1.slice(0, 5)) {
    const sourceUrl = item.primary_sources[0] ?? item.source.url_canonical;
    const tags = item.tags.slice(0, 3).join(', ');
    const handoffs = item.handoff.filter(h => h !== 'none').join('*, *');

    const lines = [
      `*🚨 TIER 1 — [${tags}]* <${sourceUrl}|${escapeSlack(item.headline)}>`,
      `• What changed: ${item.summary}`,
    ];
    if (item.suas_impact_note !== 'none') {
      lines.push(`• SUAS impact: ${item.suas_impact_note}`);
    }
    if (handoffs) {
      lines.push(`• Hand-off: *${handoffs}*`);
    }

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: lines.join('\n') },
    });
  }

  // TIER 2 block
  if (tier2.length > 0) {
    blocks.push({ type: 'divider' });
    const tier2Lines = tier2
      .slice(0, 5)
      .map(i => {
        const url = i.primary_sources[0] ?? i.source.url_canonical;
        return `• <${url}|${escapeSlack(i.headline)}> — ${i.summary}`;
      })
      .join('\n');
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*TIER 2 — Material*\n${tier2Lines}` },
    });
  }

  // Footer
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Run \`${runId}\` · GDrive pending · *988, press 1 — Veterans Crisis Line*`,
      },
    ],
  });

  return blocks.slice(0, 50);
}

export function markdownToPlaintext(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/---+/g, '─'.repeat(40))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// §3.4 — Email HTML (premailer-style inline, max-width 680px, no tracking pixels)
export function markdownToHtml(markdown: string, subject: string): string {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let html = escaped
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(
      /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" style="color:#1a5276;">$1</a>'
    )
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:4px;">$1</li>')
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">')
    .replace(/\n\n/g, '</p><p style="margin:0 0 12px 0;">')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtmlAttr(subject)}</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:680px;margin:0 auto;padding:16px;color:#111;font-size:15px;line-height:1.55;background:#fff;">
<div style="background:#b22222;color:#fff;padding:10px 14px;border-radius:4px;font-weight:bold;margin-bottom:16px;">
  ⚡ Veterans Crisis Line — dial <strong>988, press 1</strong> — free, confidential, 24/7
</div>
<p style="background:#fff3cd;border:1px solid #ffc107;padding:8px 12px;border-radius:4px;font-size:0.85em;margin-bottom:20px;">
  <strong>DRAFT — INTERNAL ONLY.</strong> Pending officer review. Do not distribute externally.<br>
  <em>X-SUAS-Review-Status: draft-internal-only</em>
</p>
<p style="margin:0 0 12px 0;">${html}</p>
<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
<p style="font-size:0.82em;color:#666;margin:0;">
  S.U.A.S. Veteran Crisis Q.R.F. · EIN 88-3249428 · 727 Edge Lane, Los Altos, CA 94024<br>
  Contributions are tax-deductible under IRC Section 170(b)(1)(A)(vi).<br>
  <a href="https://s-u-a-s-veteran-crisis-qrf.github.io/help/" style="color:#1a5276;">suasqrf.org</a>
</p>
</body>
</html>`;
}

function escapeSlack(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Post-formatter linter: verifies every TIER 1 heading is followed by a URL within 8 lines.
// Aborts delivery by throwing if citation discipline fails.
export function assertCitationDiscipline(markdown: string): void {
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (/^## TIER 1/.test(lines[i]) || /^### \[/.test(lines[i])) {
      const window = lines.slice(i + 1, i + 9).join(' ');
      if (!/https?:\/\//.test(window)) {
        throw new Error(
          `Citation discipline violation: TIER 1 block at line ${i + 1} has no URL in next 8 lines`
        );
      }
    }
  }
}
