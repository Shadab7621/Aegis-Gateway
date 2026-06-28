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

type ApprovalRequest = {
  id: string;
  tool_call_id: string;
  created_at: string;
  holding_reason: string;
  risk_score: number;
  status: string;
};

/* Warning SVG icon (replaces ⚠️ emoji) */
function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* Check SVG icon */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* X SVG icon */
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function ApprovalCard({
  request, toolCall, index, resolveRequest,
}: {
  request: ApprovalRequest;
  toolCall?: ToolCall;
  index: number;
  resolveRequest: (toolCallId: string, resolution: 'approved' | 'denied') => Promise<void>;
}) {
  const payload = toolCall?.request_payload ?? {};
  const cmd = (payload.command as string) ?? (payload.msg as string) ?? '—';
  const riskScore = toolCall?.risk_score ?? request.risk_score ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04 }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
        style={{ background: 'var(--tone-amber)', opacity: 0.3 }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl border text-base"
            style={{
              background: 'var(--tone-amber-bg)',
              color: 'var(--tone-amber)',
              borderColor: 'var(--tone-amber-border)',
            }}
          >
            <WarningIcon />
          </div>
          <div>
            <Pill tone="amber">Awaiting review</Pill>
            <div
              className="mt-2 font-display text-lg font-semibold"
              style={{ color: 'var(--aegis-text)' }}
            >
              {request.holding_reason}
            </div>
            <div
              className="mt-1 font-mono text-[11px]"
              style={{ color: 'var(--aegis-text-muted)' }}
            >
              agent: {toolCall?.agent_id ?? '—'} · risk {(riskScore * 100).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-4 rounded-xl border p-3"
        style={{
          background: 'var(--aegis-code-bg)',
          borderColor: 'var(--aegis-code-border)',
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--aegis-text-muted)' }}
        >
          Payload
        </div>
        <pre
          className="mt-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px]"
          style={{ color: 'var(--aegis-text-secondary)' }}
        >
          {cmd}
        </pre>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => resolveRequest(request.tool_call_id, 'approved')}
          className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition"
          style={{
            borderColor: 'var(--tone-emerald-border)',
            background: 'var(--tone-emerald-bg)',
            color: 'var(--tone-emerald)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--tone-emerald-border)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--tone-emerald-bg)';
          }}
        >
          <CheckIcon /> Approve
        </button>
        <button
          onClick={() => resolveRequest(request.tool_call_id, 'denied')}
          className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition"
          style={{
            borderColor: 'var(--tone-rose-border)',
            background: 'var(--tone-rose-bg)',
            color: 'var(--tone-rose)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--tone-rose-border)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--tone-rose-bg)';
          }}
        >
          <XIcon /> Deny
        </button>
      </div>
    </motion.div>
  );
}
