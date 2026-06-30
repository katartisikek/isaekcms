require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  const { data: students, error } = await supabase.from('students').select('id, fullName');
  if (error) {
    console.error('Error fetching students:', error);
  } else {
    console.log(`Supabase students count: ${students.length}`);
    if (students.length > 0) {
      console.log('Sample:', students[0]);
    }
  }
}

checkData();
