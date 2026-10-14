import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, FileText, Search, User, Filter, RefreshCw, 
  Download, Edit3, Save, CheckCircle2, AlertCircle, BarChart3, Users
} from 'lucide-react';
import { exportGrades } from '../services/exportExcel';

const normCourse = (str) => (str || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

export default function AdminGradesView({ 
  students = [], 
  specialties = [], 
  grades = [], 
  courses = {}, 
  onSaveGrades,
  onRefresh,
  isRefreshing = false 
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Secretariat Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editGrades, setEditGrades] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active specialties: those that have courses defined or students enrolled
  const activeSpecialties = useMemo(() => {
    return specialties.filter(spec => {
      const hasCourses = courses[spec.id] && Object.values(courses[spec.id]).some(val => Array.isArray(val) && val.length > 0);
      const hasStudents = students.some(s => s.specialtyId === spec.id);
      return hasCourses || hasStudents;
    });
  }, [specialties, courses, students]);

  // Available courses for the selected specialty
  const availableCourses = useMemo(() => {
    if (!selectedSpecialty) return [];
    
    let allCourses = [];
    if (courses[selectedSpecialty]) {
      Object.keys(courses[selectedSpecialty]).forEach(key => {
        if (key !== 'title' && Array.isArray(courses[selectedSpecialty][key])) {
          allCourses = [...allCourses, ...courses[selectedSpecialty][key]];
        }
      });
    }

    // Also include any courses already graded for students in this specialty
    const specStudents = students.filter(s => s.specialtyId === selectedSpecialty);
    const specStudentIds = new Set(specStudents.map(s => s.id));
    grades.forEach(g => {
      if (specStudentIds.has(g.studentId) && g.courseTitle) {
        allCourses.push(g.courseTitle);
      }
    });

    return [...new Set(allCourses)].sort((a, b) => a.localeCompare(b, 'el'));
  }, [selectedSpecialty, courses, students, grades]);

  // Selected specialty object
  const currentSpecialtyObj = useMemo(() => {
    return specialties.find(s => s.id === selectedSpecialty);
  }, [specialties, selectedSpecialty]);

  // Synchronize editGrades when selectedCourse or grades change
  useEffect(() => {
    if (selectedSpecialty && selectedCourse) {
      const initial = {};
      const specStudents = students.filter(s => s.specialtyId === selectedSpecialty);
      specStudents.forEach(st => {
        const studentGrade = grades.find(g => 
          g.studentId === st.id && 
          normCourse(g.courseTitle) === normCourse(selectedCourse)
        );
        initial[st.id] = {
          progressGrade: studentGrade ? (studentGrade.progressGrade || '') : '',
          finalGrade: studentGrade ? (studentGrade.finalGrade || '') : ''
        };
      });
      setEditGrades(initial);
      setIsEditing(false);
    }
  }, [selectedSpecialty, selectedCourse, grades, students]);

  // Filter students and their grades for display
  const displayData = useMemo(() => {
    let result = [];
    if (!selectedSpecialty || !selectedCourse) return result;

    const specStudents = students.filter(s => s.specialtyId === selectedSpecialty);

    specStudents.forEach(student => {
      if (searchQuery && !student.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      // Check edit state or database grade
      const inEdit = editGrades[student.id];
      const studentGrade = grades.find(g => 
        g.studentId === student.id && 
        normCourse(g.courseTitle) === normCourse(selectedCourse)
      );

      const pGrade = isEditing 
        ? (inEdit ? inEdit.progressGrade : '') 
        : (studentGrade ? (studentGrade.progressGrade || '-') : '-');
        
      const fGrade = isEditing 
        ? (inEdit ? inEdit.finalGrade : '') 
        : (studentGrade ? (studentGrade.finalGrade || '-') : '-');

      let calcGrade = '-';
      const pNum = parseFloat(pGrade);
      const fNum = parseFloat(fGrade);
      if (!isNaN(pNum) || !isNaN(fNum)) {
        const pVal = isNaN(pNum) ? 0 : pNum;
        const fVal = isNaN(fNum) ? 0 : fNum;
        calcGrade = ((pVal * 0.2) + (fVal * 0.8)).toFixed(1);
        if (calcGrade.endsWith('.0')) calcGrade = calcGrade.slice(0, -2);
      }

      result.push({
        student,
        progressGrade: pGrade,
        finalGrade: fGrade,
        calcGrade
      });
    });

    return result.sort((a, b) => a.student.fullName.localeCompare(b.student.fullName, 'el'));
  }, [students, grades, selectedSpecialty, selectedCourse, searchQuery, isEditing, editGrades]);

  // Statistical metrics for the class
  const stats = useMemo(() => {
    if (displayData.length === 0) return null;
    const graded = displayData.filter(d => d.calcGrade !== '-');
    const totalStudents = displayData.length;
    const gradedCount = graded.length;
    
    if (gradedCount === 0) {
      return { totalStudents, gradedCount: 0, average: '-', passCount: 0, passRate: '0%' };
    }

    const sum = graded.reduce((acc, curr) => acc + parseFloat(curr.calcGrade), 0);
    const average = (sum / gradedCount).toFixed(2);
    const passCount = graded.filter(d => parseFloat(d.calcGrade) >= 5.0).length;
    const passRate = `${Math.round((passCount / gradedCount) * 100)}%`;

    return { totalStudents, gradedCount, average, passCount, passRate };
  }, [displayData]);

  // Handle grade change in edit mode
  const handleEditGradeChange = (studentId, field, value) => {
    setEditGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { progressGrade: '', finalGrade: '' }),
        [field]: value
      }
    }));
  };

  // Save edited grades
  const handleSave = async () => {
    if (!onSaveGrades) return;
    setIsSaving(true);
    try {
      const toSave = [];
      Object.keys(editGrades).forEach(studentId => {
        const { progressGrade, finalGrade } = editGrades[studentId];
        if (progressGrade || finalGrade) {
          const existing = grades.find(g => 
            g.studentId === studentId && 
            normCourse(g.courseTitle) === normCourse(selectedCourse)
          );
          toSave.push({
            id: existing?.id || `grd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId,
            courseTitle: selectedCourse,
            progressGrade: progressGrade || null,
            finalGrade: finalGrade || null
          });
        }
      });

      if (toSave.length > 0) {
        await onSaveGrades(toSave);
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Export current grades to Excel
  const handleExport = () => {
    if (displayData.length === 0) {
      window.alert('Δεν υπάρχουν δεδομένα προς εξαγωγή.');
      return;
    }
    exportGrades(displayData, currentSpecialtyObj?.title || '', selectedCourse);
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="#3b82f6" />
            Βαθμολογίες Εκπαιδευτών & Εξαμήνου
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Εποπτεία, ζωντανός έλεγχος και καταχώρηση βαθμολογιών (20% Εργασία + 80% Τελική Εξέταση)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedSpecialty && selectedCourse && (
            <>
              <button
                onClick={handleExport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                title="Εξαγωγή σε Excel"
              >
                <Download size={15} color="#059669" />
                <span>Excel</span>
              </button>

              {onSaveGrades && (
                !isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Επεξεργασία Βαθμών</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        color: '#64748b',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Ακύρωση
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#16a34a',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                      }}
                    >
                      <Save size={15} />
                      <span>{isSaving ? 'Αποθήκευση...' : 'Αποθήκευση'}</span>
                    </button>
                  </div>
                )
              )}
            </>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: '600',
                fontSize: '13px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              title="Ανανέωση βαθμολογιών από το Cloud"
            >
              <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', color: '#2563eb' }} />
              <span>{isRefreshing ? 'Ανανέωση...' : 'Ανανέωση'}</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <CheckCircle2 size={18} />
          Οι βαθμολογίες αποθηκεύτηκαν επιτυχώς στο Cloud!
        </div>
      )}

      {/* Filters Card */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Επιλογή Ειδικότητας:
          </label>
          <select 
            className="sys-input" 
            value={selectedSpecialty} 
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              setSelectedCourse('');
            }}
            style={{ width: '100%', background: '#fff' }}
          >
            <option value="">-- Επιλέξτε Ειδικότητα ({activeSpecialties.length}) --</option>
            {activeSpecialties.map(spec => (
              <option key={spec.id} value={spec.id}>{spec.title}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 250px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Επιλογή Μαθήματος:
          </label>
          <select 
            className="sys-input" 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedSpecialty}
            style={{ width: '100%', background: selectedSpecialty ? '#fff' : '#f1f5f9' }}
          >
            <option value="">-- {selectedSpecialty ? `Επιλέξτε Μάθημα (${availableCourses.length})` : 'Πρώτα επιλέξτε Ειδικότητα'} --</option>
            {availableCourses.map((course, idx) => (
              <option key={idx} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Αναζήτηση Σπουδαστή:
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="sys-input" 
              placeholder="Ονοματεπώνυμο..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedCourse}
              style={{ width: '100%', paddingLeft: '32px', background: selectedCourse ? '#fff' : '#f1f5f9' }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Summary Stats Row */}
      {selectedSpecialty && selectedCourse && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Σπουδαστές Τμήματος</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{stats.totalStudents}</div>
          </div>
          <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
            <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600' }}>Βαθμολογημένοι</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', marginTop: '2px' }}>
              {stats.gradedCount} / {stats.totalStudents}
            </div>
          </div>
          <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>Μέσος Όρος</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e', marginTop: '2px' }}>
              {stats.average} <span style={{ fontSize: '12px', fontWeight: '500' }}>/ 10</span>
            </div>
          </div>
          <div style={{ background: '#dcfce7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Ποσοστό Επιτυχίας (≥5)</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#166534', marginTop: '2px' }}>
              {stats.passRate} ({stats.passCount})
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {!selectedSpecialty || !selectedCourse ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Filter size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#475569' }}>
            Επιλέξτε Ειδικότητα και Μάθημα
          </p>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Θα εμφανιστεί η πλήρης κατάσταση σπουδαστών με τους βαθμούς εξαμήνου και της τελικής εξέτασης.
          </span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '28%' }}>Ονοματεπώνυμο Σπουδαστή</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '12%' }}>Α.Μ.</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '20%' }}>Εργασία 6μήνου (20%)</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '20%' }}>Τελική Εξέταση (80%)</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '20%', textAlign: 'center' }}>Τελικός Βαθμός</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Δεν βρέθηκαν σπουδαστές που να ταιριάζουν στα κριτήρια.
                  </td>
                </tr>
              ) : (
                displayData.map((row, idx) => {
                  const pNum = parseFloat(row.progressGrade);
                  const fNum = parseFloat(row.finalGrade);
                  const calcNum = parseFloat(row.calcGrade);

                  return (
                    <tr key={row.student.id} style={{ borderBottom: idx === displayData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', background: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                            {row.student.fullName.charAt(0)}
                          </div>
                          <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{row.student.fullName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                        {row.student.mathitisAr || row.student.am || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {isEditing ? (
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="0-10"
                            value={editGrades[row.student.id]?.progressGrade || ''}
                            onChange={(e) => handleEditGradeChange(row.student.id, 'progressGrade', e.target.value)}
                            style={{
                              width: '80px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontWeight: '600',
                              fontSize: '14px',
                              textAlign: 'center'
                            }}
                          />
                        ) : (
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '14px', 
                            fontWeight: '600',
                            background: row.progressGrade === '-' ? '#f1f5f9' : (pNum >= 5 ? '#dcfce7' : '#fee2e2'),
                            color: row.progressGrade === '-' ? '#94a3b8' : (pNum >= 5 ? '#16a34a' : '#ef4444')
                          }}>
                            {row.progressGrade}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {isEditing ? (
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="0-10"
                            value={editGrades[row.student.id]?.finalGrade || ''}
                            onChange={(e) => handleEditGradeChange(row.student.id, 'finalGrade', e.target.value)}
                            style={{
                              width: '80px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontWeight: '600',
                              fontSize: '14px',
                              textAlign: 'center'
                            }}
                          />
                        ) : (
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '14px', 
                            fontWeight: '600',
                            background: row.finalGrade === '-' ? '#f1f5f9' : (fNum >= 5 ? '#dbeafe' : '#fee2e2'),
                            color: row.finalGrade === '-' ? '#94a3b8' : (fNum >= 5 ? '#2563eb' : '#ef4444')
                          }}>
                            {row.finalGrade}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '5px 14px', 
                          borderRadius: '20px', 
                          fontSize: '15px', 
                          fontWeight: '700',
                          background: row.calcGrade === '-' ? '#f1f5f9' : (calcNum >= 5 ? '#fef3c7' : '#fee2e2'),
                          color: row.calcGrade === '-' ? '#94a3b8' : (calcNum >= 5 ? '#d97706' : '#ef4444')
                        }}>
                          {row.calcGrade}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
