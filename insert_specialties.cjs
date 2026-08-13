const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Specialties extracted from the Excel with clean names and sectors
const specialties = [
  { id: 'spec_arch_1', title: 'Εσωτερική Αρχιτεκτονική Διακόσμηση και Σχεδιασμός Αντικειμένων', sector: 'Εφαρμοσμένων Τεχνών' },
  { id: 'spec_dioik_1', title: 'Στέλεχος Διοίκησης και Οικονομίας', sector: 'Διοίκησης και Οικονομίας' },
  { id: 'spec_aero_1', title: 'Στέλεχος Υπηρεσιών Αερομεταφοράς', sector: 'Τουρισμού και Μεταφορών' },
  { id: 'spec_arto_1', title: 'Τεχνικός Αρτοποιίας και Ζαχαροπλαστικής Τέχνης', sector: 'Επισιτισμού' },
  { id: 'spec_mageir_1', title: 'Τεχνικός Μαγειρικής Τέχνης - Αρχιμάγειρας Chef', sector: 'Επισιτισμού' },
  { id: 'spec_yp_1', title: 'Τεχνικός Η/Υ και Δικτύων', sector: 'Πληροφορικής' },
  { id: 'spec_tour_1', title: 'Τεχνικός Τουριστικών Μονάδων και Επιχειρήσεων Φιλοξενίας', sector: 'Τουρισμού και Μεταφορών' },
];

async function insertSpecialties() {
  console.log('Inserting specialties into Supabase...');
  
  for (const spec of specialties) {
    const { data, error } = await supabase.from('specialties').upsert([spec]).select();
    if (error) {
      console.error(`Error inserting ${spec.title}:`, error.message);
    } else {
      console.log(`✓ Inserted: ${data[0].title}`);
    }
  }
  
  // Verify
  const { data: all } = await supabase.from('specialties').select('*');
  console.log(`\nTotal specialties in DB: ${all.length}`);
  all.forEach(s => console.log(` - ${s.title} (${s.sector})`));
}

insertSpecialties();
