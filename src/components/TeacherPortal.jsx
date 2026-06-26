import React, { useState, useMemo } from 'react';
import { BookOpen, CheckCircle, FileText, Calendar as CalendarIcon, Clock, Users, ArrowLeft, Save } from 'lucide-react';

export default function TeacherPortal({ 
  teacher, 
  events, 
  students, 
  specialties, 
  absences, 
  setAbsences, 
  grades, 
  setGrades,
  teacherReports,
  setTeacherReports,
  sections = [],
  courses = {},
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'grades'
  
  // State for Report Form
  const [reportSectionId, setReportSectionId] = useState('');
  const [reportCourse, setReportCourse] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportHours, setReportHours] = useState('');
  const [currentReportAbsences, setCurrentReportAbsences] = useState({});
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // State for Grades Form
  const [gradesSectionId, setGradesSectionId] = useState('');
  const [gradesCourse, setGradesCourse] = useState('');
  const [currentGrades, setCurrentGrades] = useState({});
  const [gradesSubmitted, setGradesSubmitted] = useState(false);

  // --- Handlers for Report Tab ---
  
  const selectedReportSection = useMemo(() => sections.find(s => s.id === reportSectionId), [sections, reportSectionId]);
  
  const reportCoursesOptions = useMemo(() => {
    if (!selectedReportSection) return [];
    const specId = selectedReportSection.specialtyId;
    const sem = selectedReportSection.semester || 'semester1';
    const specCourses = courses[specId];
    if (specCourses && specCourses[sem]) {
      return specCourses[sem];
    }
    return [];
  }, [selectedReportSection, courses]);

  const reportStudents = useMemo(() => {
    if (!reportSectionId) return [];
    return students.filter(s => s.sectionId === reportSectionId);
  }, [students, reportSectionId]);

  const handleToggleAbsence = (studentId) => {
    setCurrentReportAbsences(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSubmitReport = () => {
    if (!reportSectionId || !reportCourse || !reportDate || !reportHours) {
      alert('Παρακαλώ συμπληρώστε όλα τα πεδία (Τμήμα, Μάθημα, Ημερομηνία, Ώρες).');
      return;
    }

    const hoursNum = parseInt(reportHours, 10);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('Οι ώρες πρέπει να είναι έγκυρος αριθμός.');
      return;
    }

    const specialtyTitle = specialties.find(s => s.id === selectedReportSection.specialtyId)?.title || 'Άγνωστη Ειδικότητα';

    // Update global absences state
    let updatedAbsences = [...absences];
    Object.keys(currentReportAbsences).forEach(studentId => {
      if (currentReportAbsences[studentId]) {
        updatedAbsences.push({
          id: `abs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          courseTitle: reportCourse,
          date: reportDate,
          hours: hoursNum,
          justified: false
        });
      }
    });
    setAbsences(updatedAbsences);

    // Save report for secretariat
    const absentStudentIds = Object.keys(currentReportAbsences).filter(id => currentReportAbsences[id]);
    const absentStudentNames = absentStudentIds.map(id => {
      const st = students.find(s => s.id === id);
      return st ? st.fullName : 'Άγνωστος';
    });

    const newReport = {
      id: `rep_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      sectionId: reportSectionId,
      sectionName: selectedReportSection.name,
      specialtyTitle,
      courseTitle: reportCourse,
      date: reportDate,
      hours: hoursNum,
      timestamp: new Date().toISOString(),
      absentStudents: absentStudentNames,
      status: 'submitted'
    };

    setTeacherReports(prev => [...prev, newReport]);
    setReportSubmitted(true);

    setTimeout(() => {
      setReportSubmitted(false);
      setReportCourse('');
      setReportHours('');
      setCurrentReportAbsences({});
    }, 3000);
  };


  // --- Handlers for Grades Tab ---

  const selectedGradesSection = useMemo(() => sections.find(s => s.id === gradesSectionId), [sections, gradesSectionId]);
  
  const gradesCoursesOptions = useMemo(() => {
    if (!selectedGradesSection) return [];
    const specId = selectedGradesSection.specialtyId;
    const sem = selectedGradesSection.semester || 'semester1';
    const specCourses = courses[specId];
    if (specCourses && specCourses[sem]) {
      return specCourses[sem];
    }
    return [];
  }, [selectedGradesSection, courses]);

  const gradesStudents = useMemo(() => {
    if (!gradesSectionId) return [];
    return students.filter(s => s.sectionId === gradesSectionId);
  }, [students, gradesSectionId]);

  // Load existing grades when course and section are selected
  React.useEffect(() => {
    if (gradesSectionId && gradesCourse) {
      const existing = {};
      gradesStudents.forEach(st => {
        const gradeRecord = grades.find(g => g.studentId === st.id && g.courseTitle === gradesCourse);
        if (gradeRecord) {
          existing[st.id] = {
            progressGrade: gradeRecord.progressGrade || '',
            finalGrade: gradeRecord.finalGrade || ''
          };
        }
      });
      setCurrentGrades(existing);
    } else {
      setCurrentGrades({});
    }
  }, [gradesSectionId, gradesCourse, grades, gradesStudents]);

  const handleGradeChange = (studentId, type, val) => {
    setCurrentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { progressGrade: '', finalGrade: '' }),
        [type]: val
      }
    }));
  };

  const handleSubmitGrades = () => {
    if (!gradesSectionId || !gradesCourse) {
      alert('Παρακαλώ επιλέξτε Τμήμα και Μάθημα.');
      return;
    }

    let updatedGrades = [...grades];
    Object.keys(currentGrades).forEach(studentId => {
      const { progressGrade, finalGrade } = currentGrades[studentId];
      if (progressGrade || finalGrade) {
        const existingIndex = updatedGrades.findIndex(g => g.studentId === studentId && g.courseTitle === gradesCourse);
        if (existingIndex >= 0) {
          updatedGrades[existingIndex] = {
            ...updatedGrades[existingIndex],
            progressGrade,
            finalGrade
          };
        } else {
          updatedGrades.push({
            id: `grd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId,
            courseTitle: gradesCourse,
            progressGrade,
            finalGrade
          });
        }
      }
    });

    setGrades(updatedGrades);
    setGradesSubmitted(true);
    setTimeout(() => setGradesSubmitted(false), 3000);
  };


  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Navbar */}
      <header style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {teacher.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{teacher.name}</h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Πύλη Εκπαιδευτή</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
        >
          Αποσύνδεση
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Καλώς ήρθατε, Καθηγητά</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('report')}
            style={{
              padding: '10px 20px', background: activeTab === 'report' ? '#eff6ff' : 'transparent',
              color: activeTab === 'report' ? '#2563eb' : '#64748b', border: activeTab === 'report' ? '1px solid #bfdbfe' : '1px solid transparent',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <CheckCircle size={18} /> ΑΝΑΦΟΡΑ
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            style={{
              padding: '10px 20px', background: activeTab === 'grades' ? '#eff6ff' : 'transparent',
              color: activeTab === 'grades' ? '#2563eb' : '#64748b', border: activeTab === 'grades' ? '1px solid #bfdbfe' : '1px solid transparent',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <FileText size={18} /> ΒΑΘΜΟΛΟΓΙΑ
          </button>
        </div>


        {/* Content: ΑΝΑΦΟΡΑ */}
        {activeTab === 'report' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>Δήλωση Μαθήματος & Απουσιών</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Τμήμα</label>
                <select 
                  value={reportSectionId}
                  onChange={(e) => { setReportSectionId(e.target.value); setReportCourse(''); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">Επιλέξτε Τμήμα...</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Μάθημα</label>
                <select 
                  value={reportCourse}
                  onChange={(e) => setReportCourse(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  disabled={!reportSectionId}
                >
                  <option value="">Επιλέξτε Μάθημα...</option>
                  {reportCoursesOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Ημερομηνία</label>
                <input 
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Ώρες Διδασκαλίας</label>
                <input 
                  type="number"
                  min="1"
                  max="8"
                  value={reportHours}
                  onChange={(e) => setReportHours(e.target.value)}
                  placeholder="π.χ. 3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            {reportSectionId && reportCourse ? (
              <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>Απουσιολόγιο ({reportStudents.length} σπουδαστές)</h3>
                {reportStudents.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Δεν βρέθηκαν σπουδαστές εγγεγραμμένοι σε αυτό το τμήμα.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {reportStudents.map(student => (
                      <label key={student.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', background: currentReportAbsences[student.id] ? '#fef2f2' : '#f8fafc', border: `1px solid ${currentReportAbsences[student.id] ? '#fecaca' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input 
                          type="checkbox"
                          checked={!!currentReportAbsences[student.id]}
                          onChange={() => handleToggleAbsence(student.id)}
                          style={{ width: '18px', height: '18px', marginRight: '12px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: currentReportAbsences[student.id] ? '#991b1b' : '#334155' }}>
                          {student.fullName}
                        </span>
                        {currentReportAbsences[student.id] && (
                          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#dc2626', fontWeight: '600', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                            Απών / Απούσα
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
                  {reportSubmitted && (
                    <span style={{ color: '#16a34a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={18} /> Η αναφορά υποβλήθηκε επιτυχώς!
                    </span>
                  )}
                  <button
                    onClick={handleSubmitReport}
                    disabled={reportSubmitted || reportStudents.length === 0}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: (reportSubmitted || reportStudents.length === 0) ? 0.7 : 1 }}
                  >
                    <Save size={18} /> Υποβολή Αναφοράς
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
                Επιλέξτε Τμήμα και Μάθημα για να φορτώσετε το απουσιολόγιο.
              </div>
            )}
          </div>
        )}

        {/* Content: ΒΑΘΜΟΛΟΓΙΑ */}
        {activeTab === 'grades' && (
           <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
           <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>Καταχώρηση Βαθμολογιών</h2>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Τμήμα</label>
               <select 
                 value={gradesSectionId}
                 onChange={(e) => { setGradesSectionId(e.target.value); setGradesCourse(''); }}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
               >
                 <option value="">Επιλέξτε Τμήμα...</option>
                 {sections.map(s => (
                   <option key={s.id} value={s.id}>{s.name}</option>
                 ))}
               </select>
             </div>

             <div>
               <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Μάθημα</label>
               <select 
                 value={gradesCourse}
                 onChange={(e) => setGradesCourse(e.target.value)}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                 disabled={!gradesSectionId}
               >
                 <option value="">Επιλέξτε Μάθημα...</option>
                 {gradesCoursesOptions.map((c, i) => (
                   <option key={i} value={c}>{c}</option>
                 ))}
               </select>
             </div>
           </div>

           {gradesSectionId && gradesCourse ? (
             <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>Σπουδαστές ({gradesStudents.length})</h3>
               
               {gradesStudents.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Δεν βρέθηκαν σπουδαστές εγγεγραμμένοι σε αυτό το τμήμα.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px', color: '#475569', fontWeight: '600', fontSize: '14px' }}>Σπουδαστής</th>
                          <th style={{ padding: '12px', color: '#475569', fontWeight: '600', fontSize: '14px', width: '20%' }}>Βαθμός Προόδου</th>
                          <th style={{ padding: '12px', color: '#475569', fontWeight: '600', fontSize: '14px', width: '20%' }}>Τελικός Βαθμός</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradesStudents.map(student => (
                          <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px', fontWeight: '500', color: '#0f172a' }}>{student.fullName}</td>
                            <td style={{ padding: '12px' }}>
                              <input 
                                type="text"
                                placeholder="π.χ. 8"
                                value={currentGrades[student.id]?.progressGrade || ''}
                                onChange={(e) => handleGradeChange(student.id, 'progressGrade', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input 
                                type="text"
                                placeholder="π.χ. 9"
                                value={currentGrades[student.id]?.finalGrade || ''}
                                onChange={(e) => handleGradeChange(student.id, 'finalGrade', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                  {gradesSubmitted && (
                    <span style={{ color: '#16a34a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={18} /> Η βαθμολογία αποθηκεύτηκε!
                    </span>
                  )}
                  <button
                    onClick={handleSubmitGrades}
                    disabled={gradesSubmitted || gradesStudents.length === 0}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: (gradesSubmitted || gradesStudents.length === 0) ? 0.7 : 1 }}
                  >
                    <Save size={18} /> Αποθήκευση Βαθμολογίας
                  </button>
                </div>
             </div>
           ) : (
             <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
               Επιλέξτε Τμήμα και Μάθημα για να δείτε τη λίστα σπουδαστών.
             </div>
           )}
         </div>
        )}

      </div>
    </div>
  );
}
