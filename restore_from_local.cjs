require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing env vars!');
  process.exit(1);
}

const supabase = createClient(url, key);

// ============================================================
// Paste your localStorage data here.
// Open the browser console (F12) → Console tab, then paste:
//   localStorage.getItem('isaek_students')
// Copy the output and paste it below between the quotes.
// ============================================================

// INSTRUCTIONS:
// 1. Open isaekcms.vercel.app in Chrome
// 2. Press F12 → Console
// 3. Type: copy(localStorage.getItem('isaek_students'))
// 4. Open the file restore_from_local.cjs
// 5. Paste the result in the STUDENTS variable below
// 6. Repeat for specialties, sections, etc.

const STUDENTS_JSON = process.argv[2] || '[]';

async function restore() {
  const students = JSON.parse(STUDENTS_JSON);
  console.log(`Ανάκτηση ${students.length} μαθητών...`);
  
  let ok = 0, fail = 0;
  for (const s of students) {
    const { error } = await supabase.from('students').upsert([s]);
    if (error) {
      console.error(`❌ ${s.fullName}: ${error.message}`);
      fail++;
    } else {
      console.log(`✅ ${s.fullName}`);
      ok++;
    }
  }
  console.log(`\nΑποτέλεσμα: ${ok} ΟΚ, ${fail} ΣΦΑΛΜΑΤΑ`);
}

restore().catch(e => console.error(e));
