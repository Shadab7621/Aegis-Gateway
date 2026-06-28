'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GlassPanel, Pill } from './GlassPanel';
import { useTheme } from '@/lib/themeContext';

const ShieldScene = dynamic(() => import('./ShieldScene'), { ssr: false });

const THREATS = [
  'PROMPT INJECTION', 'DATA EXFILTRATION', 'SHELL INJECTION', 'JAILBREAK',
  'CREDENTIAL LEAK', 'SSRF', 'DESTRUCTIVE CMD', 'TOOL ABUSE', 'RECON ATTEMPT',
];

const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconScan = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9v-1M12 16v1M9 12H8M16 12h1" />
  </svg>
);

const IconCpu = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
);

const IconScales = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" />
    <path d="M4 7l8-4 8 4" />
    <path d="M4 7l-1 7a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4l-1-7" />
    <path d="M16 7l-1 7a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4l-1-7" />
  </svg>
);

const IconTrap = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v4a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1a2 2 0 0 0-2-2h-2a2 2 0 0 1-2-2V2" />
    <path d="M8.5 2h7" />
    <path d="M7 15v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5" />
  </svg>
);

const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 12h6M9 16h6" />
  </svg>
);

const IconBrain = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
    <path d="M9 21h6M10 17v4M14 17v4" />
  </svg>
);

const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconSeal = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const IconBolt = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);


const FEATURES: { icon: React.ReactNode; title: string; description: string; accent: string }[] = [
  {
    icon: <IconShield />,
    title: 'Zero-Trust Proxy',
    description: 'Every AI agent tool call hits our HTTP proxy first. Nothing executes until it passes a multi-layer security gauntlet — no exceptions.',
    accent: 'var(--aegis-secondary)',
  },
  {
    icon: <IconScan />,
    title: 'Heuristic Threat Matrix',
    description: '20+ regex patterns catch path traversal (../../etc/passwd), command chaining (&&, |, ;), prompt injection, and recon attempts before any AI sees them.',
    accent: 'var(--aegis-primary)',
  },
  {
    icon: <IconCpu />,
    title: 'Dual AI Verification',
    description: 'Groq (llama-3.1-8b) runs first for speed. If unavailable, Gemini 2.0 Flash takes over. Both return a structured safe/unsafe verdict with reason.',
    accent: 'var(--aegis-warning)',
  },
  {
    icon: <IconScales />,
    title: 'Graduated Risk Engine',
    description: 'Every payload gets a 0.0–1.0 risk score. Safe (<0.6) passes instantly. Flagged (0.6–0.99) gets logged. Blocked (1.0) is held for human approval.',
    accent: 'var(--aegis-success)',
  },
  {
    icon: <IconTrap />,
    title: 'Honeypot Deception Layer',
    description: 'Enable per-request honeypot mode to feed attackers convincing fake responses. View exactly what they see vs what really happened in the 3-tab intel modal.',
    accent: 'var(--aegis-danger)',
  },
  {
    icon: <IconClipboard />,
    title: 'Immutable Audit Trail',
    description: 'Every decision — pass, flag, block, approve, deny — is SHA-256 signed and written to PostgreSQL via Supabase with cryptographic tamper detection.',
    accent: 'var(--aegis-secondary)',
  },
];

const PIPELINE_STEPS: { step: string; title: string; description: string; icon: React.ReactNode }[] = [
  { step: '01', title: 'Agent Fires a Tool Call', description: 'An AI agent sends a JSON-RPC POST to /rpc. The payload can contain any action: execute, read, write, chat, or list.', icon: <IconCpu /> },
  { step: '02', title: 'Heuristic Filter Runs First', description: 'The proxy decodes the payload (including URL-encoding and Base64), then tests it against 20+ threat patterns in microseconds.', icon: <IconScan /> },
  { step: '03', title: 'AI Layer Validates', description: 'If the heuristic score is below 1.0, Groq or Gemini analyses the full payload for semantic threats regex alone cannot catch.', icon: <IconBrain /> },
  { step: '04', title: 'Risk Gate Decision', description: 'Score <0.6: passes instantly. Score 0.6–0.99: logged to audit trail, allowed. Score 1.0: frozen in a circular buffer.', icon: <IconScales /> },
  { step: '05', title: 'SecOps Human Review', description: "Blocked requests appear in the Command Center's approval queue in real-time. Operators approve or deny.", icon: <IconUser /> },
  { step: '06', title: 'Audit Log Sealed', description: 'Every decision is SHA-256 signed and written to the audit_logs table — the signature makes the log tamper-evident.', icon: <IconSeal /> },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const staggerContainer: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-x-hidden scroll-smooth font-sans relative" style={{ backgroundColor: 'var(--aegis-bg)', color: 'var(--aegis-text)' }}>
      {/* Fixed glass header */}
      <GlassPanel className="fixed top-0 left-0 right-0 z-50" style={{ borderRadius: 0, borderBottom: '1px solid var(--aegis-header-border)' }}>
        <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'var(--aegis-gradient-primary)' }}>
              <span className="font-display text-xs font-bold" style={{ color: 'var(--aegis-logo-text)' }}>Æ</span>
            </div>
            <span className="font-display text-base font-semibold tracking-wide" style={{ color: 'var(--aegis-text)' }}>
              AEGIS<span style={{ color: 'var(--aegis-text-dim)' }}> GATEWAY</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm font-semibold transition" style={{ color: 'var(--aegis-text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--aegis-text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--aegis-text-muted)'}>Pricing</a>
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
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: 'var(--aegis-border)',
                background: 'var(--aegis-surface)',
                color: 'var(--aegis-text)',
              }}
            >
              Open Dashboard →
            </motion.button>
          </div>
        </nav>
      </GlassPanel>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero-gradient relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <Suspense fallback={null}>
          <ShieldScene />
        </Suspense>

        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Pill tone="cyan"><IconBolt /> Zero-Trust AI Proxy</Pill>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
            >
              Every AI Tool Call.<br />
              <span className="text-gradient">Intercepted.</span><br />
              Secured.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-6 max-w-xl text-base md:text-lg"
              style={{ color: 'var(--aegis-text-secondary)' }}
            >
              Aegis sits between your AI agents and the world. Every request passes
              through multi-layer threat analysis before anything executes — zero trust,
              zero compromise.
            </motion.p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                style={{
                  background: 'var(--aegis-gradient-cta)',
                  color: '#FFFFFF',
                  boxShadow: '0 12px 40px -12px var(--aegis-gradient-cta-shadow)',
                }}
              >
                Enter Command Center →
              </motion.button>
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold backdrop-blur transition"
                style={{
                  borderColor: 'var(--aegis-border)',
                  background: 'var(--aegis-surface)',
                  color: 'var(--aegis-text-secondary)',
                }}
              >
                View Architecture
              </a>
            </div>

            <div
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-wider font-mono"
              style={{ color: 'var(--aegis-text-dim)' }}
            >
              <span>20+ Threat Patterns</span>
              <span className="opacity-40">·</span>
              <span>Dual AI Verification</span>
              <span className="opacity-40">·</span>
              <span>Human-in-the-Loop</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <GlassPanel className="p-5 relative">
              <div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold" style={{ borderColor: 'var(--tone-emerald-border)', backgroundColor: 'var(--tone-emerald-bg)', color: 'var(--tone-emerald)' }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--tone-emerald)' }} /> LIVE
              </div>
              <div className="font-mono text-xs space-y-2">
                <div style={{ color: 'var(--aegis-text-dim)' }}>$ aegis intercept --watch</div>
                <div style={{ color: 'var(--aegis-danger)' }}>[BLOCKED] Command injection detected</div>
                <div style={{ color: 'var(--aegis-warning)' }}>[FLAGGED] Path traversal attempt</div>
                <div style={{ color: 'var(--aegis-success)' }}>[SAFE] Read request cleared</div>
                <div style={{ color: 'var(--aegis-danger)' }}>[BLOCKED] Prompt injection found</div>
                <div className="mt-3" style={{ color: 'var(--aegis-text-dim)' }}>— Aegis Gateway: All threats intercepted.</div>
              </div>
            </GlassPanel>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--aegis-text-dim)' }}>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border flex items-start justify-center p-1"
            style={{ borderColor: 'var(--aegis-border)' }}
          >
            <div className="w-1 h-2 rounded-full" style={{ background: 'var(--aegis-secondary)', opacity: 0.6 }} />
          </motion.div>
        </motion.div>

        {/* Bottom fade transition to body background */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--aegis-bg))'
          }}
        />
      </section>

      {/* ═══════════════ THREAT MARQUEE ═══════════════ */}
      <div className="relative z-10 border-y py-4 overflow-hidden my-4" style={{ borderColor: 'var(--aegis-border)', background: 'var(--aegis-surface)' }}>
        <div className="flex whitespace-nowrap gap-12 font-display text-sm font-semibold tracking-[0.3em]" style={{ color: 'var(--aegis-text-dim)', animation: 'marquee 30s linear infinite' }}>
          {[...THREATS, ...THREATS, ...THREATS].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--aegis-danger)' }} /> {t}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33%) } }`}</style>
      </div>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="capabilities" className="relative z-10 mx-auto max-w-[1280px] px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm tracking-[0.3em] mb-3 font-mono uppercase" style={{ color: 'var(--aegis-primary)', opacity: 0.7 }}>Capabilities</p>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--aegis-text)' }}>
            Built for <span className="text-gradient">Zero Trust</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto" style={{ color: 'var(--aegis-text-muted)' }}>
            Six layers of defense between your AI agents and the outside world.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature, i) => (
            <motion.div key={feature.title} variants={fadeUp} custom={i} whileHover={{ y: -2, scale: 1.005 }}>
              <GlassPanel className="group h-full p-6 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
                />
                <div className="mb-4" style={{ color: 'var(--aegis-text)' }}>{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--aegis-text)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--aegis-text-muted)' }}>{feature.description}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════ ARCHITECTURE / PIPELINE ═══════════════ */}
      <section id="architecture" className="relative z-10 mx-auto max-w-4xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm tracking-[0.3em] mb-3 font-mono uppercase" style={{ color: 'var(--aegis-success)', opacity: 0.7 }}>Architecture</p>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--aegis-text)' }}>How It Works</h2>
          <p className="mt-4" style={{ color: 'var(--aegis-text-muted)' }}>Six layers between your AI agents and disaster.</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-[2px]" style={{ background: 'var(--aegis-gradient-primary)', opacity: 0.4 }} />
          <div className="space-y-12">
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex gap-6 items-start group"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 glass" style={{ color: 'var(--aegis-text)' }}>
                  {step.icon}
                </div>
                <GlassPanel className="pt-2 p-6 flex-1 transition-all" style={{ borderColor: 'var(--aegis-border)' }}>
                  <span className="text-xs font-mono tracking-wider" style={{ color: 'var(--aegis-secondary)', opacity: 0.8 }}>STEP {step.step}</span>
                  <h3 className="text-xl font-semibold mb-2 mt-1" style={{ color: 'var(--aegis-text)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--aegis-text-muted)' }}>{step.description}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="relative z-10 mx-auto max-w-[1280px] px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm tracking-[0.3em] mb-3 font-mono uppercase" style={{ color: 'var(--aegis-primary)', opacity: 0.7 }}>Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--aegis-text)' }}>
            Simple, <span className="text-gradient">transparent</span> pricing
          </h2>
          <p className="mt-4 max-w-xl mx-auto" style={{ color: 'var(--aegis-text-muted)' }}>
            Start free. Scale when you&apos;re ready. Every plan includes the full security pipeline.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {/* FREE TIER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
          >
            <GlassPanel className="p-8 h-full">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--aegis-text-muted)' }}>Free</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold" style={{ color: 'var(--aegis-text)' }}>$0</span>
                <span style={{ color: 'var(--aegis-text-muted)' }}>/month</span>
              </div>
              <p className="mt-3 text-sm" style={{ color: 'var(--aegis-text-secondary)' }}>For side projects and experimentation.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {['500 API calls/month', 'Heuristic detection only', 'Basic dashboard', 'Community support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--aegis-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ color: 'var(--aegis-text-secondary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-8 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition"
                style={{
                  borderColor: 'var(--aegis-border)',
                  color: 'var(--aegis-text)',
                  background: 'var(--aegis-surface)',
                }}
              >
                Get started free
              </button>
            </GlassPanel>
          </motion.div>

          {/* PRO TIER — MOST POPULAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <GlassPanel strong className="p-8 relative overflow-hidden" style={{ transform: 'scale(1.03)' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'var(--aegis-gradient-cta)' }} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--aegis-primary)' }}>Pro</p>
                <Pill tone="violet">Most popular</Pill>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold" style={{ color: 'var(--aegis-text)' }}>$49</span>
                <span style={{ color: 'var(--aegis-text-muted)' }}>/month</span>
              </div>
              <p className="mt-3 text-sm" style={{ color: 'var(--aegis-text-secondary)' }}>For teams shipping AI-powered products.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {['50,000 API calls/month', 'Dual AI scoring (Groq + Gemini)', 'Human approval workflows', 'Audit log export & PDF reports', 'Priority email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--aegis-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ color: 'var(--aegis-text-secondary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition glow-pulse-btn"
                style={{
                  background: 'var(--aegis-gradient-cta)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 24px -6px var(--aegis-gradient-cta-shadow)',
                }}
              >
                Start with Pro
              </button>
            </GlassPanel>
          </motion.div>

          {/* ENTERPRISE TIER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <GlassPanel className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--aegis-text-muted)' }}>Enterprise</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold" style={{ color: 'var(--aegis-text)' }}>Custom</span>
                  <span className="text-xs" style={{ color: 'var(--aegis-text-muted)' }}>Contact Sales</span>
                </div>
                <p className="mt-3 text-sm" style={{ color: 'var(--aegis-text-secondary)' }}>For organizations with custom security needs.</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {['Up to 1M API calls/month (custom volume per contract)', 'Custom AI models & rules', 'SSO + RBAC', 'SLA & dedicated support', 'On-prem deployment option'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--aegis-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span style={{ color: 'var(--aegis-text-secondary)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="mt-8 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition"
                style={{
                  borderColor: 'var(--aegis-border)',
                  color: 'var(--aegis-text)',
                  background: 'var(--aegis-surface)',
                }}
              >
                Contact Sales
              </button>
            </GlassPanel>
            <p className="mt-3 text-[10px] text-center leading-relaxed font-mono" style={{ color: 'var(--aegis-text-dim)' }}>
              Enterprise volume is contract-based — we scope API compute costs per deployment to protect both sides.
            </p>
          </motion.div>
        </div>

        {/* Overage & margin callout */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm font-mono" style={{ color: 'var(--aegis-text-muted)' }}>
            Usage overage: <span style={{ color: 'var(--aegis-text-secondary)' }}>$0.002</span> per call beyond plan limits
          </p>
          <p className="text-sm font-mono" style={{ color: 'var(--aegis-text-muted)' }}>
            <span style={{ color: 'var(--aegis-success)' }}>90% gross margin</span> at 1,000 users — heuristic layer means we only pay for AI on borderline requests
          </p>
        </div>
      </section>

      {/* ═══════════════ STACK / FLOW DIAGRAM ═══════════════ */}
      <section id="stack" className="relative z-10 mx-auto max-w-[1280px] px-6 pb-28">
        <GlassPanel strong className="overflow-hidden p-8 md:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Pill tone="emerald">The flow</Pill>
              <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl" style={{ color: 'var(--aegis-text)' }}>
                Your agent talks to Aegis.<br /> Aegis talks to the world.
              </h2>
              <p className="mt-4 text-sm" style={{ color: 'var(--aegis-text-secondary)' }}>
                Swap one URL. Aegis becomes the single chokepoint where policy, scoring,
                logging, and human review all happen. Your application code never changes.
              </p>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {[
                { tag: 'AGENT', text: "POST /rpc { action: 'execute', command: 'cat /etc/passwd' }", color: 'var(--aegis-secondary)' },
                { tag: 'AEGIS', text: 'score → 0.92 · pattern: High Risk Command · status BLOCKED', color: 'var(--aegis-danger)' },
                { tag: 'AUDIT', text: 'approval_requests.insert · sig sha256 · realtime push', color: 'var(--aegis-primary)' },
                { tag: 'OPS',   text: 'approval_queue → dashboard updates live via Supabase Realtime', color: 'var(--aegis-success)' },
              ].map((s, i) => (
                <motion.div
                  key={s.tag}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 rounded-xl border p-3"
                  style={{ borderColor: 'var(--aegis-border)', background: 'var(--aegis-code-bg)' }}
                >
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] shrink-0"
                    style={{ color: s.color, borderColor: s.color, opacity: 0.9 }}
                  >
                    {s.tag}
                  </span>
                  <span className="break-all" style={{ color: 'var(--aegis-text-secondary)' }}>{s.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative z-10 px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--aegis-text)' }}>
            Ready to <span className="text-gradient">take control</span>?
          </h2>
          <p className="mb-10 max-w-lg mx-auto" style={{ color: 'var(--aegis-text-muted)' }}>
            Enter the Command Center to monitor live traffic, respond to threats in real-time,
            and test your defenses in the Adversary Playground.
          </p>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnterDashboard}
            className="glow-pulse-btn px-10 py-4 rounded-xl font-semibold tracking-wider text-lg transition-all duration-300"
            style={{
              background: 'var(--aegis-gradient-cta)',
              color: '#FFFFFF',
              border: '1px solid var(--aegis-border)',
            }}
          >
            Jump to Dashboard →
          </motion.button>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {['1000 req/min', 'SHA-256 Audited', 'Human-in-the-Loop'].map(label => (
              <span key={label} className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: 'var(--aegis-border)', background: 'var(--aegis-surface)', color: 'var(--aegis-text-muted)' }}>
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="mt-20 border-t pt-8 text-center" style={{ borderColor: 'var(--aegis-border)' }}>
          <p className="text-xs tracking-widest font-mono" style={{ color: 'var(--aegis-text-dim)' }}>
            AEGIS GATEWAY v0.1.0 — ZERO-TRUST AI SECURITY PROXY
          </p>
        </div>
      </section>
    </div>
  );
}
