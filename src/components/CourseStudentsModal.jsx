import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Users, 
  UserMinus, 
  UserPlus, 
  Search, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  BarChart2,
  Calendar
} from 'lucide-react';
import { exportGrades } from '../services/exportExcel';

const norm = (str) => (str || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

export default function CourseStudentsModal({
  isOpen,
  onClose,
  courseTitle,
  specialtyId,
  semester,
  specialties = [],
  sections = [],
  students = [],
  grades = [],
  absences = [],
  onRemoveStudentFromCourse,
  onAddStudentToCourse
}) {
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const specialty = useMemo(() => {
    return specialties.find(s => s.id === specialtyId);
  }, [specialtyId, specialties]);

  // Sections that belong to this specialty
  const specialtySections = useMemo(() => {
    return sections.filter(sec => sec.specialtyId === specialtyId);
  }, [sections, specialtyId]);

  // Students who belong to this specialty
  const specialtyStudents = useMemo(() => {
    return students.filter(s => s.specialtyId === specialtyId);
  }, [students, specialtyId]);

  // Calculate enrolled students for this course:
  // Students in this specialty (optionally filtered by section)
  const courseStudents = useMemo(() => {
    if (!courseTitle) return [];
    const normalizedCourse = norm(courseTitle);

    return specialtyStudents.filter(student => {
      // If a section filter is active
      if (selectedSectionFilter && student.sectionId !== selectedSectionFilter) {
        return false;
      }

      // Check search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (student.fullName || '').toLowerCase().includes(q);
        const matchAm = (student.mathitisAr || '').toLowerCase().includes(q);
        if (!matchName && !matchAm) return false;
      }

      return true;
    }).sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'el'));
  }, [specialtyStudents, selectedSectionFilter, searchQuery, courseTitle]);

  // Students eligible to add to this course
  const eligibleStudentsToAdd = useMemo(() => {
    return students
      .filter(s => s.specialtyId === specialtyId && !courseStudents.some(cs => cs.id === s.id))
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'el'));
  }, [students, specialtyId, courseStudents]);

  if (!isOpen || !courseTitle) return null;

  const semLabel = semester === 'semester1' ? 'Εξάμηνο Α' : 
                   semester === 'semester2' ? 'Εξάμηνο Β' : 
                   semester === 'semester3' ? 'Εξάμηνο Γ' : 
                   semester === 'semester4' ? 'Εξάμηνο Δ' : (semester || '');

  const handleRemove = async (student) => {
    const confirmed = window.confirm(
      `Επιβεβαίωση Αφαίρεσης από Μάθημα:\n\nΕίστε βέβαιοι ότι θέλετε να αφαιρέσετε τον/την σπουδαστή/στρια "${student.fullName}" από το μάθημα "${courseTitle}";\n\n(Θα διαγραφούν οι βαθμοί και οι απουσίες του σπουδαστή για το συγκεκριμένο μάθημα).`
    );
    if (!confirmed) return;

    setActionLoading(true);
    setFeedback({ text: '', type: '' });
    try {
      if (onRemoveStudentFromCourse) {
        await onRemoveStudentFromCourse(student.id, courseTitle);
      }
      setFeedback({ text: `Ο/Η ${student.fullName} αφαιρέθηκε από το μάθημα "${courseTitle}".`, type: 'success' });
      setTimeout(() => setFeedback({ text: '', type: '' }), 3500);
    } catch (err) {
      setFeedback({ text: 'Σφάλμα κατά την αφαίρεση: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedStudentToAdd) return;

    const studentObj = students.find(s => s.id === selectedStudentToAdd);
    if (!studentObj) return;

    setActionLoading(true);
    setFeedback({ text: '', type: '' });
    try {
      if (onAddStudentToCourse) {
        await onAddStudentToCourse(selectedStudentToAdd, courseTitle);
      }
      setFeedback({ text: `Ο/Η ${studentObj.fullName} εντάχθηκε στο μάθημα "${courseTitle}"!`, type: 'success' });
      setSelectedStudentToAdd('');
      setTimeout(() => setFeedback({ text: '', type: '' }), 3500);
    } catch (err) {
      setFeedback({ text: 'Σφάλμα κατά την προσθήκη: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const exportRows = courseStudents.map(st => {
      const g = grades.find(gr => gr.studentId === st.id && norm(gr.courseTitle) === norm(courseTitle)) || {};
      const pNum = parseFloat(g.progressGrade);
      const fNum = parseFloat(g.finalGrade);
      let calcGrade = '-';
      if (!isNaN(pNum) || !isNaN(fNum)) {
        const p = isNaN(pNum) ? 0 : pNum;
        const f = isNaN(fNum) ? 0 : fNum;
        calcGrade = ((p * 0.2) + (f * 0.8)).toFixed(1);
        if (calcGrade.endsWith('.0')) calcGrade = calcGrade.slice(0, -2);
      }

      return {
        student: st,
        progressGrade: g.progressGrade || '',
        finalGrade: g.finalGrade || '',
        calcGrade
      };
    });

    exportGrades(exportRows, specialty?.title || '', courseTitle);
  };

  return (
    <div className="dialog-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="dialog-box" 
        style={{ 
          maxWidth: '900px', 
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, fontWeight: '600' }}>
                Σπουδαστές Μαθήματος • {semLabel}
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
                {courseTitle}
              </h2>
              {specialty && (
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>
                  {specialty.title}
                </div>
              )}
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            aria-label="Κλείσιμο"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <input
                  type="text"
                  className="sys-input"
                  placeholder="🔍 Αναζήτηση σπουδαστή..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    background: '#ffffff'
                  }}
                />
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Section Filter Dropdown */}
              {specialtySections.length > 0 && (
                <div style={{ minWidth: '180px' }}>
                  <select
                    className="sys-input"
                    value={selectedSectionFilter}
                    onChange={e => setSelectedSectionFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">📁 Όλα τα Τμήματα ({specialtySections.length})</option>
                    {specialtySections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600' }}>
                Σύνολο: <strong>{courseStudents.length}</strong> σπουδαστές
              </span>

              {courseStudents.length > 0 && (
                <button
                  type="button"
                  className="btn-sys"
                  onClick={handleExport}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                  title="Εξαγωγή βαθμολογιών μαθήματος σε Excel"
                >
                  <Download size={13} />
                  <span>Excel</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div style={{
            margin: '12px 24px 0 24px',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
            border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}>
            {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Body Table */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          {courseStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
              color: '#64748b'
            }}>
              <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', color: '#1e293b', fontWeight: '600' }}>
                Δεν βρέθηκαν σπουδαστές για αυτό το μάθημα
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px' }}>
                Ελέγξτε αν υπάρχουν εγγεγραμμένοι σπουδαστές στην ειδικότητα ή δοκιμάστε διαφορετικό φίλτρο τμήματος.
              </p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700', fontSize: '12px' }}>
                    <th style={{ padding: '10px 14px', width: '40px' }}>#</th>
                    <th style={{ padding: '10px 14px' }}>Ονοματεπώνυμο</th>
                    <th style={{ padding: '10px 14px' }}>Τμήμα</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Απουσίες</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Πρόοδος</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Τελική</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Μ.Ο.</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Ενέργεια</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.map((st, idx) => {
                    const secObj = sections.find(s => s.id === st.sectionId);
                    
                    // Grade & Absences for this course
                    const gradeRec = grades.find(g => g.studentId === st.id && norm(g.courseTitle) === norm(courseTitle)) || {};
                    const absHours = absences
                      .filter(a => a.studentId === st.id && norm(a.courseTitle) === norm(courseTitle))
                      .reduce((sum, a) => sum + (a.hours || 0), 0);

                    const pNum = parseFloat(gradeRec.progressGrade);
                    const fNum = parseFloat(gradeRec.finalGrade);
                    let avg = '-';
                    if (!isNaN(pNum) || !isNaN(fNum)) {
                      const p = isNaN(pNum) ? 0 : pNum;
                      const f = isNaN(fNum) ? 0 : fNum;
                      avg = ((p * 0.2) + (f * 0.8)).toFixed(1);
                      if (avg.endsWith('.0')) avg = avg.slice(0, -2);
                    }

                    return (
                      <tr 
                        key={st.id} 
                        style={{ 
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '12px' }}>
                          {idx + 1}
                        </td>

                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0f172a' }}>
                          <div>{st.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '400' }}>
                            {st.mathitisAr ? `Α.Μ: ${st.mathitisAr}` : st.phone || ''}
                          </div>
                        </td>

                        <td style={{ padding: '10px 14px', color: '#334155', fontSize: '12px' }}>
                          {secObj ? (
                            <span style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: '600',
                              fontSize: '11.5px',
                              border: '1px solid #bfdbfe'
                            }}>
                              {secObj.name}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Χωρίς Τμήμα</span>
                          )}
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: absHours > 0 ? '#fee2e2' : '#f0fdf4',
                            color: absHours > 0 ? '#b91c1c' : '#15803d'
                          }}>
                            {absHours} ώρες
                          </span>
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12.5px', fontWeight: '500' }}>
                          {gradeRec.progressGrade || '—'}
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12.5px', fontWeight: '500' }}>
                          {gradeRec.finalGrade || '—'}
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: avg !== '-' && parseFloat(avg) >= 5 ? '#f0fdf4' : avg !== '-' ? '#fef2f2' : '#f8fafc',
                            color: avg !== '-' && parseFloat(avg) >= 5 ? '#15803d' : avg !== '-' ? '#b91c1c' : '#94a3b8',
                            border: '1px solid #e2e8f0'
                          }}>
                            {avg}
                          </span>
                        </td>

                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleRemove(st)}
                            disabled={actionLoading}
                            style={{
                              background: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Αφαίρεση σπουδαστή από το μάθημα (διαγραφή βαθμών & απουσιών)"
                          >
                            <UserMinus size={13} />
                            <span>Αφαίρεση</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
            Μάθημα: <strong>{courseTitle}</strong> • Σπουδαστές: <strong>{courseStudents.length}</strong>
          </div>

          <button
            type="button"
            className="btn-sys"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '7px 18px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
}
