require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('courses_data').select('*').limit(1);
  console.log(data[0].data);
  console.log(typeof data[0].data);
  console.log(Array.isArray(data[0].data));
}
run();
