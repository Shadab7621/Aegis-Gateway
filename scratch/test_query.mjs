import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('severity_level', 'HONEYPOT')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Honeypot logs:', JSON.stringify(logs, null, 2));
  }
}

run();
