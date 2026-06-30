require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('interests').select('*').limit(1);
  if (error) console.error(error);
  else console.log("Row keys:", Object.keys(data[0] || {}));
}
checkSchema();
