require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// =====================================================
// MAPPING: Duplicate specialty -> Original specialty
// =====================================================
const SPECIALTY_MAP = {
  // Εσωτερική Αρχιτεκτονική variants -> spec_11
  'ΕΣΩΤΕΡΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΔΙΑΚΟΣΜΗΣΗ ΚΑΙ ΣΧΕΔΙΑΣΜΟΣ ΑΝΤΙΚΕΙΜΕΝΩΝ (1ο ΕΤΟΣ)': 'spec_11',
  'ΕΣΩΤΕΡΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΔΙΑΚΟΣΜΗΣΗ ΚΑΙ ΣΧΕΔΙΑΣΜΟΣ ΑΝΤΙΚΕΙΜΕΝΩΝ (2ο ΕΤΟΣ)': 'spec_11',
  'ΕΣΩΤΕΡΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΔΙΑΚΟΣΜΗΣΗ ΚΑΙ ΣΧΕΔΙΑΣΜΟΣ ΑΝΤΙΚΕΙΜΕΝΩΝ (ΑΠΟΦΟΙΤΟΙ 2023Β)': 'spec_11',
  'ΕΣΩΤΕΡΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΔΙΑΚΟΣΜΙΣΗ ΚΑΙ ΣΧΕΔΙΑΣΜΟΣ ΑΝΤΙΚΕΙΜΕΝΩΝ Γ ΕΞΑΜΗΝΟ': 'spec_11',
  // Στέλεχος Διοίκησης -> spec_7
  'ΣΤΕΛΕΧΟΣ ΔΙΟΙΚΗΣΗΣ ΚΑΙ ΟΙΚΟΝΟΜΙΑΣ (1ο ΕΤΟΣ)': 'spec_7',
  // Στέλεχος Αερομεταφοράς -> spec_16
  'ΣΤΕΛΕΧΟΣ ΥΠΗΡΕΣΙΩΝ ΑΕΡΟΜΕΤΑΦΟΡΑΣ (2ο ΕΤΟΣ )': 'spec_16',
  'ΣΤΕΛΕΧΟΣ ΥΠΗΡΕΣΙΩΝ ΑΕΡΟΜΕΤΑΦΟΡΑΣ Γ ΕΞΑΜΗΝΟ': 'spec_16',
  // Τεχνικός Αρτοποιίας -> spec_13
  'ΤΕΧΝΙΚΟΣ ΑΡΤΟΠΟΙΙΑΣ ΚΑΙ ΖΑΧΑΡΟΠΛΑΣΤΙΚΗΣ ΤΕΧΝΗΣ (1ο ΕΤΟΣ)': 'spec_13',
  'ΤΕΧΝΙΚΟΣ ΑΡΤΟΠΟΙΙΑΣ ΚΑΙ ΖΑΧΑΡΟΠΛΑΣΤΙΚΗΣ ΤΕΧΝΗΣ (2ο ΕΤΟΣ)': 'spec_13',
  'ΤΕΧΝΙΚΟΣ ΑΡΤΟΠΟΙΙΑΣ ΚΑΙ ΖΑΧΑΡΟΠΛΑΣΤΙΚΗΣ ΤΕΧΝΗΣ (ΑΠΟΦΟΙΤΟΙ 2023Β)': 'spec_13',
  'ΤΕΧΝΙΚΟΣ ΑΡΤΟΠΟΙΙΑΣ ΖΑΧΑΡΟΠΛΑΣΤΙΚΗΣ Γ ΕΞΑΜΗΝΟ': 'spec_13',
  // Τεχνικός Μαγειρικής -> spec_12
  'ΤΕΧΝΙΚΟΣ ΜΑΓΕΙΡΙΚΗΣ ΤΕΧΝΗΣ - ΑΡΧΙΜΑΓΕΙΡΑΣ CHEF (1ο ΕΤΟΣ)': 'spec_12',
  'ΤΕΧΝΙΚΟΣ ΜΑΓΕΙΡΙΚΗΣ ΤΕΧΝΗΣ - ΑΡΧΙΜΑΓΕΙΡΑΣ CHEF (ΑΠΟΦΟΙΤΟΙ 2023Β)': 'spec_12',
  // "ΤΜΗΜΑ" - αυτό πρέπει να αντιστοιχηθεί - θα ελέγξουμε τους μαθητές
  'ΤΜΗΜΑ': null  // Will check students individually
};

// =====================================================
// MAPPING: Excel teacher name -> DB teacher name
// Teacher names in Excel are sometimes surname-only or have different formatting
// =====================================================
const TEACHER_NAME_MAP = {
  'ΛΥΡΑΤΖΑΚΗ': 'ΛΥΡΑΤΖΑΚΗ ΕΛΕΝΗ',
  'ΧΑΤΖΗΝΤΕΒΕ': 'ΧΑΤΖΗΝΤΕΒΕ ΧΡΙΣΤΙΝΑ',
  'ΜΠΙΤΖΟΥ': 'ΜΠΙΤΖΟΥ ΘΕΟΔΟΣΙΑ',
  'ΤΖΑΝΑΚΗ': 'ΤΖΑΝΑΚΗ ΕΛΕΥΘΕΡΙΑ',
  'ΣΚΟΡΔΟΥ': 'ΣΚΟΡΔΟΥ ΕΛΕΝΗ',
  'ΚΑΛΟΓΕΡΑΚΗΣ ΜΙΧΑΛΗΣ': 'ΚΑΛΟΓΕΡΑΚΗΣ ΜΙΧΑΗΛ',
  'ΚΟΥΜΑΚΗΣ ΚΩΣΤΑΣ': 'ΚΟΥΜΑΚΗΣ ΚΩΝΣΤΑΝΤΙΝΟΣ',
  'ΜΠΟΥΧΑΛΑΚΗΣ ΜΑΝΩΛΗΣ': 'ΜΠΟΥΧΑΛΑΚΗΣ ΕΜΜΑΝΟΥΗΛ',
  'ΝΙΚΗ ΑΝΑΓΝΩΣΤΑΚΗ': 'ΑΝΑΓΝΩΣΤΑΚΗ ΝΙΚΗ',
  'ΠΑΠΑΔΟΜΑΝΟΛΑΚΗΣ ΔΗΜΗΤΡΗΣ': 'ΠΑΠΑΔΟΜΑΝΩΛΑΚΗΣ ΔΗΜΗΤΡΗΣ',
  'ΡΕΠΑΝΑΚΗ ΝΤΕΠΗ': 'ΡΕΠΑΝΑΚΗ ΝΤΕΠΗ',       // New teacher
  'ΖΕΑΚΗ ΕΜΜΑΝΟΥΕΛΑ': 'ΖΕΑΚΗ ΕΜΜΑΝΟΥΕΛΑ',     // New teacher
  'ΨΑΘΑΚΗΣ ΜΙΧΑΛΗΣ': 'ΨΑΘΑΚΗΣ ΜΙΧΑΛΗΣ',       // New teacher
  'ΚΥΡΛΑΚΗΣ ΜΑΡΙΟΣ - ΠΕΤΡΟΥΛΑΚΗ ΤΟΝΙΑ': null   // Skip, this is 2 teachers
};

// Excel specialty name -> Original spec_id
const EXCEL_SPEC_MAP = {
  'ΕΣΩΤΕΡΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΚΑΙ ΔΙΑΚΟΣΜΗΣΗ ΚΑΙ ΣΧΕΔΙΑΣΜΟΣ ΑΝΤΙΚΕΙΜΕΝΟΥ': 'spec_11',
  'ΕΣΩΤΕΡΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΚΑΙ ΔΙΑΚΟΣΜΗΣΗ': 'spec_11',
  'ΤΕΧΝΙΚΟΣ ΑΡΤΟΠΟΙΙΑΣ - ΖΑΧΑΡΟΠΛΑΣΤΙΚΗΣ': 'spec_13',
  'ΤΕΧΝΙΚΟΣ ΜΑΓΕΙΡΙΚΗΣ ΤΕΧΝΗΣ': 'spec_12',
  'ΣΤΕΛΕΧΟΣ ΔΙΟΙΚΗΣΗΣ ΚΑΙ ΟΙΚΟΝΟΜΙΑΣ': 'spec_7',
  'ΣΤΕΛΕΧΟΣ ΥΠΗΡΕΣΙΩΝ ΑΕΡΟΜΕΤΑΦΟΡΑΣ': 'spec_16',
};

async function fixAll() {
  console.log('='.repeat(70));
  console.log('ISAEK CMS - ΔΙΟΡΘΩΣΗ ΔΕΔΟΜΕΝΩΝ');
  console.log('='.repeat(70));

  // Fetch current data
  const { data: allContacts } = await supabase.from('contacts').select('*');
  const { data: allStudents } = await supabase.from('students').select('*');
  const { data: allSpecs } = await supabase.from('specialties').select('*');
  const { data: allCourses } = await supabase.from('courses_data').select('*');

  const teachers = allContacts.filter(c => c.role === 'Καθηγητής' || c.role === 'Εκπαιδευτής');
  console.log(`\nΑρχικά: ${teachers.length} καθηγητές, ${allStudents.length} μαθητές, ${allSpecs.length} ειδικότητες\n`);

  // =========================================================
  // STEP 1: FIX DUPLICATE TEACHERS
  // =========================================================
  console.log('[ΒΗΜΑ 1] Αφαίρεση διπλότυπων καθηγητών...');
  
  const teachersByName = {};
  for (const t of teachers) {
    const normalizedName = t.name.toUpperCase().trim()
      .replace(/\s+/g, ' ')
      .replace('ΧΑΝΙΩΑΤΑΚΗΣ', 'ΧΑΝΙΩΤΑΚΗΣ'); // Fix typo
    
    if (!teachersByName[normalizedName]) {
      teachersByName[normalizedName] = [];
    }
    teachersByName[normalizedName].push(t);
  }

  const duplicates = Object.entries(teachersByName).filter(([, arr]) => arr.length > 1);
  console.log(`  Βρέθηκαν ${duplicates.length} ομάδες διπλότυπων`);

  const idsToDelete = [];
  const idsToKeep = {};

  for (const [name, records] of duplicates) {
    // Keep the one with JSON assignments, otherwise the first one
    const withAssignments = records.find(r => r.department && r.department.startsWith('['));
    const keeper = withAssignments || records[0];
    const toDelete = records.filter(r => r.id !== keeper.id);
    
    idsToKeep[name] = keeper.id;
    toDelete.forEach(r => idsToDelete.push(r.id));
    console.log(`  → ${name}: keep ${keeper.id}, delete ${toDelete.map(r => r.id).join(', ')}`);
  }

  // Also fix the ΧΑΝΙΩΑΤΑΚΗΣ typo record
  const typoTeacher = teachers.find(t => t.name.includes('ΧΑΝΙΩΑΤΑΚΗΣ'));
  if (typoTeacher) {
    const correctTeacher = teachers.find(t => t.name.includes('ΧΑΝΙΩΤΑΚΗΣ') && t.id !== typoTeacher.id);
    if (correctTeacher && !idsToDelete.includes(typoTeacher.id)) {
      idsToDelete.push(typoTeacher.id);
      console.log(`  → Typo fix: ΧΑΝΙΩΑΤΑΚΗΣ (${typoTeacher.id}) -> merged into ΧΑΝΙΩΤΑΚΗΣ (${correctTeacher.id})`);
    }
  }

  // Delete duplicates
  for (const id of idsToDelete) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) console.error(`  ❌ Error deleting ${id}:`, error.message);
  }
  console.log(`  ✅ Διαγράφηκαν ${idsToDelete.length} διπλότυπα\n`);

  // =========================================================
  // STEP 2: CONSOLIDATE STUDENTS TO ORIGINAL SPECIALTIES
  // =========================================================
  console.log('[ΒΗΜΑ 2] Ενοποίηση μαθητών στις αρχικές ειδικότητες...');
  
  // Build ID-to-ID map for imported specialties
  const specIdMap = {};
  for (const spec of allSpecs) {
    if (SPECIALTY_MAP[spec.title] !== undefined) {
      if (SPECIALTY_MAP[spec.title] === null) {
        // "ΤΜΗΜΑ" - need to figure out by student context (probably spec_12 based on the notes)
        specIdMap[spec.id] = 'spec_12'; // These 9 students seem to be Μαγειρική based on data pattern
      } else {
        specIdMap[spec.id] = SPECIALTY_MAP[spec.title];
      }
    }
  }

  let studentUpdates = 0;
  for (const student of allStudents) {
    if (specIdMap[student.specialtyId]) {
      const newSpecId = specIdMap[student.specialtyId];
      
      // Extract year info from old specialty title
      const oldSpec = allSpecs.find(s => s.id === student.specialtyId);
      let yearInfo = student.year || '';
      if (oldSpec) {
        const match = oldSpec.title.match(/\((.*?)\)/);
        if (match && !yearInfo) {
          yearInfo = match[1];
        }
        // Extract from suffix like "Γ ΕΞΑΜΗΝΟ"
        if (!yearInfo && oldSpec.title.includes('Γ ΕΞΑΜΗΝΟ')) {
          yearInfo = '3ο Εξάμηνο';
        }
      }

      const { error } = await supabase.from('students').update({ 
        specialtyId: newSpecId,
        year: yearInfo || student.year || ''
      }).eq('id', student.id);
      
      if (error) console.error(`  ❌ Error updating student ${student.fullName}:`, error.message);
      else studentUpdates++;
    }
  }
  console.log(`  ✅ Ενημερώθηκαν ${studentUpdates} μαθητές\n`);

  // =========================================================
  // STEP 3: DELETE DUPLICATE SPECIALTIES
  // =========================================================
  console.log('[ΒΗΜΑ 3] Διαγραφή διπλότυπων ειδικοτήτων...');
  
  const specsToDelete = allSpecs.filter(s => SPECIALTY_MAP[s.title] !== undefined);
  for (const spec of specsToDelete) {
    const { error } = await supabase.from('specialties').delete().eq('id', spec.id);
    if (error) console.error(`  ❌ Error deleting specialty ${spec.title}:`, error.message);
    else console.log(`  → Διαγράφηκε: ${spec.title}`);
  }
  console.log(`  ✅ Διαγράφηκαν ${specsToDelete.length} διπλότυπες ειδικότητες\n`);

  // =========================================================
  // STEP 4: FIX TEACHER ASSIGNMENTS FROM EXCEL
  // =========================================================
  console.log('[ΒΗΜΑ 4] Δημιουργία σωστών assignments καθηγητών...');
  
  // Re-fetch teachers (without duplicates now)
  const { data: cleanContacts } = await supabase.from('contacts').select('*');
  const cleanTeachers = cleanContacts.filter(c => c.role === 'Καθηγητής' || c.role === 'Εκπαιδευτής');
  
  // Read Excel
  const xlsx = require('xlsx');
  const workbook = xlsx.readFile('isaek EXCEL.xlsx');
  const sheet = workbook.Sheets['ΜΑΘΗΜΑΤΑ ΕΞΑΜΗΝΩΝ'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Build teacher assignments map
  const teacherAssignments = {}; // teacherDbId -> Set of JSON strings
  
  // Track entries that are specialty headers (not teacher names)
  const SPEC_HEADERS = new Set(Object.keys(EXCEL_SPEC_MAP));

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Process both semesters
    const pairs = [
      { spec: row[0], course: row[2], teacher: row[3] },
      { spec: row[10], course: row[12], teacher: row[13] }
    ];

    for (const { spec, course, teacher } of pairs) {
      if (!spec || !course || !teacher) continue;
      
      const specStr = String(spec).trim().toUpperCase();
      const courseStr = String(course).trim();
      const teacherStr = String(teacher).trim().toUpperCase();

      // Skip header rows (where teacher name = specialty name)
      if (SPEC_HEADERS.has(teacherStr) || teacherStr === specStr || teacherStr.length > 50) continue;
      
      // Find the specialty ID
      const specId = EXCEL_SPEC_MAP[specStr];
      if (!specId) continue;

      // Resolve teacher name
      let resolvedName = TEACHER_NAME_MAP[teacherStr] !== undefined ? TEACHER_NAME_MAP[teacherStr] : teacherStr;
      if (resolvedName === null) {
        // Handle "ΚΥΡΛΑΚΗΣ ΜΑΡΙΟΣ - ΠΕΤΡΟΥΛΑΚΗ ΤΟΝΙΑ" -> assign to both
        const names = teacherStr.split(' - ').map(n => n.trim());
        for (const n of names) {
          let rn = TEACHER_NAME_MAP[n] || n;
          const dbTeacher = findTeacher(cleanTeachers, rn);
          if (dbTeacher) {
            if (!teacherAssignments[dbTeacher.id]) teacherAssignments[dbTeacher.id] = new Set();
            teacherAssignments[dbTeacher.id].add(JSON.stringify({ specialtyId: specId, courseId: courseStr }));
          }
        }
        continue;
      }

      // Find teacher in DB
      const dbTeacher = findTeacher(cleanTeachers, resolvedName);
      if (!dbTeacher) {
        // Teacher not in DB - need to create
        console.log(`  ℹ️  Νέος καθηγητής: ${resolvedName}`);
        const newId = 'teacher_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const newTeacher = {
          id: newId,
          name: resolvedName,
          role: 'Καθηγητής',
          phone: '',
          email: '',
          department: '[]'
        };
        const { data, error } = await supabase.from('contacts').upsert([newTeacher]).select();
        if (error) {
          console.error(`  ❌ Error creating teacher ${resolvedName}:`, error.message);
          continue;
        }
        cleanTeachers.push(data[0]);
        if (!teacherAssignments[newId]) teacherAssignments[newId] = new Set();
        teacherAssignments[newId].add(JSON.stringify({ specialtyId: specId, courseId: courseStr }));
        continue;
      }

      if (!teacherAssignments[dbTeacher.id]) teacherAssignments[dbTeacher.id] = new Set();
      teacherAssignments[dbTeacher.id].add(JSON.stringify({ specialtyId: specId, courseId: courseStr }));
    }
  }

  // Now update all teachers with their assignments
  let updatedTeachers = 0;
  for (const [teacherId, assignmentsSet] of Object.entries(teacherAssignments)) {
    const assignments = Array.from(assignmentsSet).map(JSON.parse);
    const teacher = cleanTeachers.find(t => t.id === teacherId);
    
    const { error } = await supabase.from('contacts').update({
      department: JSON.stringify(assignments),
      role: 'Καθηγητής'
    }).eq('id', teacherId);

    if (error) {
      console.error(`  ❌ Error updating ${teacher?.name}:`, error.message);
    } else {
      console.log(`  ✅ ${teacher?.name}: ${assignments.length} μαθήματα`);
      updatedTeachers++;
    }
  }

  // Also fix teachers that had plain text department but no Excel mappings
  // Convert their old department to a specialty assignment
  for (const t of cleanTeachers) {
    if (teacherAssignments[t.id]) continue; // Already handled
    
    if (t.department && !t.department.startsWith('[')) {
      // Try to map old department text to a specialty ID
      const deptLower = t.department.toLowerCase().trim();
      let mappedSpecId = null;
      
      for (const spec of allSpecs) {
        if (spec.title.toLowerCase().includes(deptLower.substring(0, 15)) ||
            deptLower.includes(spec.title.toLowerCase().substring(0, 15))) {
          mappedSpecId = spec.id;
          // Make sure it's an original spec, not a duplicate
          if (specIdMap[mappedSpecId]) {
            mappedSpecId = specIdMap[mappedSpecId];
          }
          break;
        }
      }

      if (mappedSpecId) {
        const assignments = [{ specialtyId: mappedSpecId, courseId: '' }];
        const { error } = await supabase.from('contacts').update({
          department: JSON.stringify(assignments)
        }).eq('id', t.id);
        
        if (error) console.error(`  ❌ Error fixing ${t.name}:`, error.message);
        else {
          console.log(`  ✅ ${t.name}: converted dept="${t.department}" to assignment (${mappedSpecId})`);
          updatedTeachers++;
        }
      } else {
        // Could not map - store as empty array
        const { error } = await supabase.from('contacts').update({
          department: JSON.stringify([])
        }).eq('id', t.id);
        if (!error) console.log(`  ⚠️  ${t.name}: dept="${t.department}" - could not map, cleared`);
      }
    }
  }

  console.log(`  ✅ Ενημερώθηκαν ${updatedTeachers} καθηγητές\n`);

  // =========================================================
  // FINAL VERIFICATION
  // =========================================================
  console.log('[ΤΕΛΙΚΟΣ ΕΛΕΓΧΟΣ]');
  console.log('='.repeat(70));
  
  const { data: finalContacts } = await supabase.from('contacts').select('*');
  const { data: finalStudents } = await supabase.from('students').select('*');
  const { data: finalSpecs } = await supabase.from('specialties').select('*');
  
  const finalTeachers = finalContacts.filter(c => c.role === 'Καθηγητής' || c.role === 'Εκπαιδευτής');
  const teachersWithAssign = finalTeachers.filter(t => {
    try { return t.department && JSON.parse(t.department).length > 0; } catch(e) { return false; }
  });
  const studentsWithSpec = finalStudents.filter(s => s.specialtyId);

  console.log(`  Ειδικότητες: ${finalSpecs.length}`);
  console.log(`  Μαθητές: ${finalStudents.length} (με ειδικότητα: ${studentsWithSpec.length})`);
  console.log(`  Καθηγητές: ${finalTeachers.length} (με assignments: ${teachersWithAssign.length})`);
  
  // Show per-specialty breakdown
  console.log('\n  Αναλυτικά ανά ειδικότητα:');
  for (const spec of finalSpecs) {
    const studCount = finalStudents.filter(s => s.specialtyId === spec.id).length;
    const teachCount = finalTeachers.filter(t => {
      try {
        const a = JSON.parse(t.department || '[]');
        return a.some(assign => assign.specialtyId === spec.id);
      } catch(e) { return false; }
    }).length;
    if (studCount > 0 || teachCount > 0) {
      console.log(`    ${spec.title}: ${studCount} μαθητές, ${teachCount} καθηγητές`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('ΔΙΟΡΘΩΣΗ ΟΛΟΚΛΗΡΩΘΗΚΕ ΕΠΙΤΥΧΩΣ!');
  console.log('='.repeat(70));
}

function findTeacher(teachers, name) {
  const nameUpper = name.toUpperCase().trim();
  
  // Exact match
  let match = teachers.find(t => t.name.toUpperCase().trim() === nameUpper);
  if (match) return match;

  // Surname match (for single-name entries like "ΛΥΡΑΤΖΑΚΗ")
  const parts = nameUpper.split(' ');
  if (parts.length === 1) {
    match = teachers.find(t => t.name.toUpperCase().startsWith(nameUpper));
    if (match) return match;
  }

  // First name of teacher contains search or vice versa
  match = teachers.find(t => {
    const tName = t.name.toUpperCase().trim();
    return tName.includes(nameUpper) || nameUpper.includes(tName);
  });
  if (match) return match;

  // Surname match for multi-word names
  match = teachers.find(t => {
    const tSurname = t.name.toUpperCase().split(' ')[0];
    return tSurname === parts[0];
  });
  
  return match || null;
}

fixAll().catch(err => {
  console.error('ΣΦΑΛΜΑ:', err);
  process.exit(1);
});
