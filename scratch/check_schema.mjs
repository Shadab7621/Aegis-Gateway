import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('honeypot_state')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching honeypot_state:', error);
  } else {
    console.log('honeypot_state columns:', data.length > 0 ? Object.keys(data[0]) : 'No records');
    console.log('honeypot_state sample data:', data);
  }
}

run();
