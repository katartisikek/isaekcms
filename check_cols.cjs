require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
    console.error('Error fetching students:', error);
  } else if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    // If empty, insert a dummy and get it back
    await supabase.from('students').upsert([{ id: 'test_col', fullName: 'test' }]);
    const { data: d2 } = await supabase.from('students').select('*').eq('id', 'test_col');
    if (d2 && d2.length > 0) {
        console.log('Columns:', Object.keys(d2[0]));
    }
    await supabase.from('students').delete().eq('id', 'test_col');
  }
}
checkColumns();
