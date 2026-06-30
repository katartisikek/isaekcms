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
  if (!sheet) return;

  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const teachers = [];
  const interests = [];
  const oldStudents = [];
  const specialtiesSet = new Set();
  
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Teachers 1 (Columns 30-34)
    if (row[30] && row[31]) {
      teachers.push({
        id: generateId(),
        name: String(row[30]).trim() + ' ' + String(row[31]).trim(),
        role: 'Καθηγητής',
        phone: row[32] ? String(row[32]).trim() : '',
        email: row[33] ? String(row[33]).trim() : '',
        department: row[34] ? String(row[34]).trim() : ''
      });
    }

    // Interests (Columns 61, 63, 65)
    if (row[63]) {
      const parts = String(row[63]).trim().split(' ');
      const lastName = parts.length > 1 ? parts[0] : String(row[63]).trim();
      const firstName = parts.length > 1 ? parts.slice(1).join(' ') : '-';
      
      interests.push({
        id: generateId(),
        lastName: lastName,
        firstName: firstName,
        email: '', // Not in this block
        phone: row[65] ? String(row[65]).trim() : '',
        specialtyTitle: null
      });
    }

    // Old Students (Columns 70-74)
    if (row[70] && row[71] && row[74]) {
      const specialtyTitle = String(row[74]).trim();
      specialtiesSet.add(specialtyTitle);
      
      oldStudents.push({
        id: generateId(),
        firstName: String(row[71]).trim(),
        lastName: String(row[70]).trim(),
        fullName: String(row[70]).trim() + ' ' + String(row[71]).trim(),
        phone: row[72] ? String(row[72]).trim() : '',
        email: row[73] ? String(row[73]).trim() : '',
        specialtyTitle: specialtyTitle
      });
    }

    // Teachers 2 (Columns 77-81)
    if (row[77] && row[78]) {
      teachers.push({
        id: generateId(),
        name: String(row[77]).trim() + ' ' + String(row[78]).trim(),
        role: 'Καθηγητής',
        phone: row[79] ? String(row[79]).trim() : '',
        email: row[80] ? String(row[80]).trim() : '',
        department: row[81] ? String(row[81]).trim() : ''
      });
    }
  }

  console.log(`Parsed ${teachers.length} teachers, ${interests.length} interests, ${oldStudents.length} old students.`);
  
  // Update specialties with any new ones
  const specialtiesMap = {};
  for (const title of Array.from(specialtiesSet)) {
    const { data } = await supabase.from('specialties').select('id').eq('title', title).limit(1);
    if (data && data.length > 0) {
      specialtiesMap[title] = data[0].id;
    } else {
      const specId = generateId();
      specialtiesMap[title] = specId;
      await supabase.from('specialties').upsert([{ id: specId, title: title, sector: 'Γενικός Τομέας' }]);
    }
  }
  
  let teachCount = 0;
  for (const t of teachers) {
    const { error } = await supabase.from('contacts').upsert([t]);
    if (!error) teachCount++;
  }
  console.log(`Inserted ${teachCount} teachers.`);

  let intCount = 0;
  for (const i of interests) {
    delete i.specialtyTitle;
    const { error } = await supabase.from('interests').upsert([i]);
    if (!error) intCount++;
  }
  console.log(`Inserted ${intCount} interests.`);

  let studCount = 0;
  for (const s of oldStudents) {
    s.specialtyId = specialtiesMap[s.specialtyTitle];
    delete s.specialtyTitle;
    const { error } = await supabase.from('students').upsert([s]);
    if (!error) studCount++;
  }
  console.log(`Inserted ${studCount} old students.`);
  
  console.log("Import process finished!");
}

importExcel();
