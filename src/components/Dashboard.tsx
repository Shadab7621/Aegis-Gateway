'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSupabase } from '@/lib/supabaseContext';
import { StatCard } from './StatCard';
import { TrafficRow } from './TrafficRow';
import { ApprovalCard } from './ApprovalCard';
import { AnalyticsView } from './AnalyticsView';
import { Playground } from './Playground';
import { ApiDocs } from './ApiDocs';
import { GlassPanel, Pill } from './GlassPanel';
import { HoneypotModal } from './HoneypotModal';

type ToolCall = {
  id: string;
  created_at: string;
  agent_id: string;
  request_payload: any;
  risk_score: number;
  status: string;
};

type TabKey = 'command' | 'playground' | 'analytics' | 'docs';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'command',    label: 'Command',    icon: '📡' },
  { key: 'playground', label: 'Playground', icon: '🎯' },
  { key: 'analytics',  label: 'Analytics',  icon: '📊' },
  { key: 'docs',       label: 'API',        icon: '📖' },
];

export function Dashboard({ onBack }: { onBack: () => void }) {
  const { toolCalls, approvalRequests, resolveRequest } = useSupabase();
  const [tab, setTab] = useState<TabKey>('command');
  const [honeypotCall, setHoneypotCall] = useState<ToolCall | null>(null);
  const [honeypotIds, setHoneypotIds] = useState<Set<string>>(new Set());

  const confirmHoneypot = useCallback((id: string) => {
    setHoneypotIds(prev => new Set(prev).add(id));
  }, []);

  // Real schema: status is COMPLETED | FLAGGED | BLOCKED.
  // "Awaiting review" is driven by approval_requests.status === 'AWAITING_REVIEW',
  // not by a tool_calls status value (there is no HOLDING/PENDING in the real schema).
  const pendingApprovals = useMemo(
    () => approvalRequests.filter(a => a.status === 'AWAITING_REVIEW'),
    [approvalRequests]
  );

  const stats = useMemo(() => {
    const total = toolCalls.length;
    const blocked = toolCalls.filter(c => c.status === 'BLOCKED').length;
    const held = pendingApprovals.length;
    const avgRisk = total === 0 ? 0 : toolCalls.reduce((s, c) => s + (c.risk_score ?? 0), 0) / total;
    return { total, blocked, held, avgRisk };
  }, [toolCalls, pendingApprovals]);

  return (
    <div className="min-h-screen text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: 'rgba(6,6,15,0.92)' }}>
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition">
            ← Back
          </button>
          <div className="ml-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'linear-gradient(135deg, #3ECFCF, #7B6EFF)' }}>
              <span className="font-display text-xs font-bold text-[#06060F]">Æ</span>
            </div>
            <div className="font-display text-base font-semibold tracking-wide" style={{ color: '#F0F0FA', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>AEGIS<span className="text-white/30"> · ops center</span></div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Pill tone="emerald"><span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />live</Pill>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-[1400px] items-center gap-1 px-6">
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${active ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                <span>{t.icon}</span>
                {t.label}
                {active && (
                  <motion.div layoutId="tab-underline"
                    className="absolute inset-x-3 -bottom-px h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #3ECFCF, #7B6EFF)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <AnimatePresence mode="wait">
          {tab === 'command' && (
            <motion.div key="command" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Requests" value={stats.total}            icon="📈" accent="cyan"    sub="rolling window" />
                <StatCard label="Blocked"  value={stats.blocked}          icon="🎯" accent="rose"    sub="hard policy hits" delay={0.05} />
                <StatCard label="Awaiting" value={stats.held}             icon="📡" accent="amber"   sub="human in the loop" delay={0.1} />
                <StatCard label="Avg risk" value={`${(stats.avgRisk * 100).toFixed(0)}`} icon="📊" accent="violet" sub="0–100 score" delay={0.15} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                <GlassPanel className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                    <div>
                      <h3 className="font-display text-base font-semibold" style={{ color: '#F0F0FA' }}>Live traffic</h3>
                      <p className="text-[11px] text-white/40">streaming via /rpc</p>
                    </div>
                    <Pill tone="cyan"><span className="h-1.5 w-1.5 rounded-full bg-[#3ECFCF] animate-pulse" />realtime</Pill>
                  </div>
                  <div className="grid grid-cols-[88px_140px_1fr_120px_90px_36px] gap-4 border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
                    <div>time</div><div>agent</div><div>request</div><div>risk</div><div className="justify-self-end">status</div><div className="justify-self-end">trap</div>
                  </div>
                  <div className="max-h-[520px] overflow-y-auto custom-scrollbar">
                    {toolCalls.map(c => (
                      <TrafficRow
                        key={c.id}
                        call={c}
                        isHoneypot={honeypotIds.has(c.id)}
                        onHoneypot={setHoneypotCall}
                      />
                    ))}
                    {toolCalls.length === 0 && (
                      <div className="text-center py-16">
                        <div className="text-3xl mb-3 opacity-20">📡</div>
                        <p className="text-sm text-white/20">Waiting for traffic...</p>
                      </div>
                    )}
                  </div>
                </GlassPanel>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold" style={{ color: '#F0F0FA' }}>Approval queue</h3>
                    <Pill tone="amber">{pendingApprovals.length} pending</Pill>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                    <AnimatePresence>
                      {pendingApprovals.map((a, i) => (
                        <ApprovalCard
                          key={a.id}
                          request={a}
                          toolCall={toolCalls.find(c => c.id === a.tool_call_id)}
                          index={i}
                          resolveRequest={resolveRequest}
                        />
                      ))}
                    </AnimatePresence>
                    {pendingApprovals.length === 0 && (
                      <GlassPanel className="p-6 text-center text-sm text-white/40">
                        Queue is empty. Aegis is handling traffic autonomously.
                      </GlassPanel>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'playground' && (
            <motion.div key="playground" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Playground />
            </motion.div>
          )}

          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnalyticsView toolCalls={toolCalls} approvalRequests={approvalRequests} />
            </motion.div>
          )}

          {tab === 'docs' && (
            <motion.div key="docs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ApiDocs />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {honeypotCall && (
          <HoneypotModal
            call={honeypotCall}
            onClose={() => setHoneypotCall(null)}
            onConfirm={() => confirmHoneypot(honeypotCall.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
