'use client';

import { motion } from 'framer-motion';
import { Pill } from './GlassPanel';

type ToolCall = {
  id: string;
  created_at: string;
  agent_id: string;
  request_payload: any;
  risk_score: number;
  status: string;
};

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function previewOf(c: ToolCall): string {
  const p = c.request_payload ?? {};
  return (p.command as string) ?? (p.msg as string) ?? JSON.stringify(p).slice(0, 80);
}

/* Honeypot SVG icon (replaces 🍯 emoji) */
function HoneypotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v4a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1a2 2 0 0 0-2-2h-2a2 2 0 0 1-2-2V2" />
      <path d="M8.5 2h7" />
      <path d="M7 15v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

export function TrafficRow({
  call, onHoneypot, isHoneypot = false,
}: { call: ToolCall; onHoneypot?: (c: ToolCall) => void; isHoneypot?: boolean }) {
  // Real schema only has COMPLETED | FLAGGED | BLOCKED
  const tone =
    call.status === 'BLOCKED' ? 'rose'
    : call.status === 'FLAGGED' ? 'amber'
    : 'emerald';

  const riskVar =
    call.risk_score > 0.7 ? 'var(--risk-high)'
    : call.risk_score > 0.4 ? 'var(--risk-mid)'
    : 'var(--risk-low)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group grid grid-cols-[88px_140px_1fr_120px_90px_36px] items-center gap-4 px-4 py-3 text-sm"
      style={{
        borderBottom: '1px solid var(--aegis-border)',
      }}
      whileHover={{ backgroundColor: 'var(--aegis-row-hover)' }}
    >
      <div className="font-mono text-xs" style={{ color: 'var(--aegis-text-muted)' }}>{fmt(call.created_at)}</div>
      <div className="font-mono text-xs truncate" style={{ color: 'var(--aegis-text-secondary)' }}>{call.agent_id}</div>
      <div className="truncate">
        <span className="mr-2 text-[10px] uppercase tracking-wider" style={{ color: 'var(--aegis-text-muted)' }}>{(call.request_payload?.action as string) ?? '—'}</span>
        <span className="font-mono text-[12px]" style={{ color: 'var(--aegis-text-secondary)' }}>{previewOf(call)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'var(--risk-bar-track)' }}>
          <div className="h-full rounded-full" style={{ width: `${call.risk_score * 100}%`, background: riskVar, boxShadow: `0 0 12px ${riskVar}` }} />
        </div>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--aegis-text-muted)' }}>{(call.risk_score * 100).toFixed(0)}</span>
      </div>
      <div className="justify-self-end"><Pill tone={tone}>{call.status}</Pill></div>
      <button
        onClick={() => onHoneypot?.(call)}
        title={isHoneypot ? 'Honeypot active' : 'Send to honeypot'}
        className={`justify-self-end rounded-md border p-1.5 transition text-sm leading-none ${isHoneypot ? '' : 'opacity-0 group-hover:opacity-100'}`}
        style={isHoneypot
          ? { borderColor: 'var(--tone-rose-border)', background: 'var(--tone-rose-bg)', color: 'var(--tone-rose)' }
          : { borderColor: 'var(--aegis-border)', color: 'var(--aegis-text-muted)' }
        }
        aria-label="Honeypot"
      >
        <HoneypotIcon />
      </button>
    </motion.div>
  );
}
