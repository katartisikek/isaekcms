require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('KEY:', key ? 'found' : 'MISSING');

const supabase = createClient(url, key);

async function test() {
  // Test 1: Simple select
  console.log('\n[1] Testing students fetch...');
  const { data, error } = await supabase.from('students').select('id, fullName').limit(5);
  if (error) {
    console.error('ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS - got', data.length, 'students:');
    data.forEach(s => console.log(' -', s.fullName));
  }

  // Test 2: Test specialties
  console.log('\n[2] Testing specialties fetch...');
  const { data: sp, error: spe } = await supabase.from('specialties').select('id, title').limit(3);
  if (spe) console.error('SPECIALTIES ERROR:', spe.message);
  else console.log('Specialties:', sp.length, '- first:', sp[0]?.title);

  // Test 3: payment_records table
  console.log('\n[3] Testing payment_records table...');
  const { data: pr, error: pre } = await supabase.from('payment_records').select('id').limit(1);
  if (pre) console.error('PAYMENT_RECORDS ERROR:', pre.message);
  else console.log('payment_records OK, rows:', pr.length);
}

test().catch(e => console.error('FATAL:', e.message));
