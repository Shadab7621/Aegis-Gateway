import { GlassPanel, Pill } from './GlassPanel';

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_SERVER_URL || 'http://localhost:3001';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/rpc',
    desc: 'Submit an AI agent tool call for security screening. Aegis evaluates risk, blocks, or holds for human review.',
    body: `{
  "agent_id": "ops-agent-7",
  "action": "execute",
  "command": "cat /etc/passwd"
}`,
    response: `// Safe / Flagged (score < 1.0)
{
  "status": "success",
  "action": "executed",
  "risk_status": "FLAGGED",
  "risk_score": 0.65,
  "threat_reason": "File Read Attempt",
  "payload": { ... }
}

// Blocked (score >= 1.0)
// Response is held in a circular buffer
// until SecOps resolves it via /resolve`,
  },
  {
    method: 'POST',
    path: '/resolve',
    desc: 'Resolve a held/blocked request as a human reviewer. Requires X-Resolve-Token header.',
    body: `{
  "tool_call_id": "uuid-of-blocked-call",
  "resolution": "approved"
}`,
    response: `{
  "status": "resolved",
  "action": "approved",
  "risk_status": "COMPLETED",
  "payload": { ... }
}`,
  },
];

export function ApiDocs() {
  return (
    <div className="space-y-6">
      <GlassPanel className="p-5">
        <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--aegis-text)' }}>Drop-in proxy</h3>
        <p className="mt-1 text-sm text-aegis-muted">
          Point your agent runtime at{' '}
          <code className="font-mono break-all" style={{ color: 'var(--tone-cyan)' }}>{PROXY_URL}/rpc</code>{' '}
          instead of executing tool calls directly. Zero SDK changes. Every call is logged, scored, and policy-gated.
        </p>
      </GlassPanel>

      <GlassPanel className="p-4 border-l-2 border-[#FFB347]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--tone-amber)' }}>⚡ RATE LIMITING</span>
        </div>
        <p className="text-xs text-aegis-dim">10 requests per minute per agent_id, sliding window. Exceeding returns HTTP 429.</p>
      </GlassPanel>

      {ENDPOINTS.map(e => (
        <GlassPanel key={e.path} className="overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-aegis px-5 py-3">
            <Pill tone={e.method === 'POST' ? 'violet' : 'cyan'}>{e.method}</Pill>
            <code className="font-mono text-base" style={{ color: 'var(--aegis-text)' }}>{PROXY_URL}{e.path}</code>
            <span className="ml-auto text-xs text-aegis-dim hidden sm:block">{e.desc}</span>
          </div>
          <div className="grid grid-cols-1 gap-px md:grid-cols-2" style={{ background: 'var(--aegis-border)' }}>
            <Block title="Request" code={e.body} />
            <Block title="Response" code={e.response} />
          </div>
        </GlassPanel>
      ))}

      <GlassPanel className="p-6">
        <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--aegis-text)' }}>
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--aegis-primary)' }} />
          Risk scoring reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--tone-emerald-bg)', border: '1px solid var(--tone-emerald-border)' }}>
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--tone-emerald)' }}>SAFE (0.0 – 0.59)</div>
            <p className="text-[10px] text-aegis-muted">Request passes through immediately. No human review needed.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--tone-amber-bg)', border: '1px solid var(--tone-amber-border)' }}>
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--tone-amber)' }}>FLAGGED (0.6 – 0.99)</div>
            <p className="text-[10px] text-aegis-muted">Logged to audit trail. Request allowed but under observation.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--tone-rose-bg)', border: '1px solid var(--tone-rose-border)' }}>
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--tone-rose)' }}>BLOCKED (1.0)</div>
            <p className="text-[10px] text-aegis-muted">Request is held. Requires human SecOps approval via /resolve.</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function Block({ title, code }: { title: string; code: string }) {
  return (
    <div className="p-5" style={{ background: 'var(--aegis-bg)' }}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-aegis-muted">{title}</div>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-aegis p-3 font-mono text-[12px] leading-relaxed text-aegis-secondary whitespace-pre-wrap break-words" style={{ background: 'var(--aegis-code-bg)' }}>
        {code}
      </pre>
    </div>
  );
}
