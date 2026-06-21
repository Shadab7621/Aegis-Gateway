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

export function TrafficRow({
  call, onHoneypot, isHoneypot = false,
}: { call: ToolCall; onHoneypot?: (c: ToolCall) => void; isHoneypot?: boolean }) {
  // Real schema only has COMPLETED | FLAGGED | BLOCKED
  const tone =
    call.status === 'BLOCKED' ? 'rose'
    : call.status === 'FLAGGED' ? 'amber'
    : 'emerald';

  const riskColor =
    call.risk_score > 0.7 ? '#FF4D6A'
    : call.risk_score > 0.4 ? '#FFB347'
    : '#34D399';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group grid grid-cols-[88px_140px_1fr_120px_90px_36px] items-center gap-4 border-b border-white/5 px-4 py-3 text-sm hover:bg-white/[0.03]"
    >
      <div className="font-mono text-xs text-white/40">{fmt(call.created_at)}</div>
      <div className="font-mono text-xs text-white/80 truncate">{call.agent_id}</div>
      <div className="truncate text-white/70">
        <span className="mr-2 text-[10px] uppercase tracking-wider text-white/40">{(call.request_payload?.action as string) ?? '—'}</span>
        <span className="font-mono text-[12px]">{previewOf(call)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${call.risk_score * 100}%`, background: riskColor, boxShadow: `0 0 12px ${riskColor}` }} />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-white/60">{(call.risk_score * 100).toFixed(0)}</span>
      </div>
      <div className="justify-self-end"><Pill tone={tone}>{call.status}</Pill></div>
      <button
        onClick={() => onHoneypot?.(call)}
        title={isHoneypot ? 'Honeypot active' : 'Send to honeypot'}
        className={`justify-self-end rounded-md border p-1.5 transition text-sm leading-none ${isHoneypot ? 'border-[#FF4D6A]/40 bg-[#FF4D6A]/15 text-[#FF4D6A]' : 'border-white/10 text-white/30 opacity-0 group-hover:opacity-100 hover:border-[#FFB347]/40 hover:text-[#FFB347]'}`}
        aria-label="Honeypot"
      >
        🍯
      </button>
    </motion.div>
  );
}
