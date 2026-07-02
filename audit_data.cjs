require('dotenv').config();
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function auditData() {
  console.log('='.repeat(80));
  console.log('ISAEK CMS - ΕΛΕΓΧΟΣ ΔΕΔΟΜΕΝΩΝ (Excel vs Supabase)');
  console.log('='.repeat(80));
  console.log('');

  // 1. Fetch all data from Supabase
  console.log('[1/6] Φόρτωση δεδομένων από Supabase...');
  const { data: dbStudents } = await supabase.from('students').select('*');
  const { data: dbContacts } = await supabase.from('contacts').select('*');
  const { data: dbSpecialties } = await supabase.from('specialties').select('*');
  const { data: dbSections } = await supabase.from('sections').select('*');
  const { data: dbCourses } = await supabase.from('courses_data').select('*');

  const teachers = (dbContacts || []).filter(c => c.role === 'Καθηγητής' || c.role === 'Εκπαιδευτής');
  const allContacts = dbContacts || [];

  console.log(`  → Μαθητές στη βάση: ${(dbStudents || []).length}`);
  console.log(`  → Καθηγητές στη βάση: ${teachers.length}`);
  console.log(`  → Ειδικότητες στη βάση: ${(dbSpecialties || []).length}`);
  console.log(`  → Τμήματα στη βάση: ${(dbSections || []).length}`);
  console.log(`  → Courses data στη βάση: ${(dbCourses || []).length}`);
  console.log(`  → Σύνολο Επαφών: ${allContacts.length}`);
  console.log('');

  // 2. Read Excel file
  console.log('[2/6] Ανάγνωση Excel αρχείου...');
  const workbook = xlsx.readFile('isaek EXCEL.xlsx');
  const sheetNames = workbook.SheetNames;
  console.log(`  → Sheets στο Excel: ${sheetNames.join(', ')}`);
  console.log('');

  // ============================================================
  // 3. ΕΛΕΓΧΟΣ ΜΑΘΗΤΩΝ - ΕΙΔΙΚΟΤΗΤΩΝ
  // ============================================================
  console.log('[3/6] ΕΛΕΓΧΟΣ ΜΑΘΗΤΩΝ - ΕΙΔΙΚΟΤΗΤΩΝ');
  console.log('-'.repeat(60));

  // Read students from the Excel sheet "2025Β-2026Α"
  const studentSheet = workbook.Sheets['2025Β-2026Α'];
  if (studentSheet) {
    const studentRows = xlsx.utils.sheet_to_json(studentSheet, { header: 1 });
    
    // Parse students from Excel
    const excelStudents = [];
    for (let i = 2; i < studentRows.length; i++) {
      const row = studentRows[i];
      if (!row) continue;
      if (row[2] && row[3]) {
        const fullName = String(row[3]).trim() + ' ' + String(row[2]).trim();
        const specialtyTitle = row[1] ? String(row[1]).trim() : '';
        const phone = row[6] ? String(row[6]).trim() : '';
        const email = row[5] ? String(row[5]).trim() : '';
        excelStudents.push({ fullName, specialtyTitle, phone, email });
      }
    }
    console.log(`  Μαθητές στο Excel: ${excelStudents.length}`);

    // Check each Excel student exists in DB with correct specialty
    let matchedStudents = 0;
    let unmatchedStudents = [];
    let wrongSpecialty = [];

    for (const excelStud of excelStudents) {
      const dbMatch = (dbStudents || []).find(s => {
        const dbName = (s.fullName || '').toLowerCase().trim();
        const exName = excelStud.fullName.toLowerCase().trim();
        return dbName === exName || dbName.includes(exName) || exName.includes(dbName);
      });

      if (!dbMatch) {
        unmatchedStudents.push(excelStud.fullName);
      } else {
        // Check if specialty is correctly linked
        const spec = (dbSpecialties || []).find(sp => sp.id === dbMatch.specialtyId);
        if (spec) {
          const specMatch = spec.title.toLowerCase().includes(excelStud.specialtyTitle.toLowerCase().substring(0, 15))
            || excelStud.specialtyTitle.toLowerCase().includes(spec.title.toLowerCase().substring(0, 15));
          if (specMatch) {
            matchedStudents++;
          } else {
            wrongSpecialty.push({
              student: excelStud.fullName,
              excelSpec: excelStud.specialtyTitle,
              dbSpec: spec.title
            });
          }
        } else {
          wrongSpecialty.push({
            student: excelStud.fullName,
            excelSpec: excelStud.specialtyTitle,
            dbSpec: '(ΚΕΝΟ - Δεν βρέθηκε ειδικότητα)'
          });
        }
      }
    }

    console.log(`  ✅ Σωστά συνδεδεμένοι μαθητές: ${matchedStudents}/${excelStudents.length}`);
    
    if (unmatchedStudents.length > 0) {
      console.log(`  ❌ Μαθητές Excel που ΔΕΝ βρέθηκαν στη βάση: ${unmatchedStudents.length}`);
      unmatchedStudents.forEach(n => console.log(`     - ${n}`));
    } else {
      console.log(`  ✅ Όλοι οι μαθητές του Excel βρέθηκαν στη βάση!`);
    }

    if (wrongSpecialty.length > 0) {
      console.log(`  ⚠️  Μαθητές με λάθος ειδικότητα: ${wrongSpecialty.length}`);
      wrongSpecialty.forEach(w => console.log(`     - ${w.student}: Excel="${w.excelSpec}" | DB="${w.dbSpec}"`));
    } else {
      console.log(`  ✅ Όλοι οι μαθητές έχουν σωστή ειδικότητα!`);
    }

    // Check reverse: DB students not in Excel
    const dbOnlyStudents = (dbStudents || []).filter(dbS => {
      return !excelStudents.some(exS => {
        const dbName = (dbS.fullName || '').toLowerCase().trim();
        const exName = exS.fullName.toLowerCase().trim();
        return dbName === exName || dbName.includes(exName) || exName.includes(dbName);
      });
    });

    if (dbOnlyStudents.length > 0) {
      console.log(`  ℹ️  Μαθητές στη βάση αλλά ΟΧΙ στο Excel: ${dbOnlyStudents.length}`);
      dbOnlyStudents.slice(0, 10).forEach(s => console.log(`     - ${s.fullName} (ID: ${s.id})`));
      if (dbOnlyStudents.length > 10) console.log(`     ... και ${dbOnlyStudents.length - 10} ακόμα`);
    }
  } else {
    console.log('  ⚠️  Δεν βρέθηκε το sheet "2025Β-2026Α" στο Excel.');
  }
  console.log('');

  // ============================================================
  // 4. ΕΛΕΓΧΟΣ ΚΑΘΗΓΗΤΩΝ - ΜΑΘΗΜΑΤΩΝ
  // ============================================================
  console.log('[4/6] ΕΛΕΓΧΟΣ ΚΑΘΗΓΗΤΩΝ - ΜΑΘΗΜΑΤΩΝ');
  console.log('-'.repeat(60));

  // Read courses sheet "ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ"
  const coursesSheet = workbook.Sheets['ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ'];
  if (coursesSheet) {
    const courseRows = xlsx.utils.sheet_to_json(coursesSheet, { header: 1 });
    
    // Parse teacher-course-specialty mappings from Excel
    const excelTeacherMappings = []; // { teacherName, courseName, specialtyName }
    
    for (let i = 2; i < courseRows.length; i++) {
      const row = courseRows[i];
      if (!row) continue;

      // Winter semester: Col 0 = Specialty, Col 2 = Course, Col 3 = Teacher
      if (row[0] && row[2] && row[3]) {
        excelTeacherMappings.push({
          teacherName: String(row[3]).trim(),
          courseName: String(row[2]).trim(),
          specialtyName: String(row[0]).trim(),
          semester: 'Χειμερινό'
        });
      }
      // Spring semester: Col 10 = Specialty, Col 12 = Course, Col 13 = Teacher
      if (row[10] && row[12] && row[13]) {
        excelTeacherMappings.push({
          teacherName: String(row[13]).trim(),
          courseName: String(row[12]).trim(),
          specialtyName: String(row[10]).trim(),
          semester: 'Εαρινό'
        });
      }
    }

    // Get unique teachers from Excel
    const uniqueExcelTeachers = [...new Set(excelTeacherMappings.map(m => m.teacherName.toLowerCase()))];
    console.log(`  Μοναδικοί καθηγητές στο Excel (ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ): ${uniqueExcelTeachers.length}`);
    console.log(`  Αντιστοιχίσεις καθηγητή-μαθήματος στο Excel: ${excelTeacherMappings.length}`);

    // Check each teacher mapping
    let teacherMatchCount = 0;
    let teacherNoDBMatch = [];
    let teacherNoAssignment = [];
    let teacherWrongCourse = [];

    // Parse teacher assignments from DB
    const teacherAssignments = {};
    for (const t of teachers) {
      let assignments = [];
      try {
        if (t.department && t.department.startsWith('[')) {
          assignments = JSON.parse(t.department);
        }
      } catch(e) {}
      teacherAssignments[t.id] = { name: t.name, assignments };
    }

    for (const mapping of excelTeacherMappings) {
      const tStr = mapping.teacherName.toLowerCase();
      
      // Find teacher in DB
      const dbTeacher = teachers.find(t => {
        const tName = t.name.toLowerCase();
        return tName.includes(tStr) || tStr.includes(tName) || 
               tStr.includes(tName.split(' ')[0]) || tName.includes(tStr.split(' ')[0]);
      });

      if (!dbTeacher) {
        if (!teacherNoDBMatch.some(t => t.toLowerCase() === tStr)) {
          teacherNoDBMatch.push(mapping.teacherName);
        }
        continue;
      }

      // Check if this teacher has the assignment
      const ta = teacherAssignments[dbTeacher.id];
      if (!ta || ta.assignments.length === 0) {
        if (!teacherNoAssignment.some(t => t.name === dbTeacher.name)) {
          teacherNoAssignment.push({ name: dbTeacher.name, course: mapping.courseName, spec: mapping.specialtyName });
        }
        continue;
      }

      // Find matching specialty
      const spec = (dbSpecialties || []).find(s => {
        const sTitle = s.title.toLowerCase();
        const mTitle = mapping.specialtyName.toLowerCase();
        return sTitle.includes(mTitle.substring(0, 15)) || mTitle.includes(sTitle.substring(0, 15));
      });

      if (spec) {
        const hasAssignment = ta.assignments.some(a => {
          return a.specialtyId === spec.id;
        });
        if (hasAssignment) {
          teacherMatchCount++;
        } else {
          teacherWrongCourse.push({
            teacher: dbTeacher.name,
            course: mapping.courseName,
            spec: mapping.specialtyName,
            dbAssignments: ta.assignments.map(a => {
              const sp = (dbSpecialties || []).find(s => s.id === a.specialtyId);
              return sp ? sp.title : a.specialtyId;
            }).join(', ')
          });
        }
      } else {
        teacherWrongCourse.push({
          teacher: dbTeacher.name,
          course: mapping.courseName,
          spec: mapping.specialtyName,
          dbAssignments: '(Ειδικότητα δεν βρέθηκε στη βάση)'
        });
      }
    }

    console.log(`  ✅ Σωστά συνδεδεμένες αντιστοιχίσεις: ${teacherMatchCount}/${excelTeacherMappings.length}`);
    
    if (teacherNoDBMatch.length > 0) {
      console.log(`  ❌ Καθηγητές Excel που ΔΕΝ βρέθηκαν στη βάση: ${teacherNoDBMatch.length}`);
      teacherNoDBMatch.forEach(n => console.log(`     - ${n}`));
    } else {
      console.log(`  ✅ Όλοι οι καθηγητές του Excel βρέθηκαν στη βάση!`);
    }

    if (teacherNoAssignment.length > 0) {
      console.log(`  ⚠️  Καθηγητές ΧΩΡΙΣ assignments στη βάση: ${teacherNoAssignment.length}`);
      teacherNoAssignment.forEach(t => console.log(`     - ${t.name} (πρέπει: ${t.course} / ${t.spec})`));
    }

    if (teacherWrongCourse.length > 0) {
      console.log(`  ⚠️  Αντιστοιχίσεις που λείπουν ή είναι λάθος: ${teacherWrongCourse.length}`);
      teacherWrongCourse.slice(0, 20).forEach(w => 
        console.log(`     - ${w.teacher}: Excel="${w.spec} > ${w.course}" | DB="${w.dbAssignments}"`)
      );
      if (teacherWrongCourse.length > 20) console.log(`     ... και ${teacherWrongCourse.length - 20} ακόμα`);
    } else if (teacherNoDBMatch.length === 0 && teacherNoAssignment.length === 0) {
      console.log(`  ✅ Όλοι οι καθηγητές έχουν σωστές αντιστοιχίσεις μαθημάτων!`);
    }

    // Also show teachers in DB who have NO assignments at all
    const teachersWithNoAssign = teachers.filter(t => {
      let a = [];
      try { if (t.department && t.department.startsWith('[')) a = JSON.parse(t.department); } catch(e) {}
      return a.length === 0;
    });
    if (teachersWithNoAssign.length > 0) {
      console.log(`  ℹ️  Καθηγητές στη βάση χωρίς κανένα μάθημα: ${teachersWithNoAssign.length}`);
      teachersWithNoAssign.forEach(t => console.log(`     - ${t.name} (${t.phone || 'χωρίς τηλ'})`));
    }
  } else {
    console.log('  ⚠️  Δεν βρέθηκε το sheet "ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ" στο Excel.');
  }
  console.log('');

  // ============================================================
  // 5. ΕΛΕΓΧΟΣ ΕΙΔΙΚΟΤΗΤΩΝ & COURSES
  // ============================================================
  console.log('[5/6] ΕΛΕΓΧΟΣ ΕΙΔΙΚΟΤΗΤΩΝ & ΜΑΘΗΜΑΤΩΝ ΑΝΑ ΕΙΔΙΚΟΤΗΤΑ');
  console.log('-'.repeat(60));

  for (const spec of (dbSpecialties || [])) {
    const studentsInSpec = (dbStudents || []).filter(s => s.specialtyId === spec.id);
    const teachersInSpec = teachers.filter(t => {
      let a = [];
      try { if (t.department && t.department.startsWith('[')) a = JSON.parse(t.department); } catch(e) {}
      return a.some(assign => assign.specialtyId === spec.id);
    });
    
    // Courses for this specialty
    const courseData = (dbCourses || []).find(c => c.specialtyId === spec.id);
    let totalCourses = 0;
    if (courseData && courseData.data) {
      const d = typeof courseData.data === 'string' ? JSON.parse(courseData.data) : courseData.data;
      ['semester1','semester2','semester3','semester4'].forEach(sem => {
        if (d[sem] && Array.isArray(d[sem])) totalCourses += d[sem].length;
      });
    }

    const icon = studentsInSpec.length > 0 && teachersInSpec.length > 0 ? '✅' : '⚠️';
    console.log(`  ${icon} ${spec.title}`);
    console.log(`     Μαθητές: ${studentsInSpec.length} | Καθηγητές: ${teachersInSpec.length} | Μαθήματα: ${totalCourses}`);
  }
  console.log('');

  // ============================================================
  // 6. ΣΥΝΟΨΗ
  // ============================================================
  console.log('[6/6] ΣΥΝΟΨΗ');
  console.log('='.repeat(60));
  console.log(`  Σύνολο Μαθητών στη βάση: ${(dbStudents || []).length}`);
  console.log(`  Σύνολο Καθηγητών στη βάση: ${teachers.length}`);
  console.log(`  Σύνολο Ειδικοτήτων: ${(dbSpecialties || []).length}`);
  console.log(`  Σύνολο Τμημάτων: ${(dbSections || []).length}`);
  
  // Count teachers with assignments
  const teachersWithAssign = teachers.filter(t => {
    let a = [];
    try { if (t.department && t.department.startsWith('[')) a = JSON.parse(t.department); } catch(e) {}
    return a.length > 0;
  });
  console.log(`  Καθηγητές ΜΕ αντιστοιχίσεις: ${teachersWithAssign.length}/${teachers.length}`);
  
  // Count students with specialtyId
  const studentsWithSpec = (dbStudents || []).filter(s => s.specialtyId);
  console.log(`  Μαθητές ΜΕ ειδικότητα: ${studentsWithSpec.length}/${(dbStudents || []).length}`);

  console.log('');
  console.log('='.repeat(80));
  console.log('ΕΛΕΓΧΟΣ ΟΛΟΚΛΗΡΩΘΗΚΕ');
  console.log('='.repeat(80));
}

auditData().catch(err => {
  console.error('Σφάλμα:', err);
  process.exit(1);
});
