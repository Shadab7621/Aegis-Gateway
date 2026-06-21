'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const ACCENT_HEX: Record<string, string> = {
  cyan: '#3ECFCF',
  violet: '#7B6EFF',
  emerald: '#34D399',
  rose: '#FF4D6A',
  amber: '#FFB347',
};

export function StatCard({
  label, value, icon, accent = 'cyan', delay = 0, sub,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber';
  delay?: number;
  sub?: string;
}) {
  const color = ACCENT_HEX[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-40"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-semibold text-white tabular-nums">
            {value}
          </div>
          {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-xl border text-lg"
          style={{ color, borderColor: `${color}40`, background: `${color}1F` }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
