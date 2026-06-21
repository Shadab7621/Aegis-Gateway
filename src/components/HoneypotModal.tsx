'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Pill } from './GlassPanel';

type ToolCall = {
  id: string;
  created_at: string;
  agent_id: string;
  request_payload: any;
  risk_score: number;
  status: string;
};

type TabKey = 'attacker' | 'real' | 'diff';

function buildDecoy(real: Record<string, unknown>): Record<string, unknown> {
  return {
    ...real,
    path: (real as any).path ? '/var/www/html/public/index.html' : undefined,
    command: (real as any).command ? 'ls /var/www/html' : undefined,
    msg: (real as any).msg ? 'Hello! How can I assist you today?' : undefined,
    status: 'success',
    result: 'Operation completed successfully',
    data: {
      files: ['index.html', 'styles.css', 'app.js'],
      permissions: 'rwxr-xr-x',
      owner: 'www-data',
    },
  };
}

export function HoneypotModal({
  call, onClose, onConfirm,
}: { call: ToolCall; onClose: () => void; onConfirm: () => void }) {
  const [tab, setTab] = useState<TabKey>('attacker');
  const real = (call.request_payload ?? {}) as Record<string, unknown>;
  const decoy = buildDecoy(real);
  const allKeys = Array.from(new Set([...Object.keys(real), ...Object.keys(decoy)]));

  const TABS: { key: TabKey; label: string; icon: string; tone: 'rose' | 'cyan' | 'amber' }[] = [
    { key: 'attacker', label: 'Attacker view', icon: '👁️', tone: 'rose' },
    { key: 'real',     label: 'Real data',     icon: '🔒', tone: 'cyan' },
    { key: 'diff',     label: 'Difference',    icon: '⚡', tone: 'amber' },
  ];

  const node = (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(6,6,15,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        // FIX: the modal previously had no height cap and no internal scroll region, so on
        // tall content (Attacker View / Difference tabs) it overflowed past the viewport with
        // no way to reach the rest. Now it's capped at 90vh and only the body scrolls — header,
        // tabs, and footer stay fixed in place.
        className="glass-strong w-full max-w-4xl rounded-2xl text-white flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — fixed */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold tracking-wide" style={{ color: '#F0F0FA', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
              Honeypot intelligence
            </h2>
            <p className="mt-1 font-mono text-[11px] text-white/40 truncate">
              {call.agent_id} · {call.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white text-sm shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs — fixed */}
        <div className="flex border-b border-white/10 shrink-0">
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex-1 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${active ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{t.icon}</span>
                  {t.label}
                </span>
                {active && (
                  <motion.div layoutId="honeypotTab"
                    className="absolute inset-x-4 -bottom-px h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #3ECFCF, #7B6EFF)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Body — scrollable, this is the part that was overflowing before */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {tab === 'attacker' && (
              <motion.div key="a" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
                <p className="text-xs text-white/50">
                  Decoy response the attacker will receive — designed to waste their time and gather intelligence.
                </p>
                <CodeBlock tone="rose" label="Decoy response · attacker sees this" json={decoy} />
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Deception"  value="HIGH"    tone="rose" />
                  <Stat label="Intel"      value="ACTIVE"  tone="amber" />
                  <Stat label="Attacker"   value="TRAPPED" tone="emerald" />
                </div>
              </motion.div>
            )}

            {tab === 'real' && (
              <motion.div key="r" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
                <p className="text-xs text-white/50">
                  Actual intercepted payload — what the attacker really sent.
                </p>
                <CodeBlock tone="cyan" label="Real payload · classified" json={real} />
                {(real as any).threat_reason && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/40">Threat breakdown</div>
                    {String((real as any).threat_reason).split(' + ').map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D6A] shrink-0" />
                        <span className="break-words">{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'diff' && (
              <motion.div key="d" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                <p className="mb-4 text-xs text-white/50">
                  Side-by-side comparison of real payload vs decoy.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DiffCol tone="cyan" label="Real" keys={allKeys} a={real} b={decoy} side="a" />
                  <DiffCol tone="rose" label="Attacker sees" keys={allKeys} a={real} b={decoy} side="b" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded border border-[#FFB347]/40 bg-[#FFB347]/20 shrink-0" />
                    differs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded bg-white/5 shrink-0" />
                    identical
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — fixed */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-5 py-4 shrink-0">
          <p className="font-mono text-[10px] text-white/30">
            Honeypot active · attacker traffic will be redirected to decoy
          </p>
          <div className="flex gap-2 shrink-0">
            <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:bg-white/5">
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#06060F] whitespace-nowrap"
              style={{ background: 'linear-gradient(90deg, #FF4D6A, #FFB347)', boxShadow: '0 0 24px rgba(255,77,106,0.4)' }}
            >
              🍯 Activate honeypot
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

function CodeBlock({ tone, label, json }: { tone: 'rose' | 'cyan'; label: string; json: unknown }) {
  const color = tone === 'rose' ? '#FF4D6A' : '#3ECFCF';
  return (
    <div className="overflow-hidden rounded-xl border bg-black/40" style={{ borderColor: `${color}40` }}>
      <div className="flex items-center gap-2 border-b px-4 py-2" style={{ borderColor: `${color}33`, background: `${color}0F` }}>
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] truncate" style={{ color }}>{label}</span>
      </div>
      <pre className="overflow-x-auto max-h-64 overflow-y-auto custom-scrollbar p-4 font-mono text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap break-words">
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'rose' | 'amber' | 'emerald' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1"><Pill tone={tone}>{value}</Pill></div>
    </div>
  );
}

function DiffCol({
  tone, label, keys, a, b, side,
}: {
  tone: 'cyan' | 'rose'; label: string; keys: string[];
  a: Record<string, unknown>; b: Record<string, unknown>; side: 'a' | 'b';
}) {
  const color = tone === 'rose' ? '#FF4D6A' : '#3ECFCF';
  const src = side === 'a' ? a : b;
  return (
    <div className="overflow-hidden rounded-xl border bg-black/40" style={{ borderColor: `${color}40` }}>
      <div className="border-b px-4 py-2" style={{ borderColor: `${color}33`, background: `${color}0F` }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color }}>{label}</span>
      </div>
      <div className="space-y-1.5 p-3 max-h-64 overflow-y-auto custom-scrollbar">
        {keys.filter(k => src[k] !== undefined).map(k => {
          const differs = JSON.stringify(a[k]) !== JSON.stringify(b[k]);
          return (
            <div key={k} className={`rounded p-2 font-mono text-[11px] break-words ${differs ? 'border border-[#FFB347]/30 bg-[#FFB347]/10' : 'bg-white/[0.02]'}`}>
              <span className="text-white/40">{k}: </span>
              <span style={{ color }}>{JSON.stringify(src[k])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
