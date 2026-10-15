import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Plus, Trash2, GraduationCap, Check, AlertCircle, Save, Layers } from 'lucide-react';

export default function TeacherCoursesModal({
  isOpen,
  onClose,
  teacher,
  specialties = [],
  courses = {},
  onSave
}) {
  // Local state for assignments
  // Each assignment item: { specialtyId: string, courseId: string, isCustom?: boolean }
  const [assignments, setAssignments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Helper to extract courses for a given specialty grouped by semester
  const getCoursesForSpecialty = (specId) => {
    if (!specId || !courses[specId]) return { semester1: [], semester2: [], semester3: [], semester4: [] };
    const specData = courses[specId] || {};
    return {
      semester1: Array.isArray(specData.semester1) ? specData.semester1 : [],
      semester2: Array.isArray(specData.semester2) ? specData.semester2 : [],
      semester3: Array.isArray(specData.semester3) ? specData.semester3 : [],
      semester4: Array.isArray(specData.semester4) ? specData.semester4 : []
    };
  };

  // Populate assignments when modal opens or teacher changes
  useEffect(() => {
    if (isOpen && teacher) {
      const initial = (teacher.assignments || []).map(a => {
        const specId = a.specialtyId || '';
        const courseId = a.courseId || '';
        const specCourses = getCoursesForSpecialty(specId);
        const allList = [
          ...specCourses.semester1,
          ...specCourses.semester2,
          ...specCourses.semester3,
          ...specCourses.semester4
        ];
        // If courseId is not empty and not in the official list, mark as custom
        const isKnown = courseId ? allList.includes(courseId) : true;
        return {
          specialtyId: specId,
          courseId: courseId,
          isCustom: !isKnown && !!courseId
        };
      });
      setAssignments(initial);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, teacher]);

  if (!isOpen || !teacher) return null;

  const handleAddAssignment = () => {
    // Pick the first available specialty as default if available
    const defaultSpec = specialties.length > 0 ? specialties[0].id : '';
    setAssignments(prev => [
      ...prev,
      { specialtyId: defaultSpec, courseId: '', isCustom: false }
    ]);
  };

  const handleRemoveAssignment = (index) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSpecialtyChange = (index, newSpecId) => {
    setAssignments(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        specialtyId: newSpecId,
        courseId: '',
        isCustom: false
      };
      return next;
    });
  };

  const handleCourseSelectChange = (index, value) => {
    setAssignments(prev => {
      const next = [...prev];
      if (value === '__CUSTOM__') {
        next[index] = {
          ...next[index],
          isCustom: true,
          courseId: next[index].courseId || ''
        };
      } else {
        next[index] = {
          ...next[index],
          isCustom: false,
          courseId: value
        };
      }
      return next;
    });
  };

  const handleCustomCourseTextChange = (index, text) => {
    setAssignments(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        courseId: text
      };
      return next;
    });
  };

  const handleToggleCustomMode = (index) => {
    setAssignments(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        isCustom: !next[index].isCustom
      };
      return next;
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');

    // Filter out completely empty items
    const cleaned = assignments
      .map(a => ({
        specialtyId: (a.specialtyId || '').trim(),
        courseId: (a.courseId || '').trim()
      }))
      .filter(a => a.specialtyId || a.courseId);

    // Validate that each assignment has both specialty and course
    for (let i = 0; i < cleaned.length; i++) {
      if (!cleaned[i].specialtyId) {
        setError(`Στο μάθημα #${i + 1} δεν έχει επιλεγεί Ειδικότητα.`);
        return;
      }
      if (!cleaned[i].courseId) {
        setError(`Στο μάθημα #${i + 1} δεν έχει συμπληρωθεί / επιλεγεί τίτλος μαθήματος.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(teacher.id, cleaned);
      setSuccessMsg('Οι αναθέσεις μαθημάτων ενημερώθηκαν επιτυχώς!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError('Σφάλμα κατά την αποθήκευση: ' + (err.message || 'Προσπαθήστε ξανά.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dialog-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="dialog-box" 
        style={{ 
          maxWidth: '680px', 
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          background: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, fontWeight: '600' }}>
                Διαχείριση Διδασκόμενων Μαθημάτων
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
                {teacher.name}
              </h2>
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

        {/* Info Banner */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          fontSize: '12.5px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <GraduationCap size={16} color="#4f46e5" style={{ flexShrink: 0 }} />
          <span>
            Ορίστε ή αλλάξτε τα μαθήματα που διδάσκει ο/η εκπαιδευτικός. Τα μαθήματα αυτά εμφανίζονται αυτόματα στην <strong>Πύλη Καθηγητών</strong> για δηλώσεις παρουσιών και καταχώρηση βαθμών.
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <Check size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {assignments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
              color: '#64748b'
            }}>
              <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                Δεν έχουν ανατεθεί μαθήματα
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px' }}>
                Ο/Η εκπαιδευτικός δεν έχει κανένα ενεργό μάθημα αυτή τη στιγμή.
              </p>
              <button
                type="button"
                onClick={handleAddAssignment}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
                }}
              >
                <Plus size={15} />
                <span>Προσθήκη Πρώτου Μαθήματος</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {assignments.map((assignment, index) => {
                const specCourses = getCoursesForSpecialty(assignment.specialtyId);
                const currentSpec = specialties.find(s => s.id === assignment.specialtyId);
                const allKnownCourses = [
                  ...specCourses.semester1,
                  ...specCourses.semester2,
                  ...specCourses.semester3,
                  ...specCourses.semester4
                ];

                return (
                  <div 
                    key={index} 
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    {/* Item Top Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: '#e0e7ff',
                          color: '#4338ca',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          Μάθημα #{index + 1}
                        </span>
                        {currentSpec && (
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                            {currentSpec.title}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(index)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: '600'
                        }}
                        title="Διαγραφή μαθήματος"
                      >
                        <Trash2 size={13} />
                        <span>Διαγραφή</span>
                      </button>
                    </div>

                    {/* Field 1: Specialty Dropdown */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        1. Ειδικότητα:
                      </label>
                      <select
                        className="sys-input"
                        value={assignment.specialtyId}
                        onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="">-- Επιλέξτε Ειδικότητα --</option>
                        {specialties.map(spec => (
                          <option key={spec.id} value={spec.id}>
                            {spec.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Field 2: Course Selection / Free Typing */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                          2. Μάθημα:
                        </label>
                        {assignment.specialtyId && (
                          <button
                            type="button"
                            onClick={() => handleToggleCustomMode(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4f46e5',
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              textDecoration: 'underline',
                              padding: 0
                            }}
                          >
                            {assignment.isCustom ? '← Επιλογή από προκαθορισμένη λίστα' : '✏️ Ελεύθερη πληκτρολόγηση άλλου μαθήματος'}
                          </button>
                        )}
                      </div>

                      {!assignment.specialtyId ? (
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                          Παρακαλώ επιλέξτε πρώτα ειδικότητα.
                        </div>
                      ) : assignment.isCustom ? (
                        /* Custom free text input */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            className="sys-input"
                            placeholder="Πληκτρολογήστε τον ακριβή τίτλο του μαθήματος (π.χ. Εργαστήριο Μαγειρικής Ι)..."
                            value={assignment.courseId}
                            onChange={(e) => handleCustomCourseTextChange(index, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid #6366f1',
                              fontSize: '13px',
                              background: '#fdf4ff'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#6366f1' }}>
                            ✨ Προσαρμοσμένος τίτλος μαθήματος.
                          </span>
                        </div>
                      ) : (
                        /* Standard Dropdown with optgroups */
                        <select
                          className="sys-input"
                          value={assignment.courseId}
                          onChange={(e) => handleCourseSelectChange(index, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            background: '#ffffff'
                          }}
                        >
                          <option value="">-- Επιλέξτε Μάθημα από το Πρόγραμμα Σπουδών --</option>

                          {/* Existing assignment option if not strictly in curriculum */}
                          {assignment.courseId && !allKnownCourses.includes(assignment.courseId) && (
                            <option value={assignment.courseId}>
                              {assignment.courseId} (Υφιστάμενη ανάθεση)
                            </option>
                          )}

                          {specCourses.semester1.length > 0 && (
                            <optgroup label="── Α΄ Εξάμηνο ──">
                              {specCourses.semester1.map((cName, cIdx) => (
                                <option key={`s1_${cIdx}`} value={cName}>
                                  {cName}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {specCourses.semester2.length > 0 && (
                            <optgroup label="── Β΄ Εξάμηνο ──">
                              {specCourses.semester2.map((cName, cIdx) => (
                                <option key={`s2_${cIdx}`} value={cName}>
                                  {cName}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {specCourses.semester3.length > 0 && (
                            <optgroup label="── Γ΄ Εξάμηνο ──">
                              {specCourses.semester3.map((cName, cIdx) => (
                                <option key={`s3_${cIdx}`} value={cName}>
                                  {cName}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {specCourses.semester4.length > 0 && (
                            <optgroup label="── Δ΄ Εξάμηνο ──">
                              {specCourses.semester4.map((cName, cIdx) => (
                                <option key={`s4_${cIdx}`} value={cName}>
                                  {cName}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          <option value="__CUSTOM__">➕ Άλλο / Ελεύθερη Εισαγωγή Μαθήματος...</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddAssignment}
                style={{
                  background: '#f8fafc',
                  color: '#4f46e5',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={15} />
                <span>Προσθήκη Επιπλέον Μαθήματος</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
            Συνολικά μαθήματα: <strong>{assignments.filter(a => a.courseId).length}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-sys"
              onClick={onClose}
              disabled={isSaving}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              Ακύρωση
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
