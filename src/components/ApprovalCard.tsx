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
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FFB347]/30 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFB347]/15 text-[#FFB347] border border-[#FFB347]/30 text-base">
            ⚠️
          </div>
          <div>
            <Pill tone="amber">Awaiting review</Pill>
            <div className="mt-2 font-display text-lg font-semibold text-white">
              {request.holding_reason}
            </div>
            <div className="mt-1 font-mono text-[11px] text-white/40">
              agent: {toolCall?.agent_id ?? '—'} · risk {(riskScore * 100).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Payload</div>
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] text-white/80">{cmd}</pre>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => resolveRequest(request.tool_call_id, 'approved')}
          className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-2 text-sm font-semibold text-[#34D399] transition hover:bg-[#34D399]/20"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => resolveRequest(request.tool_call_id, 'denied')}
          className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#FF4D6A]/30 bg-[#FF4D6A]/10 px-4 py-2 text-sm font-semibold text-[#FF4D6A] transition hover:bg-[#FF4D6A]/20"
        >
          ✕ Deny
        </button>
      </div>
    </motion.div>
  );
}
