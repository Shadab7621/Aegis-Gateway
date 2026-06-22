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
        <h3 className="font-display text-lg font-semibold" style={{ color: '#F0F0FA' }}>Drop-in proxy</h3>
        <p className="mt-1 text-sm text-white/60">
          Point your agent runtime at{' '}
          <code className="font-mono text-[#3ECFCF] break-all">{PROXY_URL}/rpc</code>{' '}
          instead of executing tool calls directly. Zero SDK changes. Every call is logged, scored, and policy-gated.
        </p>
      </GlassPanel>

      <GlassPanel className="p-4 border-l-2 border-[#FFB347]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-[#FFB347] tracking-widest">⚡ RATE LIMITING</span>
        </div>
        <p className="text-xs text-white/40">10 requests per minute per agent_id, sliding window. Exceeding returns HTTP 429.</p>
      </GlassPanel>

      {ENDPOINTS.map(e => (
        <GlassPanel key={e.path} className="overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
            <Pill tone={e.method === 'POST' ? 'violet' : 'cyan'}>{e.method}</Pill>
            <code className="font-mono text-base" style={{ color: '#F0F0FA' }}>{PROXY_URL}{e.path}</code>
            <span className="ml-auto text-xs text-white/40 hidden sm:block">{e.desc}</span>
          </div>
          <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2">
            <Block title="Request" code={e.body} />
            <Block title="Response" code={e.response} />
          </div>
        </GlassPanel>
      ))}

      <GlassPanel className="p-6">
        <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#F0F0FA' }}>
          <span className="h-2 w-2 rounded-full bg-[#7B6EFF]" />
          Risk scoring reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-[#34D399]/5 border border-[#34D399]/20">
            <div className="text-xs font-bold text-[#34D399] mb-1">SAFE (0.0 – 0.59)</div>
            <p className="text-[10px] text-white/40">Request passes through immediately. No human review needed.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FFB347]/5 border border-[#FFB347]/20">
            <div className="text-xs font-bold text-[#FFB347] mb-1">FLAGGED (0.6 – 0.99)</div>
            <p className="text-[10px] text-white/40">Logged to audit trail. Request allowed but under observation.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FF4D6A]/5 border border-[#FF4D6A]/20">
            <div className="text-xs font-bold text-[#FF4D6A] mb-1">BLOCKED (1.0)</div>
            <p className="text-[10px] text-white/40">Request is held. Requires human SecOps approval via /resolve.</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function Block({ title, code }: { title: string; code: string }) {
  return (
    <div className="bg-black/60 p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{title}</div>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[12px] leading-relaxed text-white/85 whitespace-pre-wrap break-words">
        {code}
      </pre>
    </div>
  );
}
