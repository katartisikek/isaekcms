require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCols() {
  const { data, error } = await supabase.rpc('get_columns', { table_name: 'contacts' });
  if (error) {
    // If rpc fails, fallback to simple select
    const { data: d2 } = await supabase.from('contacts').select('*').limit(1);
    console.log("Cols from select:", d2 ? Object.keys(d2[0] || {}) : "No data");
  } else {
    console.log("Cols:", data);
  }
}
checkCols();
