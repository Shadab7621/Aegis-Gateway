'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GlassPanel, Pill } from './GlassPanel';

const ShieldScene = dynamic(() => import('./ShieldScene'), { ssr: false });

const THREATS = [
  'PROMPT INJECTION', 'DATA EXFILTRATION', 'SHELL INJECTION', 'JAILBREAK',
  'CREDENTIAL LEAK', 'SSRF', 'DESTRUCTIVE CMD', 'TOOL ABUSE', 'RECON ATTEMPT',
];

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Zero-Trust Proxy',
    description: 'Every AI agent tool call hits our HTTP proxy first. Nothing executes until it passes a multi-layer security gauntlet — no exceptions.',
    accent: '#3ECFCF',
  },
  {
    icon: '🔬',
    title: 'Heuristic Threat Matrix',
    description: '20+ regex patterns catch path traversal (../../etc/passwd), command chaining (&&, |, ;), prompt injection, and recon attempts before any AI sees them.',
    accent: '#7B6EFF',
  },
  {
    icon: '🤖',
    title: 'Dual AI Verification',
    description: 'Groq (llama-3.1-8b) runs first for speed. If unavailable, Gemini 2.0 Flash takes over. Both return a structured safe/unsafe verdict with reason.',
    accent: '#FFB347',
  },
  {
    icon: '⚖️',
    title: 'Graduated Risk Engine',
    description: 'Every payload gets a 0.0–1.0 risk score. Safe (<0.6) passes instantly. Flagged (0.6–0.99) gets logged. Blocked (1.0) is held for human approval.',
    accent: '#34D399',
  },
  {
    icon: '🍯',
    title: 'Honeypot Deception Layer',
    description: 'Enable per-request honeypot mode to feed attackers convincing fake responses. View exactly what they see vs what really happened in the 3-tab intel modal.',
    accent: '#FF4D6A',
  },
  {
    icon: '📋',
    title: 'Immutable Audit Trail',
    description: 'Every decision — pass, flag, block, approve, deny — is SHA-256 signed and written to PostgreSQL via Supabase with cryptographic tamper detection.',
    accent: '#3ECFCF',
  },
];

const PIPELINE_STEPS = [
  { step: '01', title: 'Agent Fires a Tool Call', description: 'An AI agent sends a JSON-RPC POST to /rpc. The payload can contain any action: execute, read, write, chat, or list.', icon: '🤖' },
  { step: '02', title: 'Heuristic Filter Runs First', description: 'The proxy decodes the payload (including URL-encoding and Base64), then tests it against 20+ threat patterns in microseconds.', icon: '🔬' },
  { step: '03', title: 'AI Layer Validates', description: 'If the heuristic score is below 1.0, Groq or Gemini analyses the full payload for semantic threats regex alone cannot catch.', icon: '🧠' },
  { step: '04', title: 'Risk Gate Decision', description: 'Score <0.6: passes instantly. Score 0.6–0.99: logged to audit trail, allowed. Score 1.0: frozen in a circular buffer.', icon: '⚖️' },
  { step: '05', title: 'SecOps Human Review', description: "Blocked requests appear in the Command Center's approval queue in real-time. Operators approve or deny.", icon: '👤' },
  { step: '06', title: 'Audit Log Sealed', description: 'Every decision is SHA-256 signed and written to the audit_logs table — the signature makes the log tamper-evident.', icon: '📝' },
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
  return (
    <div className="min-h-screen text-white overflow-x-hidden scroll-smooth font-sans relative" style={{ backgroundColor: '#06060F' }}>
      {/* Fixed glass header */}
      <GlassPanel className="fixed top-0 left-0 right-0 z-50" style={{ borderRadius: 0 }}>
        <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'linear-gradient(135deg, #3ECFCF, #7B6EFF)' }}>
              <span className="font-display text-xs font-bold text-[#06060F]">Æ</span>
            </div>
            <span className="font-display text-base font-semibold tracking-wide" style={{ color: '#F0F0FA', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>AEGIS<span className="text-white/30"> GATEWAY</span></span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-[#3ECFCF]/50 hover:bg-[#3ECFCF]/10"
          >
            Open Dashboard →
          </motion.button>
        </nav>
      </GlassPanel>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <Suspense fallback={null}>
          <ShieldScene />
        </Suspense>

        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(6,6,15,0.4) 40%, rgba(6,6,15,0.85) 70%, rgb(6,6,15) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Pill tone="cyan">⚡ Zero-Trust AI Proxy</Pill>
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
              className="mt-6 max-w-xl text-base text-white/65 md:text-lg"
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
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[#06060F]"
                style={{ background: 'linear-gradient(90deg, #3ECFCF, #7B6EFF)', boxShadow: '0 12px 40px -12px rgba(62,207,207,0.5)' }}
              >
                Enter Command Center →
              </motion.button>
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur hover:border-white/30 hover:text-white"
              >
                View Architecture
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-wider text-white/40 font-mono">
              <span>20+ Threat Patterns</span>
              <span className="opacity-40">·</span>
              <span>Dual AI Verification</span>
              <span className="opacity-40">·</span>
              <span>Human-in-the-Loop</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <GlassPanel className="p-5 relative">
              <div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-2.5 py-1 text-[10px] font-bold text-[#34D399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" /> LIVE
              </div>
              <div className="font-mono text-xs space-y-2">
                <div className="text-white/30">$ aegis intercept --watch</div>
                <div className="text-[#FF4D6A]">[BLOCKED] Command injection detected</div>
                <div className="text-[#FFB347]">[FLAGGED] Path traversal attempt</div>
                <div className="text-[#34D399]">[SAFE] Read request cleared</div>
                <div className="text-[#FF4D6A]">[BLOCKED] Prompt injection found</div>
                <div className="text-white/30 mt-3">🛡️ Aegis Gateway: All threats intercepted.</div>
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
          <span className="text-xs text-white/30 tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-[#3ECFCF]/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ THREAT MARQUEE ═══════════════ */}
      <div className="relative z-10 border-y border-white/5 bg-black/20 py-4 overflow-hidden my-4">
        <div className="flex whitespace-nowrap gap-12 font-display text-sm font-semibold tracking-[0.3em] text-white/30" style={{ animation: 'marquee 30s linear infinite' }}>
          {[...THREATS, ...THREATS, ...THREATS].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D6A]" /> {t}
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
          <p className="text-sm tracking-[0.3em] text-[#7B6EFF]/70 mb-3 font-mono uppercase">Capabilities</p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Built for <span className="text-gradient">Zero Trust</span>
          </h2>
          <p className="mt-4 text-white/40 max-w-xl mx-auto">
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
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white/90">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
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
          <p className="text-sm tracking-[0.3em] text-[#34D399]/70 mb-3 font-mono uppercase">Architecture</p>
          <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          <p className="mt-4 text-white/40">Six layers between your AI agents and disaster.</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(180deg, rgba(62,207,207,0.4), rgba(123,110,255,0.4), rgba(52,211,153,0.4))' }} />
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
                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl relative z-10 transition-transform group-hover:scale-110 glass">
                  {step.icon}
                </div>
                <GlassPanel className="pt-2 p-6 flex-1 hover:border-white/10 transition-all">
                  <span className="text-xs font-mono text-[#3ECFCF]/60 tracking-wider">STEP {step.step}</span>
                  <h3 className="text-xl font-semibold text-white/90 mb-2 mt-1">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STACK / FLOW DIAGRAM ═══════════════ */}
      <section id="stack" className="relative z-10 mx-auto max-w-[1280px] px-6 pb-28">
        <GlassPanel strong className="overflow-hidden p-8 md:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Pill tone="emerald">The flow</Pill>
              <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
                Your agent talks to Aegis.<br /> Aegis talks to the world.
              </h2>
              <p className="mt-4 text-sm text-white/60">
                Swap one URL. Aegis becomes the single chokepoint where policy, scoring,
                logging, and human review all happen. Your application code never changes.
              </p>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {[
                { tag: 'AGENT', text: "POST /rpc { action: 'execute', command: 'cat /etc/passwd' }", color: '#3ECFCF' },
                { tag: 'AEGIS', text: 'score → 0.92 · pattern: High Risk Command · status BLOCKED', color: '#FF4D6A' },
                { tag: 'AUDIT', text: 'approval_requests.insert · sig sha256 · realtime push', color: '#7B6EFF' },
                { tag: 'OPS',   text: 'approval_queue → dashboard updates live via Supabase Realtime', color: '#34D399' },
              ].map((s, i) => (
                <motion.div
                  key={s.tag}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] shrink-0"
                    style={{ color: s.color, borderColor: `${s.color}50`, background: `${s.color}1F` }}
                  >
                    {s.tag}
                  </span>
                  <span className="text-white/80 break-all">{s.text}</span>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="text-gradient">take control</span>?
          </h2>
          <p className="text-white/40 mb-10 max-w-lg mx-auto">
            Enter the Command Center to monitor live traffic, respond to threats in real-time,
            and test your defenses in the Adversary Playground.
          </p>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnterDashboard}
            className="glow-pulse-btn px-10 py-4 rounded-xl text-white font-semibold tracking-wider text-lg transition-all duration-300"
            style={{ background: 'linear-gradient(90deg, rgba(62,207,207,0.2), rgba(123,110,255,0.2))', border: '1px solid rgba(62,207,207,0.3)' }}
          >
            Jump to Dashboard →
          </motion.button>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {['1000 req/min', 'SHA-256 Audited', 'Human-in-the-Loop'].map(label => (
              <span key={label} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50">
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="mt-20 border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-white/20 tracking-widest font-mono">
            AEGIS GATEWAY v0.1.0 — ZERO-TRUST AI SECURITY PROXY
          </p>
        </div>
      </section>
    </div>
  );
}
