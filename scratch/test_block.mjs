import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekhquduqyzqsrgommdoh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBlock() {
  const oldBlockedAgentId = 'test-agent-blocked-1780908028924';
  const newBlockedAgentId = `test-agent-runtime-blocked-${Date.now()}`;

  console.log(`1. Testing old blocked agent (should load from cache at startup): ${oldBlockedAgentId}`);
  const res1 = await fetch('http://localhost:3001/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: oldBlockedAgentId,
      action: 'execute',
      command: 'ls'
    })
  });
  console.log('Status Code 1:', res1.status);
  const data1 = await res1.json();
  console.log('Response Body 1:', data1);

  console.log(`\n2. Blocking a new agent at runtime: ${newBlockedAgentId}`);
  await supabase.from('audit_logs').insert({
    detected_threat_type: 'PERMANENTLY_BLOCKED',
    severity_level: 'CRITICAL',
    payload_preview: {
      agent_id: newBlockedAgentId,
      reason: 'Manual permanent block at runtime',
      blocked_at: new Date().toISOString()
    },
    request_path: '/honeypot',
    source_ip: '127.0.0.1'
  });

  console.log('Sending request to proxy for newly runtime blocked agent...');
  const res2 = await fetch('http://localhost:3001/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: newBlockedAgentId,
      action: 'execute',
      command: 'ls'
    })
  });
  console.log('Status Code 2:', res2.status);
  const data2 = await res2.json();
  console.log('Response Body 2:', data2);
}

testBlock().catch(console.error);
