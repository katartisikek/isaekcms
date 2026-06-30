require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkContacts() {
  const { data, error } = await supabase.from('contacts').select('*').limit(1);
  if (error) {
    console.error('Error fetching contacts:', error);
  } else {
    console.log('Contacts Table Row Sample:', data[0]);
  }
}

checkContacts();
