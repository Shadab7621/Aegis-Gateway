import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED', 'AWAITING', 'REVIEW'];
  
  const { data: calls } = await supabase.from('tool_calls').select('id').limit(1);
  if (!calls || calls.length === 0) return;
  const tool_call_id = calls[0].id;

  for (const status of statuses) {
    const { error: insError } = await supabase.from('approval_requests').insert({
      tool_call_id: tool_call_id,
      status: status
    });
    if (!insError) {
      console.log(`Status '${status}' SUCCESS!`);
    } else {
      console.log(`Status '${status}' failed.`);
    }
  }
}

test();
