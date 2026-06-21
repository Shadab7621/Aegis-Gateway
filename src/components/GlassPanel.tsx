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

export function Pill({
  children, tone = 'cyan', className = '',
}: { children: ReactNode; tone?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'muted'; className?: string }) {
  const map = {
    cyan:    'bg-[#3ECFCF]/15 text-[#3ECFCF] border-[#3ECFCF]/30',
    violet:  'bg-[#7B6EFF]/15 text-[#7B6EFF] border-[#7B6EFF]/30',
    emerald: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
    amber:   'bg-[#FFB347]/15 text-[#FFB347] border-[#FFB347]/30',
    rose:    'bg-[#FF4D6A]/15 text-[#FF4D6A] border-[#FF4D6A]/30',
    muted:   'bg-white/5 text-white/60 border-white/10',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${map[tone]} ${className}`}>
      {children}
    </span>
  );
}
