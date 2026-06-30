require('dotenv').config();
const xlsx = require('xlsx');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const monthMap = {
  'Ιανουαρίου': '01',
  'Φεβρουαρίου': '02',
  'Μαρτίου': '03',
  'Απριλίου': '04',
  'Μαΐου': '05',
  'Μαιου': '05',
  'Ιουνίου': '06',
  'Ιουλίου': '07',
  'Αυγούστου': '08',
  'Σεπτεμβρίου': '09',
  'Οκτωβρίου': '10',
  'Νοεμβρίου': '11',
  'Δεκεμβρίου': '12'
};

function parseDateStr(str, timeObj) {
  if (!str) return new Date().toISOString();
  try {
    // Example: "Πέμπτη, 26 Ιουνίου 2025"
    const parts = str.split(' ').filter(Boolean);
    let day = parts[1];
    let month = parts[2];
    let year = parts[3];

    if (!day || !month || !year) return new Date().toISOString();

    const m = monthMap[month] || '01';
    const d = day.padStart(2, '0');
    const datePart = `${year}-${m}-${d}`;

    let timePart = '12:00:00';
    if (timeObj && timeObj instanceof Date) {
      // timeObj is like 1899-12-30T12:06:08.000Z
      timePart = timeObj.toISOString().split('T')[1].replace('Z', '');
    }
    
    // Combine to ISO
    return new Date(`${datePart}T${timePart}Z`).toISOString();
  } catch(e) {
    return new Date().toISOString();
  }
}

async function importInterests() {
  const { data: specialties } = await supabase.from('specialties').select('*');
  const { data: existing } = await supabase.from('interests').select('*');

  const workbook = xlsx.readFile('excel_endiaferon.xlsx', { cellDates: true });
  const sheet = workbook.Sheets['Φύλλο1'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const toInsert = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[4]) continue; // No name, skip

    const dateStr = row[1];
    const timeObj = row[2];
    const specStr = row[3];
    const fullName = String(row[4]).trim();
    const email = String(row[5] || '').trim();
    const phone = String(row[6] || '').trim();
    const source = String(row[7] || '').trim();

    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Match specialty
    let specialtyId = null;
    if (specStr) {
      const sTitle = String(specStr).toLowerCase().trim();
      const spec = specialties.find(s => s.title.toLowerCase().trim() === sTitle || sTitle.includes(s.title.toLowerCase().trim()) || s.title.toLowerCase().trim().includes(sTitle));
      if (spec) specialtyId = spec.id;
    }

    // Check duplicate
    // Exact same first name, last name, phone and specialty
    const isDup = existing.find(e => 
      e.firstName.toLowerCase() === firstName.toLowerCase() &&
      e.lastName.toLowerCase() === lastName.toLowerCase() &&
      (e.phone === phone || !phone) &&
      e.specialtyId === specialtyId
    );

    if (!isDup) {
      toInsert.push({
        id: crypto.randomUUID(),
        firstName,
        lastName,
        email: email === 'undefined' ? '' : email,
        phone: phone === 'undefined' ? '' : phone,
        specialtyId,
        comments: source ? `Πηγή: ${source}` : '',
        createdAt: parseDateStr(dateStr, timeObj)
      });
    }
  }

  console.log(`Found ${toInsert.length} new interests to insert (skipped duplicates).`);

  if (toInsert.length > 0) {
    const { error } = await supabase.from('interests').insert(toInsert);
    if (error) console.error("Error inserting:", error);
    else console.log("Success!");
  }
}

importInterests();
