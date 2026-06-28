'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSupabase } from '@/lib/supabaseContext';
import { useTheme } from '@/lib/themeContext';
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

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'command', label: 'Command', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
  { key: 'playground', label: 'Playground', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg> },
  { key: 'analytics', label: 'Analytics', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
  { key: 'docs', label: 'API', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
];

export function Dashboard({ onBack }: { onBack: () => void }) {
  const { toolCalls, approvalRequests, resolveRequest } = useSupabase();
  const { toggleTheme } = useTheme();
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
    <div className="min-h-screen" style={{ color: 'var(--aegis-text)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl" style={{ backgroundColor: 'var(--aegis-header-bg)', borderBottom: '1px solid var(--aegis-header-border)' }}>
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition" style={{ color: 'var(--aegis-text-muted)' }}>
            ← Back
          </button>
          <div className="ml-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'var(--aegis-gradient-primary)' }}>
              <span className="font-display text-xs font-bold" style={{ color: 'var(--aegis-logo-text)' }}>Æ</span>
            </div>
            <div className="font-display text-base font-semibold tracking-wide" style={{ color: 'var(--aegis-text)' }}>AEGIS<span style={{ color: 'var(--aegis-text-dim)' }}> · ops center</span></div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <g className="theme-icon-dark">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </g>
                <g className="theme-icon-light">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </g>
              </svg>
            </button>
            <Pill tone="emerald"><span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--tone-emerald)' }} />live</Pill>
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
                className="relative flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition"
                style={{ color: active ? 'var(--aegis-text)' : 'var(--aegis-text-muted)' }}
              >
                <span>{t.icon}</span>
                {t.label}
                {active && (
                  <motion.div layoutId="tab-underline"
                    className="absolute inset-x-3 -bottom-px h-[2px] rounded-full"
                    style={{ background: 'var(--aegis-tab-underline)' }}
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
                <StatCard label="Requests" value={stats.total}            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>} accent="cyan"    sub="rolling window" />
                <StatCard label="Blocked"  value={stats.blocked}          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>} accent="rose"    sub="hard policy hits" delay={0.05} />
                <StatCard label="Awaiting" value={stats.held}             icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} accent="amber"   sub="human in the loop" delay={0.1} />
                <StatCard label="Avg risk" value={`${(stats.avgRisk * 100).toFixed(0)}`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>} accent="violet" sub="0–100 score" delay={0.15} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                <GlassPanel className="overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--aegis-border)' }}>
                    <div>
                      <h3 className="font-display text-base font-semibold" style={{ color: 'var(--aegis-text)' }}>Live traffic</h3>
                      <p className="text-[11px]" style={{ color: 'var(--aegis-text-muted)' }}>streaming via /rpc</p>
                    </div>
                    <Pill tone="cyan"><span className="h-1.5 w-1.5 rounded-full bg-[#3ECFCF] animate-pulse" />realtime</Pill>
                  </div>
                  <div className="grid grid-cols-[88px_140px_1fr_120px_90px_36px] gap-4 px-4 py-2 text-[10px] uppercase tracking-[0.16em]" style={{ borderBottom: '1px solid var(--aegis-border)', color: 'var(--aegis-text-dim)' }}>
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
                        <div className="mb-3 flex justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, color: 'var(--aegis-text-dim)' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--aegis-text-dim)' }}>Waiting for traffic...</p>
                      </div>
                    )}
                  </div>
                </GlassPanel>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold" style={{ color: 'var(--aegis-text)' }}>Approval queue</h3>
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
                      <GlassPanel className="p-6 text-center text-sm" style={{ color: 'var(--aegis-text-muted)' }}>
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
