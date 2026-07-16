require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', url ? url.substring(0, 40) + '...' : 'NOT FOUND');
console.log('Supabase Key:', key ? key.substring(0, 20) + '...' : 'NOT FOUND');

if (!url || !key) {
  console.error('❌ Missing env vars! Check .env or .env.local file.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function diagnose() {
  console.log('\n--- Έλεγχος σύνδεσης Supabase ---\n');

  const tables = ['students', 'specialties', 'sections', 'payment_records'];
  
  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: false })
      .limit(3);
    
    if (error) {
      console.log(`❌ ${table}: ERROR - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${data.length} εγγραφές (από τις πρώτες 3 που φέρθηκαν)`);
      if (data.length > 0 && table === 'students') {
        console.log(`   Πρώτος: ${data[0].fullName || data[0].id}`);
      }
    }
  }
}

diagnose().catch(e => console.error('Fatal error:', e));
