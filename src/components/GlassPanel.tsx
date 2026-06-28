'use client';

import type { ReactNode, HTMLAttributes } from 'react';

export function GlassPanel({
  children,
  className = '',
  strong = false,
  ...rest
}: { children: ReactNode; strong?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Pill — semantic status badge, theme-aware via CSS custom properties.
 * Colors reference --tone-{name} / --tone-{name}-bg / --tone-{name}-border
 * defined in globals.css, which switch automatically between dark and light.
 */
export function Pill({
  children, tone = 'cyan', className = '',
}: { children: ReactNode; tone?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'muted'; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${className}`}
      style={{
        backgroundColor: `var(--tone-${tone}-bg)`,
        color: `var(--tone-${tone})`,
        borderColor: `var(--tone-${tone}-border)`,
      }}
    >
      {children}
    </span>
  );
}
