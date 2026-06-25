import React, { useState } from 'react';
import { ArrowLeft, Users, FileText, CheckCircle, Save, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function TeacherClassView({ classInfo, onBack, students, absences, setAbsences, grades, setGrades }) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'grades'
  
  // Local state for adding absences
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceHours, setAbsenceHours] = useState(1);

  // Filter students who are enrolled in this class's specialty
  const classStudents = students.filter(s => s.specialty === classInfo.specialtyId);

  // Handlers for Absences
  const handleAddAbsence = (studentId) => {
    const newAbsence = {
      id: 'abs_' + Date.now(),
      studentId,
      courseTitle: classInfo.courseTitle,
      date: absenceDate,
      hours: parseInt(absenceHours, 10)
    };
    setAbsences(prev => [...prev, newAbsence]);
  };

  const handleRemoveAbsence = (absenceId) => {
    setAbsences(prev => prev.filter(a => a.id !== absenceId));
  };

  // Handlers for Grades
  const handleGradeChange = (studentId, type, value) => {
    // value must be empty or a number between 1 and 10
    if (value !== '' && (isNaN(value) || value < 1 || value > 10)) return;

    setGrades(prev => {
      // Find existing grade record for this student and course
      const existing = prev.find(g => g.studentId === studentId && g.courseTitle === classInfo.courseTitle);
      if (existing) {
        return prev.map(g => 
          g.id === existing.id 
            ? { ...g, [type]: value } 
            : g
        );
      } else {
        // Create new record
        return [...prev, {
          id: 'grd_' + Date.now(),
          studentId,
          courseTitle: classInfo.courseTitle,
          progressGrade: type === 'progressGrade' ? value : '',
          finalGrade: type === 'finalGrade' ? value : ''
        }];
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button 
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', padding: '8px' }}
        >
          <ArrowLeft size={18} /> Επιστροφή
        </button>
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{classInfo.courseTitle}</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>{classInfo.specialtyTitle}</span>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '10px 20px', background: activeTab === 'attendance' ? '#eff6ff' : 'transparent',
              color: activeTab === 'attendance' ? '#2563eb' : '#64748b', border: activeTab === 'attendance' ? '1px solid #bfdbfe' : '1px solid transparent',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Clock size={18} /> Απουσιολόγιο
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            style={{
              padding: '10px 20px', background: activeTab === 'grades' ? '#eff6ff' : 'transparent',
              color: activeTab === 'grades' ? '#2563eb' : '#64748b', border: activeTab === 'grades' ? '1px solid #bfdbfe' : '1px solid transparent',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <CheckCircle size={18} /> Βαθμολόγιο
          </button>
        </div>

        {/* Attendance Tab Content */}
        {activeTab === 'attendance' && (
          <div className="sys-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', margin: 0, color: '#1e293b' }}>Καταχώρηση Απουσιών</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Ημερομηνία:</label>
                  <input type="date" className="sys-input" style={{ width: '150px' }} value={absenceDate} onChange={e => setAbsenceDate(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Ώρες:</label>
                  <select className="sys-input" style={{ width: '80px' }} value={absenceHours} onChange={e => setAbsenceHours(e.target.value)}>
                    {[1,2,3,4,5].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {classStudents.map(student => {
                // Get student's absences for this specific course
                const studentAbsences = absences.filter(a => a.studentId === student.id && a.courseTitle === classInfo.courseTitle);
                const totalHours = studentAbsences.reduce((sum, a) => sum + a.hours, 0);

                return (
                  <div key={student.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{student.lastName} {student.firstName}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>ΑΜ: {student.am || '-'}</div>
                      
                      {studentAbsences.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {studentAbsences.map(abs => (
                            <span key={abs.id} style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {new Date(abs.date).toLocaleDateString('el-GR')} ({abs.hours} ώρες)
                              <button onClick={() => handleRemoveAbsence(abs.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0, marginLeft: '4px', fontSize: '14px', lineHeight: 1 }}>&times;</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: totalHours > 0 ? '#ef4444' : '#10b981' }}>{totalHours}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Συνολο</div>
                      </div>
                      <button 
                        className="btn-sys"
                        style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '600' }}
                        onClick={() => handleAddAbsence(student.id)}
                      >
                        + Καταχώρηση
                      </button>
                    </div>
                  </div>
                );
              })}
              {classStudents.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Δεν βρέθηκαν εγγεγραμμένοι σπουδαστές σε αυτή την ειδικότητα.</div>}
            </div>
          </div>
        )}

        {/* Grades Tab Content */}
        {activeTab === 'grades' && (
          <div className="sys-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: 0, color: '#1e293b' }}>Βαθμολόγιο (Κλίμακα 1-10)</h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Σπουδαστής</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Α.Μ.</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Βαθμός Προόδου</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Βαθμός Εξέτασης</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Τελικός (Μ.Ο.)</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map(student => {
                  const record = grades.find(g => g.studentId === student.id && g.courseTitle === classInfo.courseTitle) || {};
                  const progress = record.progressGrade || '';
                  const final = record.finalGrade || '';
                  
                  let average = '-';
                  if (progress !== '' && final !== '') {
                    average = ((parseFloat(progress) + parseFloat(final)) / 2).toFixed(1);
                  } else if (progress !== '') {
                    average = parseFloat(progress).toFixed(1); // Or handle according to local rules
                  } else if (final !== '') {
                    average = parseFloat(final).toFixed(1);
                  }

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 12px', fontWeight: '600', color: '#0f172a' }}>{student.lastName} {student.firstName}</td>
                      <td style={{ padding: '16px 12px', color: '#64748b', fontSize: '14px' }}>{student.am || '-'}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <input 
                          type="number" 
                          min="1" max="10" step="0.1"
                          style={{ width: '60px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          value={progress}
                          onChange={(e) => handleGradeChange(student.id, 'progressGrade', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <input 
                          type="number" 
                          min="1" max="10" step="0.1"
                          style={{ width: '60px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          value={final}
                          onChange={(e) => handleGradeChange(student.id, 'finalGrade', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          fontWeight: '700', fontSize: '16px',
                          color: average === '-' ? '#cbd5e1' : (parseFloat(average) >= 5 ? '#10b981' : '#ef4444')
                        }}>
                          {average}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {classStudents.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Δεν βρέθηκαν εγγεγραμμένοι σπουδαστές.</div>}
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Οι αλλαγές αποθηκεύονται αυτόματα
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
