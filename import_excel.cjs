require('dotenv').config();
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function importExcel() {
  console.log("Reading Excel file...");
  const workbook = xlsx.readFile('isaek EXCEL.xlsx');
  
  const sheet = workbook.Sheets['2025Β-2026Α'];
  if (!sheet) {
    console.log("Sheet '2025Β-2026Α' not found.");
    return;
  }

  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const students = [];
  const teachers = [];
  const interests = [];
  const specialtiesSet = new Set();
  
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    
    // Students logic (Columns 0 to 6)
    if (row[1] && row[2] && row[3]) {
      const specialtyTitle = String(row[1]).trim();
      specialtiesSet.add(specialtyTitle);
      
      students.push({
        id: generateId(),
        firstName: String(row[2]).trim(),
        lastName: String(row[3]).trim(),
        fullName: String(row[3]).trim() + ' ' + String(row[2]).trim(),
        mathitisAr: row[4] ? String(row[4]).trim() : '',
        email: row[5] ? String(row[5]).trim() : '',
        phone: row[6] ? String(row[6]).trim() : '',
        specialtyTitle: specialtyTitle
      });
    }

    // Teachers logic (Columns 21 to 26)
    if (row[22] && row[23]) {
      teachers.push({
        id: generateId(),
        name: String(row[22]).trim() + ' ' + String(row[23]).trim(),
        role: 'Καθηγητής',
        phone: row[24] ? String(row[24]).trim() : '',
        email: row[25] ? String(row[25]).trim() : '',
        department: row[26] ? String(row[26]).trim() : ''
      });
    }

    // Interests logic (Columns 48 to 53)
    // 48: Α/Α, 49: ΗΜΕΡΟΜΗΝΙΑ, 50: ΕΙΔΙΚΟΤΗΤΑ, 51: ΟΝΟΜΑΤΕΠΩΝΥΜΟ, 52: EMAIL, 53: ΤΗΛΕΦΩΝΟ
    if (row[51]) {
      const parts = String(row[51]).trim().split(' ');
      const lastName = parts.length > 1 ? parts[0] : String(row[51]).trim();
      const firstName = parts.length > 1 ? parts.slice(1).join(' ') : '-';
      
      let specId = null;
      if (row[50]) {
        specialtiesSet.add(String(row[50]).trim());
        specId = String(row[50]).trim(); // Will be replaced by actual ID later
      }

      interests.push({
        id: generateId(),
        lastName: lastName,
        firstName: firstName,
        email: row[52] ? String(row[52]).trim() : '',
        phone: row[53] ? String(row[53]).trim() : '',
        specialtyTitle: specId
      });
    }
  }

  console.log(`Parsed ${students.length} students, ${teachers.length} teachers, ${interests.length} interests, ${specialtiesSet.size} specialties.`);
  
  const specialtiesMap = {};
  for (const title of Array.from(specialtiesSet)) {
    const specId = generateId();
    specialtiesMap[title] = specId;
    const { error } = await supabase.from('specialties').upsert([{
      id: specId,
      title: title,
      sector: 'Γενικός Τομέας'
    }]);
    if (error) console.error('Error inserting specialty:', error);
  }
  
  let studCount = 0;
  for (const s of students) {
    s.specialtyId = specialtiesMap[s.specialtyTitle];
    delete s.specialtyTitle;
    
    const { error } = await supabase.from('students').upsert([s]);
    if (error) console.error('Error inserting student:', error);
    else studCount++;
  }
  console.log(`Inserted ${studCount} students.`);
  
  let teachCount = 0;
  for (const t of teachers) {
    const { error } = await supabase.from('contacts').upsert([t]);
    if (error) console.error('Error inserting teacher:', error);
    else teachCount++;
  }
  console.log(`Inserted ${teachCount} teachers.`);

  let intCount = 0;
  for (const i of interests) {
    if (i.specialtyTitle) {
      i.specialtyId = specialtiesMap[i.specialtyTitle];
    }
    delete i.specialtyTitle;
    
    const { error } = await supabase.from('interests').upsert([i]);
    if (error) console.error('Error inserting interest:', error);
    else intCount++;
  }
  console.log(`Inserted ${intCount} interests.`);
  
  console.log("Import process finished!");
}

importExcel();
