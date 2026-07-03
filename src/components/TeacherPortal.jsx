import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, FileText, Calendar as CalendarIcon, Clock, Users, 
  Save, LogOut, BarChart3, ClipboardList, GraduationCap, ChevronDown,
  AlertCircle, TrendingUp, History, X, Check, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Report state
  const [reportSpecialtyId, setReportSpecialtyId] = useState(() => localStorage.getItem('tp_specialtyId') || '');
  const [reportCourse, setReportCourse] = useState(() => localStorage.getItem('tp_course') || '');
  const [reportDate, setReportDate] = useState(() => localStorage.getItem('tp_date') || new Date().toISOString().split('T')[0]);
  const [reportArrivalTime, setReportArrivalTime] = useState(() => localStorage.getItem('tp_arrivalTime') || '');
  const [reportDepartureTime, setReportDepartureTime] = useState(() => localStorage.getItem('tp_departureTime') || '');

  useEffect(() => {
    localStorage.setItem('tp_specialtyId', reportSpecialtyId);
    localStorage.setItem('tp_course', reportCourse);
    localStorage.setItem('tp_date', reportDate);
    localStorage.setItem('tp_arrivalTime', reportArrivalTime);
    localStorage.setItem('tp_departureTime', reportDepartureTime);
  }, [reportSpecialtyId, reportCourse, reportDate, reportArrivalTime, reportDepartureTime]);
  const [currentReportAbsences, setCurrentReportAbsences] = useState({});
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);

  // Grades state
  const [gradesSpecialtyId, setGradesSpecialtyId] = useState('');
  const [gradesCourse, setGradesCourse] = useState('');
  const [currentGrades, setCurrentGrades] = useState({});
  const [gradesSubmitted, setGradesSubmitted] = useState(false);
  const [gradesSaving, setGradesSaving] = useState(false);

  // ──────────────────────────────────────────────
  // Derive teacher's assignments
  // ──────────────────────────────────────────────
  const teacherAssignments = useMemo(() => {
    return teacher.assignments || [];
  }, [teacher]);

  // Get unique specialty IDs this teacher teaches
  const teacherSpecialtyIds = useMemo(() => {
    return [...new Set(teacherAssignments.map(a => a.specialtyId))];
  }, [teacherAssignments]);

  // Get the actual specialty objects
  const teacherSpecialties = useMemo(() => {
    return specialties.filter(s => teacherSpecialtyIds.includes(s.id));
  }, [specialties, teacherSpecialtyIds]);

  // Get courses for a selected specialty (from teacher's assignments)
  const getTeacherCourses = (specId) => {
    return teacherAssignments
      .filter(a => a.specialtyId === specId && a.courseId)
      .map(a => a.courseId);
  };

  // Get students for a specialty
  const getStudentsForSpecialty = (specId) => {
    return students.filter(s => s.specialtyId === specId);
  };

  // Calculate hours from arrival/departure
  const calculatedHours = useMemo(() => {
    if (!reportArrivalTime || !reportDepartureTime) return null;
    const [aH, aM] = reportArrivalTime.split(':').map(Number);
    const [dH, dM] = reportDepartureTime.split(':').map(Number);
    const totalMinutes = (dH * 60 + dM) - (aH * 60 + aM);
    if (totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return { hours, mins, totalMinutes };
  }, [reportArrivalTime, reportDepartureTime]);

  // ──────────────────────────────────────────────
  // REPORT HANDLERS
  // ──────────────────────────────────────────────
  const reportStudents = useMemo(() => {
    if (!reportSpecialtyId) return [];
    return getStudentsForSpecialty(reportSpecialtyId);
  }, [reportSpecialtyId, students]);

  const reportCourseOptions = useMemo(() => {
    if (!reportSpecialtyId) return [];
    return getTeacherCourses(reportSpecialtyId);
  }, [reportSpecialtyId, teacherAssignments]);

  const handleToggleAbsence = (studentId) => {
    setCurrentReportAbsences(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSubmitReport = async () => {
    if (!reportSpecialtyId || !reportCourse || !reportDate || !reportArrivalTime || !reportDepartureTime) {
      alert('Παρακαλώ συμπληρώστε όλα τα πεδία.');
      return;
    }
    if (!calculatedHours || calculatedHours.totalMinutes <= 0) {
      alert('Η ώρα αναχώρησης πρέπει να είναι μετά την ώρα άφιξης.');
      return;
    }

    setReportSaving(true);
    try {
      const specialtyTitle = specialties.find(s => s.id === reportSpecialtyId)?.title || '';

      // Save absences
      const newAbsences = [];
      Object.keys(currentReportAbsences).forEach(studentId => {
        if (currentReportAbsences[studentId]) {
          newAbsences.push({
            id: `abs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId,
            courseTitle: reportCourse,
            date: reportDate,
            hours: calculatedHours.hours || 1,
            type: 'absence',
            notes: `Ώρα: ${reportArrivalTime} - ${reportDepartureTime}`
          });
        }
      });
      
      if (newAbsences.length > 0) {
        await api.upsertAbsences(newAbsences);
        setAbsences(prev => [...prev, ...newAbsences]);
      }

      // Save report
      const absentStudentNames = Object.keys(currentReportAbsences)
        .filter(id => currentReportAbsences[id])
        .map(id => {
          const st = students.find(s => s.id === id);
          return st ? st.fullName : 'Άγνωστος';
        });

      const newReport = {
        id: `rep_${Date.now()}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        sectionId: reportSpecialtyId,
        sectionName: specialtyTitle,
        specialtyTitle,
        courseTitle: reportCourse,
        date: reportDate,
        hours: calculatedHours.hours || 1,
        timestamp: new Date().toISOString(),
        absentStudents: absentStudentNames,
        status: 'submitted',
        arrivalTime: reportArrivalTime,
        departureTime: reportDepartureTime
      };

      const savedReport = await api.upsertTeacherReport(newReport);
      setTeacherReports(prev => [...prev, savedReport]);
      
      localStorage.removeItem('tp_specialtyId');
      localStorage.removeItem('tp_course');
      localStorage.removeItem('tp_date');
      localStorage.removeItem('tp_arrivalTime');
      localStorage.removeItem('tp_departureTime');

      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportCourse('');
        setReportArrivalTime('');
        setReportDepartureTime('');
        setCurrentReportAbsences({});
      }, 3000);
    } catch (e) {
      alert('Σφάλμα: ' + e.message);
    } finally {
      setReportSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // GRADES HANDLERS
  // ──────────────────────────────────────────────
  const gradesCourseOptions = useMemo(() => {
    if (!gradesSpecialtyId) return [];
    return getTeacherCourses(gradesSpecialtyId);
  }, [gradesSpecialtyId, teacherAssignments]);

  const gradesStudents = useMemo(() => {
    if (!gradesSpecialtyId) return [];
    return getStudentsForSpecialty(gradesSpecialtyId);
  }, [gradesSpecialtyId, students]);

  useEffect(() => {
    if (gradesSpecialtyId && gradesCourse) {
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
  }, [gradesSpecialtyId, gradesCourse, grades, gradesStudents]);

  const handleGradeChange = (studentId, type, val) => {
    setCurrentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { progressGrade: '', finalGrade: '' }),
        [type]: val
      }
    }));
  };

  const handleSubmitGrades = async () => {
    if (!gradesSpecialtyId || !gradesCourse) {
      alert('Παρακαλώ επιλέξτε Ειδικότητα και Μάθημα.');
      return;
    }
    setGradesSaving(true);
    try {
      const toSave = [];
      Object.keys(currentGrades).forEach(studentId => {
        const { progressGrade, finalGrade } = currentGrades[studentId];
        if (progressGrade || finalGrade) {
          const existing = grades.find(g => g.studentId === studentId && g.courseTitle === gradesCourse);
          toSave.push({
            id: existing?.id || `grd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId,
            courseTitle: gradesCourse,
            progressGrade,
            finalGrade
          });
        }
      });

      if (toSave.length > 0) {
        await api.upsertGrades(toSave);
        setGrades(prev => {
          let updated = [...prev];
          toSave.forEach(ug => {
            const idx = updated.findIndex(g => g.id === ug.id);
            if (idx >= 0) updated[idx] = ug;
            else updated.push(ug);
          });
          return updated;
        });
      }

      setGradesSubmitted(true);
      setTimeout(() => setGradesSubmitted(false), 3000);
    } catch (e) {
      alert('Σφάλμα: ' + e.message);
    } finally {
      setGradesSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // STATS for dashboard
  // ──────────────────────────────────────────────
  const myReports = useMemo(() => {
    return teacherReports.filter(r => r.teacherId === teacher.id);
  }, [teacherReports, teacher.id]);

  const totalStudents = useMemo(() => {
    const ids = new Set();
    teacherSpecialtyIds.forEach(specId => {
      students.filter(s => s.specialtyId === specId).forEach(s => ids.add(s.id));
    });
    return ids.size;
  }, [students, teacherSpecialtyIds]);

  const totalCourses = useMemo(() => {
    return teacherAssignments.filter(a => a.courseId).length;
  }, [teacherAssignments]);

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
  const tabs = [
    { id: 'dashboard', label: 'Αρχική', icon: <BarChart3 size={18} /> },
    { id: 'report', label: 'Αναφορά', icon: <ClipboardList size={18} /> },
    { id: 'grades', label: 'Βαθμολογία', icon: <GraduationCap size={18} /> },
    { id: 'history', label: 'Ιστορικό', icon: <History size={18} /> },
  ];

  return (
    <div className="tp-container">
      {/* ─── HEADER ─── */}
      <header className="tp-header">
        <div className="tp-header-left">
          <div className="tp-avatar">{teacher.name.charAt(0)}</div>
          <div>
            <h2 className="tp-teacher-name">{teacher.name}</h2>
            <span className="tp-subtitle">Πύλη Εκπαιδευτή ΙΣΑΕΚ</span>
          </div>
        </div>
        <button className="tp-logout-btn" onClick={onLogout}>
          <LogOut size={16} /> Αποσύνδεση
        </button>
      </header>

      {/* ─── TABS ─── */}
      <nav className="tp-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tp-tab ${activeTab === tab.id ? 'tp-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ─── CONTENT ─── */}
      <main className="tp-main">

        {/* ═══ DASHBOARD ═══ */}
        {activeTab === 'dashboard' && (
          <div className="tp-dashboard">
            <h1 className="tp-welcome">Καλώς ήρθατε, <span className="tp-name-highlight">{teacher.name.split(' ')[0]}</span></h1>
            
            {/* Stats Row */}
            <div className="tp-stats-row">
              <div className="tp-stat-card tp-stat-blue">
                <BookOpen size={24} />
                <div>
                  <span className="tp-stat-number">{totalCourses}</span>
                  <span className="tp-stat-label">Μαθήματα</span>
                </div>
              </div>
              <div className="tp-stat-card tp-stat-green">
                <Users size={24} />
                <div>
                  <span className="tp-stat-number">{totalStudents}</span>
                  <span className="tp-stat-label">Μαθητές</span>
                </div>
              </div>
              <div className="tp-stat-card tp-stat-purple">
                <FileText size={24} />
                <div>
                  <span className="tp-stat-number">{myReports.length}</span>
                  <span className="tp-stat-label">Αναφορές</span>
                </div>
              </div>
              <div className="tp-stat-card tp-stat-amber">
                <TrendingUp size={24} />
                <div>
                  <span className="tp-stat-number">{teacherSpecialties.length}</span>
                  <span className="tp-stat-label">Ειδικότητες</span>
                </div>
              </div>
            </div>

            {/* My Courses Grid */}
            <h2 className="tp-section-title">Τα Μαθήματά Μου</h2>
            <div className="tp-courses-grid">
              {teacherSpecialties.map(spec => {
                const myCourses = getTeacherCourses(spec.id);
                const myStudents = getStudentsForSpecialty(spec.id);
                return (
                  <div key={spec.id} className="tp-course-card">
                    <div className="tp-course-card-header">
                      <GraduationCap size={20} />
                      <span>{spec.title}</span>
                    </div>
                    <div className="tp-course-card-body">
                      <div className="tp-course-meta">
                        <span><Users size={14} /> {myStudents.length} μαθητές</span>
                        <span><BookOpen size={14} /> {myCourses.length} μαθήματα</span>
                      </div>
                      <div className="tp-course-list">
                        {myCourses.map((c, i) => (
                          <div key={i} className="tp-course-item">
                            <ArrowRight size={12} /> {c}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="tp-course-card-action"
                      onClick={() => { setReportSpecialtyId(spec.id); setActiveTab('report'); }}
                    >
                      <ClipboardList size={14} /> Νέα Αναφορά
                    </button>
                  </div>
                );
              })}
              {teacherSpecialties.length === 0 && (
                <div className="tp-empty-state">
                  <AlertCircle size={32} />
                  <p>Δεν βρέθηκαν αντιστοιχισμένα μαθήματα.</p>
                  <small>Επικοινωνήστε με τη γραμματεία.</small>
                </div>
              )}
            </div>

            {/* Recent Reports */}
            {myReports.length > 0 && (
              <>
                <h2 className="tp-section-title">Πρόσφατες Αναφορές</h2>
                <div className="tp-recent-reports">
                  {myReports.slice(-3).reverse().map(r => (
                    <div key={r.id} className="tp-report-mini">
                      <div className="tp-report-mini-left">
                        <span className="tp-report-mini-date">{r.date}</span>
                        <span className="tp-report-mini-course">{r.courseTitle}</span>
                      </div>
                      <div className="tp-report-mini-right">
                        <span className="tp-report-mini-hours">
                          {r.arrivalTime && r.departureTime 
                            ? `${r.arrivalTime} - ${r.departureTime}` 
                            : `${r.hours} ώρ.`}
                        </span>
                        <span className="tp-report-mini-status">✓ Υποβλήθηκε</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ REPORT TAB ═══ */}
        {activeTab === 'report' && (
          <div className="tp-report-view">
            <h2 className="tp-section-title"><ClipboardList size={22} /> Δήλωση Μαθήματος & Απουσιολόγιο</h2>

            <div className="tp-form-card">
              <div className="tp-form-grid">
                {/* Specialty */}
                <div className="tp-form-group">
                  <label className="tp-label">Ειδικότητα</label>
                  <select
                    className="tp-select"
                    value={reportSpecialtyId}
                    onChange={e => { setReportSpecialtyId(e.target.value); setReportCourse(''); }}
                  >
                    <option value="">Επιλέξτε ειδικότητα...</option>
                    {teacherSpecialties.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Course */}
                <div className="tp-form-group">
                  <label className="tp-label">Μάθημα</label>
                  <select
                    className="tp-select"
                    value={reportCourse}
                    onChange={e => setReportCourse(e.target.value)}
                    disabled={!reportSpecialtyId}
                  >
                    <option value="">Επιλέξτε μάθημα...</option>
                    {reportCourseOptions.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="tp-form-group">
                  <label className="tp-label"><CalendarIcon size={14} /> Ημερομηνία</label>
                  <input
                    type="date"
                    className="tp-input"
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                  />
                </div>

                {/* Arrival Time */}
                <div className="tp-form-group">
                  <label className="tp-label"><Clock size={14} /> Ώρα Άφιξης</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="time"
                      className="tp-input"
                      value={reportArrivalTime}
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', flex: 1 }}
                    />
                    {!reportArrivalTime && (
                      <button 
                        type="button"
                        onClick={() => {
                           const now = new Date();
                           setReportArrivalTime(now.toTimeString().slice(0, 5));
                        }}
                        style={{ padding: '0 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                      >
                        Χτύπημα Κάρτας
                      </button>
                    )}
                  </div>
                </div>

                {/* Departure Time */}
                <div className="tp-form-group">
                  <label className="tp-label"><Clock size={14} /> Ώρα Αναχώρησης</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="time"
                      className="tp-input"
                      value={reportDepartureTime}
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', flex: 1 }}
                    />
                    {!reportDepartureTime && reportArrivalTime && (
                      <button 
                        type="button"
                        onClick={() => {
                           const now = new Date();
                           setReportDepartureTime(now.toTimeString().slice(0, 5));
                        }}
                        style={{ padding: '0 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                      >
                        Χτύπημα Κάρτας
                      </button>
                    )}
                  </div>
                </div>

                {/* Calculated Duration */}
                <div className="tp-form-group">
                  <label className="tp-label">Διάρκεια</label>
                  <div className="tp-duration-display">
                    {calculatedHours 
                      ? <><Clock size={16} /> <strong>{calculatedHours.hours} ώρ. {calculatedHours.mins > 0 ? `${calculatedHours.mins} λεπτά` : ''}</strong></>
                      : <span className="tp-muted">Συμπληρώστε ώρες...</span>
                    }
                  </div>
                </div>
              </div>

              {/* Attendance List */}
              {reportSpecialtyId && reportCourse && (
                <div className="tp-attendance-section">
                  <h3 className="tp-subsection-title">
                    <Users size={18} /> Απουσιολόγιο 
                    <span className="tp-badge">{reportStudents.length} σπουδαστές</span>
                    {Object.values(currentReportAbsences).filter(Boolean).length > 0 && (
                      <span className="tp-badge tp-badge-red">
                        {Object.values(currentReportAbsences).filter(Boolean).length} απόντες
                      </span>
                    )}
                  </h3>
                  
                  {reportStudents.length === 0 ? (
                    <div className="tp-empty-state-sm">
                      <p>Δεν βρέθηκαν εγγεγραμμένοι μαθητές σε αυτή την ειδικότητα.</p>
                    </div>
                  ) : (
                    <div className="tp-attendance-list">
                      {reportStudents.map(student => (
                        <label 
                          key={student.id} 
                          className={`tp-attendance-item ${currentReportAbsences[student.id] ? 'tp-absent' : ''}`}
                        >
                          <div className="tp-attendance-check">
                            <input
                              type="checkbox"
                              checked={!!currentReportAbsences[student.id]}
                              onChange={() => handleToggleAbsence(student.id)}
                            />
                            <div className={`tp-custom-check ${currentReportAbsences[student.id] ? 'checked' : ''}`}>
                              {currentReportAbsences[student.id] && <X size={12} />}
                            </div>
                          </div>
                          <span className="tp-attendance-name">{student.fullName}</span>
                          {currentReportAbsences[student.id] && (
                            <span className="tp-absent-badge">Απών/ούσα</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="tp-form-actions">
                    {reportSubmitted && (
                      <span className="tp-success-msg">
                        <CheckCircle size={18} /> Η αναφορά υποβλήθηκε επιτυχώς!
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        className="tp-submit-btn"
                        style={{ background: '#ef4444', border: 'none' }}
                        onClick={() => {
                          if (window.confirm('Είστε σίγουροι ότι θέλετε να καθαρίσετε τη φόρμα (συμπεριλαμβανομένης της ώρας);')) {
                            setReportArrivalTime('');
                            setReportDepartureTime('');
                            setCurrentReportAbsences({});
                            localStorage.removeItem('tp_specialtyId');
                            localStorage.removeItem('tp_course');
                            localStorage.removeItem('tp_date');
                            localStorage.removeItem('tp_arrivalTime');
                            localStorage.removeItem('tp_departureTime');
                          }
                        }}
                        disabled={reportSaving}
                      >
                        Καθαρισμός
                      </button>
                      <button
                        className="tp-submit-btn"
                        onClick={handleSubmitReport}
                        disabled={reportSubmitted || reportSaving}
                      >
                        {reportSaving ? 'Αποθήκευση...' : <><Save size={18} /> Υποβολή Αναφοράς</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(!reportSpecialtyId || !reportCourse) && (
                <div className="tp-empty-state-sm">
                  <BookOpen size={28} />
                  <p>Επιλέξτε Ειδικότητα και Μάθημα για να φορτώσετε το απουσιολόγιο.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ GRADES TAB ═══ */}
        {activeTab === 'grades' && (
          <div className="tp-grades-view">
            <h2 className="tp-section-title"><GraduationCap size={22} /> Καταχώρηση Βαθμολογιών</h2>

            <div className="tp-form-card">
              <div className="tp-form-grid tp-form-grid-2">
                <div className="tp-form-group">
                  <label className="tp-label">Ειδικότητα</label>
                  <select
                    className="tp-select"
                    value={gradesSpecialtyId}
                    onChange={e => { setGradesSpecialtyId(e.target.value); setGradesCourse(''); }}
                  >
                    <option value="">Επιλέξτε ειδικότητα...</option>
                    {teacherSpecialties.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="tp-form-group">
                  <label className="tp-label">Μάθημα</label>
                  <select
                    className="tp-select"
                    value={gradesCourse}
                    onChange={e => setGradesCourse(e.target.value)}
                    disabled={!gradesSpecialtyId}
                  >
                    <option value="">Επιλέξτε μάθημα...</option>
                    {gradesCourseOptions.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {gradesSpecialtyId && gradesCourse ? (
                <div className="tp-grades-section">
                  <h3 className="tp-subsection-title">
                    <Users size={18} /> Σπουδαστές
                    <span className="tp-badge">{gradesStudents.length}</span>
                  </h3>

                  {gradesStudents.length === 0 ? (
                    <div className="tp-empty-state-sm">
                      <p>Δεν βρέθηκαν εγγεγραμμένοι μαθητές.</p>
                    </div>
                  ) : (
                    <div className="tp-grades-table-wrap">
                      <table className="tp-grades-table">
                        <thead>
                          <tr>
                            <th>Σπουδαστής</th>
                            <th style={{ width: '22%' }}>Εργασία 6μήνου (20%)</th>
                            <th style={{ width: '22%' }}>Τελική Εξέταση (80%)</th>
                            <th style={{ width: '18%', textAlign: 'center' }}>Τελικός Βαθμός</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradesStudents.map(student => {
                            const pGrade = currentGrades[student.id]?.progressGrade || '';
                            const fGrade = currentGrades[student.id]?.finalGrade || '';
                            let calcGrade = '—';
                            const pNum = parseFloat(pGrade);
                            const fNum = parseFloat(fGrade);
                            if (!isNaN(pNum) || !isNaN(fNum)) {
                               const pVal = isNaN(pNum) ? 0 : pNum;
                               const fVal = isNaN(fNum) ? 0 : fNum;
                               calcGrade = ((pVal * 0.2) + (fVal * 0.8)).toFixed(1);
                               if (calcGrade.endsWith('.0')) calcGrade = calcGrade.slice(0, -2);
                            }

                            return (
                            <tr key={student.id}>
                              <td className="tp-grade-name">{student.fullName}</td>
                              <td>
                                <input
                                  type="text"
                                  className="tp-grade-input"
                                  placeholder="—"
                                  value={pGrade}
                                  onChange={e => handleGradeChange(student.id, 'progressGrade', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="tp-grade-input"
                                  placeholder="—"
                                  value={fGrade}
                                  onChange={e => handleGradeChange(student.id, 'finalGrade', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                                {calcGrade}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="tp-form-actions">
                    {gradesSubmitted && (
                      <span className="tp-success-msg">
                        <CheckCircle size={18} /> Η βαθμολογία αποθηκεύτηκε!
                      </span>
                    )}
                    <button
                      className="tp-submit-btn"
                      onClick={handleSubmitGrades}
                      disabled={gradesSubmitted || gradesSaving}
                    >
                      {gradesSaving ? 'Αποθήκευση...' : <><Save size={18} /> Αποθήκευση Βαθμολογίας</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tp-empty-state-sm">
                  <GraduationCap size={28} />
                  <p>Επιλέξτε Ειδικότητα και Μάθημα για να δείτε τη λίστα σπουδαστών.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {activeTab === 'history' && (
          <div className="tp-history-view">
            <h2 className="tp-section-title"><History size={22} /> Ιστορικό Αναφορών</h2>
            
            {myReports.length === 0 ? (
              <div className="tp-empty-state">
                <FileText size={40} />
                <p>Δεν υπάρχουν αναφορές ακόμα.</p>
                <small>Υποβάλετε την πρώτη σας αναφορά από το tab "Αναφορά".</small>
              </div>
            ) : (
              <div className="tp-history-list">
                {[...myReports].reverse().map(report => (
                  <div key={report.id} className="tp-history-card">
                    <div className="tp-history-header">
                      <div className="tp-history-date-block">
                        <CalendarIcon size={16} />
                        <span className="tp-history-date">{report.date}</span>
                      </div>
                      <span className="tp-history-status">✓ Υποβλήθηκε</span>
                    </div>
                    <div className="tp-history-body">
                      <div className="tp-history-course">{report.courseTitle}</div>
                      <div className="tp-history-specialty">{report.specialtyTitle || report.sectionName}</div>
                      <div className="tp-history-details">
                        <span className="tp-history-detail">
                          <Clock size={14} /> 
                          {report.arrivalTime && report.departureTime 
                            ? `${report.arrivalTime} - ${report.departureTime}`
                            : `${report.hours} ώρες`
                          }
                        </span>
                        <span className="tp-history-detail">
                          <Users size={14} /> 
                          {report.absentStudents && report.absentStudents.length > 0 
                            ? `${report.absentStudents.length} απουσίες`
                            : 'Κανείς απών'
                          }
                        </span>
                      </div>
                      {report.absentStudents && report.absentStudents.length > 0 && (
                        <div className="tp-history-absent-list">
                          <strong>Απόντες:</strong> {report.absentStudents.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
