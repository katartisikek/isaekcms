require('dotenv').config();
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMapping() {
  // Fetch existing teachers, specialties, courses
  const { data: contacts } = await supabase.from('contacts').select('*').eq('role', 'Καθηγητής');
  const { data: specialties } = await supabase.from('specialties').select('*');
  const { data: courses } = await supabase.from('courses').select('*');

  console.log(`Found ${contacts.length} teachers, ${specialties.length} specialties, ${courses.length} courses.`);

  const workbook = xlsx.readFile('isaek EXCEL.xlsx');
  const sheet = workbook.Sheets['ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const teacherMap = {}; // teacher.id -> assignments: Set(specialtyId_courseId)

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Winter
    if (row[0] && row[2] && row[3]) {
      matchAndAssign(row[0], row[2], row[3]);
    }
    // Spring
    if (row[10] && row[12] && row[13]) {
      matchAndAssign(row[10], row[12], row[13]);
    }
  }

  function matchAndAssign(specTitle, courseTitle, teacherStr) {
    const spec = specialties.find(s => s.title.toLowerCase().trim() === String(specTitle).toLowerCase().trim() || String(specTitle).toLowerCase().includes(s.title.toLowerCase()));
    if (!spec) return;

    const course = courses.find(c => c.specialtyId === spec.id && c.title.toLowerCase().trim() === String(courseTitle).toLowerCase().trim());
    if (!course) return;

    // Fuzzy match teacher
    const tStr = String(teacherStr).toLowerCase().trim();
    const tMatch = contacts.find(c => c.name.toLowerCase().includes(tStr) || tStr.includes(c.name.toLowerCase().split(' ')[0]));
    
    if (tMatch) {
      if (!teacherMap[tMatch.id]) teacherMap[tMatch.id] = new Set();
      teacherMap[tMatch.id].add(JSON.stringify({ specialtyId: spec.id, courseId: course.id }));
    }
  }

  let mappedCount = 0;
  for (const tId in teacherMap) {
    const assignments = Array.from(teacherMap[tId]).map(JSON.parse);
    console.log(`Teacher ID ${tId} gets ${assignments.length} assignments.`);
    mappedCount++;
  }
  console.log(`Mapped ${mappedCount} teachers.`);
}

checkMapping();
