"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local', override: true });
const http_1 = require("http");
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = require("crypto");
// Environment variables (will be loaded by the runner or from .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekhquduqyzqsrgommdoh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const RESOLVE_SECRET = process.env.RESOLVE_SECRET || '';
if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Database operations will fail.');
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const PORT = 3001;
const lastAiCallByAgent = new Map();
const AI_CALL_MIN_INTERVAL_MS = 3000;
function sign(details) {
    return (0, crypto_1.createHash)('sha256').update(JSON.stringify(details)).digest('hex');
}
// --- Step 2.2: The Heuristic Threat Matrix (Hardened) ---
const THREAT_PATTERNS = [
    // Dangerous Commands
    { name: 'High Risk Command', regex: /\b(wget|curl|chmod|chown|rm|nc|netcat|dd|mkfs|fdisk|iptables|sudo|su)\b/i },
    { name: 'File Read Attempt', regex: /\b(cat|less|more|head|tail|grep)\s+\S+/i },
    { name: 'Suspicious Command', regex: /\b(ls|cat|pwd|whoami|python|bash|sh|zsh|cp|mv|mkdir|touch)\b/i },
    // Command Chaining — shell operators + code-exec functions
    { name: 'Command Chaining', regex: /(;|&&|\|\||`|\$\(.*?\))/i },
    { name: 'Code Execution', regex: /\b(exec|eval|spawn|subprocess|os\.system|shell\s*=\s*true|Runtime\.exec)\b/i },
    // Path Traversal — literal, URL-encoded, unicode, and absolute sensitive paths
    { name: 'Path Traversal', regex: /(\.\.\/|\.\.\\)/i },
    { name: 'Path Traversal (Encoded)', regex: /(%2e%2e%2f|%2e%2e\/|%2e%2e%5c|\.%2e\/|%2e\.\/|\.%2e%5c|%2e\.%5c)/i },
    { name: 'Path Traversal (Unicode)', regex: /(\.\.%c0%af|\.\.%c1%9c|%c0%ae%c0%ae)/i },
    { name: 'Sensitive Path Access', regex: /\/(etc\/(passwd|shadow|hosts|sudoers)|proc\/self|dev\/(tcp|udp))/i },
    // Prompt Injection — original + rephrased variants
    { name: 'Prompt Injection', regex: /(ignore previous instructions|system prompt|bypass|override)/i },
    { name: 'Prompt Injection (Variant)', regex: /\b(disregard|forget|new instructions|act as|you are now|jailbreak|developer mode|pretend you are|from now on|reveal secrets|ignore all|reveal all|tell me everything|show me everything|leak|expose|confidential|what are your instructions|repeat your instructions)\b/i },
    // Reconnaissance / Info-extraction — asking AI about its environment, files, config
    { name: 'Recon: System Info Request', regex: /\b(system (configuration|config|settings|info|information))|(what (files|directories|folders) (are |is )?(accessible|available|you can|you have))|(list (all |available )?(files|directories|folders|commands))|(show (me )?(all |the )?(files|config|configuration|settings|environment|env vars|variables|secrets|credentials))\b/i },
    { name: 'Recon: Credential Fishing', regex: /\b(api[_-]?key|access[_-]?token|secret[_-]?key|auth[_-]?token|credential|private[_-]?key|connection[_-]?string)\b/i },
    { name: 'Recon: File Access Probe', regex: /(accessible to (you|the agent|the model))|(files? (you can|i can|we can) (read|access|view|see|open))|(what (files )?(can you|do you have) (access|read|see))|(read (any|all) (file|document))|(file (system|access|permissions?))/i },
];
/**
 * Decode URL-encoded sequences before pattern matching so
 * attackers cannot evade detection with %2e%2e%2f etc.
 */
function decodePayload(text) {
    try {
        // Double-decode to catch double-encoding tricks
        return decodeURIComponent(decodeURIComponent(text));
    }
    catch {
        // If decoding fails (malformed %), return as-is
        return text;
    }
}
// Track whether any base64 decoded string contains a threat signature
let lastBase64DecodedThreatDetected = false;
function extractAllStrings(obj) {
    const strings = [];
    function traverse(val) {
        if (typeof val === 'string') {
            strings.push(val);
            if (/^[A-Za-z0-9+/]{20,}={0,2}$/.test(val)) {
                try {
                    const decoded = atob(val);
                    strings.push(decoded);
                    // Check if decoded value contains any threat pattern
                    const decodedChecked = decodePayload(decoded);
                    for (const pattern of THREAT_PATTERNS) {
                        if (pattern.regex.test(decodedChecked)) {
                            lastBase64DecodedThreatDetected = true;
                            break;
                        }
                    }
                }
                catch {
                    // Ignore if not valid base64
                }
            }
        }
        else if (Array.isArray(val)) {
            val.forEach(traverse);
        }
        else if (val !== null && typeof val === 'object') {
            Object.values(val).forEach(traverse);
        }
    }
    traverse(obj);
    return strings;
}
function analyzePayload(rawText) {
    let targetText = rawText;
    try {
        const parsed = JSON.parse(rawText);
        targetText = extractAllStrings(parsed).join(' ');
    }
    catch {
        // If not valid JSON, fall back to rawText
    }
    const text = decodePayload(targetText);
    const matches = [];
    const reasons = [];
    for (const pattern of THREAT_PATTERNS) {
        if (pattern.regex.test(text)) {
            matches.push({ name: pattern.name });
            reasons.push(pattern.name);
        }
    }
    return { matches, reasons };
}
async function aiThreatAnalysis(textInput) {
    const text = Array.isArray(textInput) ?
        textInput.join(' ') : textInput;
    // Try Groq first
    if (process.env.GROQ_API_KEY) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: "You are a security analysis agent. Analyze the payload and respond ONLY with JSON containing the keys 'safe' (boolean) and 'reason' (string, max 5 words)."
                        },
                        {
                            role: "user",
                            content: `Payload: ${text}`
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0
                })
            });
            const data = await response.json();
            if (!data.error) {
                const responseText = data.choices?.[0]
                    ?.message?.content || '{"safe":true}';
                const parsed = JSON.parse(responseText);
                console.log("Groq AI result:", parsed);
                return { safe: parsed.safe, reason: parsed.reason };
            }
        }
        catch (err) {
            console.warn("Groq failed, trying Gemini:", err);
        }
    }
    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                            role: "user",
                            parts: [{ text: `You are a security analysis agent. Analyze the payload and respond ONLY with JSON containing the keys 'safe' (boolean) and 'reason' (string, max 5 words). Payload: ${text}` }]
                        }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0,
                        maxOutputTokens: 100
                    }
                })
            });
            const data = await response.json();
            if (!data.error) {
                const responseText = data.candidates?.[0]
                    ?.content?.parts?.[0]?.text || '{"safe":true}';
                const parsed = JSON.parse(responseText);
                console.log("Gemini AI result:", parsed);
                return { safe: parsed.safe, reason: parsed.reason };
            }
        }
        catch (err) {
            console.warn("Gemini also failed:", err);
        }
    }
    // Both failed - Layer 1 regex still protects
    console.warn("All AI providers failed - regex only mode");
    return { safe: true, reason: "AI unavailable" };
}
// --- Step 2.3: Graduated Risk Engine ---
function calculateRiskScore(payloadText, action) {
    let score = 0.0;
    const reasons = [];
    // Reset base64 threat flag
    lastBase64DecodedThreatDetected = false;
    // Suspicious payload length adds baseline risk
    if (payloadText.length > 1000) {
        score += 0.3;
    }
    // 3. SUSPICIOUS ACTIONS - Unauthorized Action score is now 1.0 (immediately HIGH)
    const allowlist = ["execute", "read", "chat", "write", "list"];
    if (action && !allowlist.includes(action)) {
        score += 1.0;
        reasons.push("Unauthorized Action");
    }
    const { matches, reasons: patternReasons } = analyzePayload(payloadText);
    let hasHighRiskCommand = false;
    let hasFileReadAttempt = false;
    let hasSuspiciousCommand = false;
    const otherReasons = [];
    for (const match of matches) {
        if (match.name === 'High Risk Command') {
            hasHighRiskCommand = true;
        }
        else if (match.name === 'File Read Attempt') {
            hasFileReadAttempt = true;
        }
        else if (match.name === 'Suspicious Command') {
            hasSuspiciousCommand = true;
        }
        else {
            otherReasons.push(match.name);
        }
    }
    if (hasHighRiskCommand) {
        score += 1.0;
        reasons.push("High Risk Command");
    }
    if (hasFileReadAttempt) {
        score += 1.0;
        reasons.push("File Read Attempt");
    }
    if (hasSuspiciousCommand) {
        score += 0.6;
        reasons.push("Suspicious Command");
    }
    // Base64 threat matching score overrides to 1.0 (immediately HIGH)
    if (lastBase64DecodedThreatDetected) {
        score += 1.0;
        reasons.push("Base64 Threat Signature");
    }
    // Standard threat signatures
    if (otherReasons.length === 1) {
        score += 0.6;
        reasons.push(otherReasons[0]);
    }
    else if (otherReasons.length >= 2) {
        score += 1.0;
        reasons.push(...otherReasons);
    }
    return {
        score: Math.min(score, 1.0),
        threatReason: reasons.length > 0 ? reasons.join(' + ') : null,
    };
}
// --- Per-Agent Rate Limiter (10 requests/minute sliding window) ---
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const agentRateLimiter = new Map();
function isRateLimited(agentId) {
    const now = Date.now();
    const timestamps = agentRateLimiter.get(agentId) || [];
    // Evict entries older than the window
    const valid = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (valid.length >= RATE_LIMIT_MAX) {
        agentRateLimiter.set(agentId, valid);
        return true;
    }
    valid.push(now);
    agentRateLimiter.set(agentId, valid);
    return false;
}
// --- Phase 5.1: Circular Ring Buffer & Backpressure Gate ---
const MAX_CONCURRENT_REQUESTS = 1000;
let currentActiveRequests = 0;
class CircularBuffer {
    capacity;
    buffer;
    head = 0;
    tail = 0;
    size = 0;
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = new Array(capacity);
    }
    push(item) {
        if (this.size === this.capacity)
            return false; // Buffer full
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.capacity;
        this.size++;
        return true;
    }
    findAndRemove(predicate) {
        for (let i = 0; i < this.size; i++) {
            const index = (this.head + i) % this.capacity;
            if (this.buffer[index] && predicate(this.buffer[index])) {
                const item = this.buffer[index];
                delete this.buffer[index];
                this.size--; // was missing — buffer would permanently "fill up" otherwise
                return item;
            }
        }
        return null;
    }
}
const pendingRequestsBuffer = new CircularBuffer(5000);
// --- Phase 5.2: Precision Timestamp Telemetry ---
function getTimestamp() {
    return `[${new Date().toLocaleTimeString('en-US')}]`;
}
// --- Step 2.1: Zero-Trust HTTP/JSON-RPC Interceptor ---
const server = (0, http_1.createServer)(async (req, res) => {
    // Backpressure Gate
    if (currentActiveRequests >= MAX_CONCURRENT_REQUESTS) {
        console.warn(`${getTimestamp()} [GATE] Backpressure limit reached. Throttling request.`);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too Many Requests - Gateway Throttling' }));
        return;
    }
    currentActiveRequests++;
    const releaseRequest = () => { currentActiveRequests--; };
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Resolve-Token');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    if (req.url === '/rpc' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                const payloadString = JSON.stringify(payload);
                // Per-agent rate limiting
                const agentId = payload.agent_id || 'anonymous';
                if (isRateLimited(agentId)) {
                    console.warn(`${getTimestamp()} [RATE] Agent '${agentId}' exceeded ${RATE_LIMIT_MAX} req/min. Throttled.`);
                    res.writeHead(429, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `Rate limit exceeded for agent '${agentId}'. Max ${RATE_LIMIT_MAX} requests per minute.` }));
                    releaseRequest();
                    return;
                }
                // Analyze risk
                let { score, threatReason } = calculateRiskScore(payloadString, payload.action);
                let threatReasons = threatReason ? threatReason.split(' + ') : [];
                if (score < 1.0) {
                    const allStrings = extractAllStrings(payload);
                    const now = Date.now();
                    const agentKey = payload.agent_id || 'anonymous';
                    const lastCall = lastAiCallByAgent.get(agentKey) || 0;
                    if (now - lastCall < AI_CALL_MIN_INTERVAL_MS) {
                        console.log(`AI check skipped for '${agentKey}' - rate limiting`);
                    }
                    else {
                        lastAiCallByAgent.set(agentKey, now);
                        const aiResult = await aiThreatAnalysis(allStrings);
                        if (!aiResult.safe) {
                            score = Math.max(score, 0.8);
                            threatReasons = [...threatReasons, "AI_DETECTED: " + aiResult.reason];
                        }
                    }
                }
                threatReason = threatReasons.length > 0 ? threatReasons.join(' + ') : null;
                let status = 'COMPLETED';
                if (score >= 1.0) {
                    status = 'BLOCKED';
                }
                else if (score >= 0.6) {
                    status = 'FLAGGED';
                }
                // Insert into tool_calls — columns must match 00001_genesis.sql exactly
                const { data: toolCall, error: insertError } = await supabase
                    .from('tool_calls')
                    .insert({
                    agent_id: payload.agent_id || 'anonymous',
                    request_payload: {
                        ...payload,
                        status_detail: status,
                        threat_reason: threatReason
                    },
                    risk_score: score,
                    status: status
                })
                    .select()
                    .single();
                if (insertError) {
                    console.error('Database insertion error:', insertError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal server error' }));
                    releaseRequest();
                    return;
                }
                if (status === 'BLOCKED') {
                    console.log(`${getTimestamp()} [ALERT] High risk payload detected (${threatReason}). Holding request...`);
                    const { error: approvalError } = await supabase
                        .from('approval_requests')
                        .insert({
                        tool_call_id: toolCall.id,
                        holding_reason: threatReason || 'High risk score',
                        risk_score: score,
                        status: 'PENDING'
                    });
                    if (approvalError) {
                        console.error('Approval request insertion error:', approvalError);
                    }
                    // Store response object to resolve later when approved/denied via dashboard
                    const queued = pendingRequestsBuffer.push({ id: toolCall.id, res, reqBody: payload });
                    if (!queued) {
                        console.error(`${getTimestamp()} [GATE] Approval queue full — rejecting blocked request.`);
                        res.writeHead(503, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Approval queue full, try again later' }));
                        releaseRequest();
                    }
                    return;
                }
                if (status === 'FLAGGED') {
                    console.log(`${getTimestamp()} [WARNING] Medium risk payload detected (${threatReason}). Logging audit event.`);
                    const auditDetails = {
                        threat_reason: threatReason || 'MEDIUM_RISK',
                        severity_level: 'MEDIUM',
                        payload_preview: payload,
                        request_path: '/rpc',
                        source_ip: req.socket.remoteAddress || '127.0.0.1'
                    };
                    const { error: auditError } = await supabase
                        .from('audit_logs')
                        .insert({
                        event_type: 'FLAGGED_REQUEST',
                        target_id: toolCall.id,
                        actor: payload.agent_id || 'anonymous',
                        details: auditDetails,
                        cryptographic_signature: sign(auditDetails)
                    });
                    if (auditError) {
                        console.error('Audit log insertion error:', auditError);
                    }
                }
                // Safe or Flagged payload allowed through
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', action: 'executed', payload }));
                releaseRequest();
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
                releaseRequest();
            }
        });
    }
    else if (req.url === '/resolve' && req.method === 'POST') {
        // --- Authentication gate: require X-Resolve-Token header ---
        // Fail CLOSED: if RESOLVE_SECRET isn't configured, refuse rather than allow.
        if (!RESOLVE_SECRET) {
            console.error(`${getTimestamp()} [AUTH] RESOLVE_SECRET is not configured. Refusing /resolve.`);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Resolve endpoint not configured' }));
            releaseRequest();
            return;
        }
        const resolveToken = req.headers['x-resolve-token'];
        if (resolveToken !== RESOLVE_SECRET) {
            console.warn(`${getTimestamp()} [AUTH] Unauthorized /resolve attempt.`);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized — invalid or missing X-Resolve-Token' }));
            releaseRequest();
            return;
        }
        // Endpoint for dashboard to resolve held requests
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { tool_call_id, resolution } = JSON.parse(body);
                const pending = pendingRequestsBuffer.findAndRemove(item => item.id === tool_call_id);
                if (pending) {
                    pending.res.writeHead(200, { 'Content-Type': 'application/json' });
                    pending.res.end(JSON.stringify({ status: 'resolved', action: resolution, payload: pending.reqBody }));
                    releaseRequest(); // Released from hold
                    // Log audit event using existing schema
                    const resolveDetails = {
                        resolution,
                        payload_preview: pending.reqBody,
                        request_path: '/resolve',
                        source_ip: '127.0.0.1'
                    };
                    await supabase.from('audit_logs').insert({
                        event_type: `RESOLUTION_${resolution.toUpperCase()}`,
                        target_id: tool_call_id,
                        actor: 'SecOps',
                        details: resolveDetails,
                        cryptographic_signature: sign(resolveDetails)
                    });
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'acknowledged' }));
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});
server.listen(PORT, () => {
    console.log(`🛡️ Aegis-Gateway Proxy running on port ${PORT}`);
    console.log("Groq Layer:", process.env.GROQ_API_KEY ? "READY" : "NOT SET");
    console.log("Gemini Layer:", process.env.GEMINI_API_KEY ? "READY" : "NOT SET");
});
