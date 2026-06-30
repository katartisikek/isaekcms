require('dotenv').config();
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function importTeachers() {
  console.log("Fetching DB data...");
  const { data: contacts } = await supabase.from('contacts').select('*').eq('role', 'Καθηγητής');
  const { data: specialties } = await supabase.from('specialties').select('*');
  const { data: coursesData } = await supabase.from('courses_data').select('*');

  // Reconstruct courses from courses_data into a flat map: { specialtyId: [ courseName1, courseName2, ... ] }
  const coursesFlat = {};
  (coursesData || []).forEach(row => {
    let d = row.data;
    if (typeof d === 'string') {
      try { d = JSON.parse(d); } catch(e) { d = {}; }
    }
    const flat = [];
    const sems = ['semester1', 'semester2', 'semester3', 'semester4'];
    sems.forEach(s => {
      if (d[s] && Array.isArray(d[s])) flat.push(...d[s]);
    });
    coursesFlat[row.specialtyId] = flat;
  });

  console.log(`Found ${contacts.length} teachers, ${specialties.length} specialties, ${Object.keys(coursesFlat).length} courses in DB.`);

  console.log("Reading Excel...");
  const workbook = xlsx.readFile('isaek EXCEL.xlsx');
  const sheet = workbook.Sheets['ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const teacherMap = {}; // teacher.id -> Set of stringified JSON objects

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Winter: Col 0 = Specialty, Col 2 = Course, Col 3 = Teacher
    if (row[0] && row[2] && row[3]) {
      matchAndAssign(row[0], row[2], row[3]);
    }
    // Spring: Col 10 = Specialty, Col 12 = Course, Col 13 = Teacher
    if (row[10] && row[12] && row[13]) {
      matchAndAssign(row[10], row[12], row[13]);
    }
  }

  function matchAndAssign(specTitle, courseTitle, teacherStr) {
    const sTitle = String(specTitle).toLowerCase().trim();
    const spec = specialties.find(s => s.title.toLowerCase().trim() === sTitle || sTitle.includes(s.title.toLowerCase().trim()) || s.title.toLowerCase().trim().includes(sTitle));
    if (!spec) {
      console.log('Missed Spec:', specTitle);
      return;
    }

    const course = String(courseTitle).trim(); // Just use the string from Excel
    if (!course) return;

    const tStr = String(teacherStr).toLowerCase().trim();
    const tMatch = contacts.find(c => c.name.toLowerCase().includes(tStr) || tStr.includes(c.name.toLowerCase().split(' ')[0]));
    
    if (!tMatch) {
      // console.log('Missed Teacher:', teacherStr);
    }

    if (tMatch) {
      if (!teacherMap[tMatch.id]) teacherMap[tMatch.id] = new Set();
      teacherMap[tMatch.id].add(JSON.stringify({ specialtyId: spec.id, courseId: course }));
    }
  }

  let mappedCount = 0;
  for (const tId in teacherMap) {
    const teacher = contacts.find(c => c.id === tId);
    
    // Existing assignments parsing
    let existing = [];
    try {
      if (teacher.department && teacher.department.startsWith('[')) {
        existing = JSON.parse(teacher.department);
      }
    } catch (e) {
      existing = [];
    }

    // Add new assignments from Excel without duplicating
    const assignmentsSet = new Set(existing.map(e => JSON.stringify(e)));
    const newAssignments = Array.from(teacherMap[tId]);
    for (const a of newAssignments) {
      assignmentsSet.add(a);
    }

    const finalAssignments = Array.from(assignmentsSet).map(JSON.parse);
    teacher.department = JSON.stringify(finalAssignments);
    
    const { error } = await supabase.from('contacts').upsert([teacher]);
    if (error) {
      console.error(`Error updating teacher ${teacher.name}:`, error.message);
    } else {
      console.log(`Updated teacher ${teacher.name} with ${finalAssignments.length} assignments.`);
      mappedCount++;
    }
  }
  
  console.log(`Successfully mapped and updated ${mappedCount} teachers!`);
}

importTeachers();
