import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  UserMinus, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap,
  Layers,
  Trash2
} from 'lucide-react';
import { exportSectionStudents } from '../services/exportExcel';

export default function SectionStudentsModal({
  isOpen,
  onClose,
  section,
  specialties = [],
  students = [],
  onRemoveStudentFromSection,
  onAddStudentToSection,
  onDeleteStudent
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const specialty = useMemo(() => {
    if (!section?.specialtyId) return null;
    return specialties.find(s => s.id === section.specialtyId);
  }, [section, specialties]);

  // Students currently in this section
  const enrolledStudents = useMemo(() => {
    if (!section?.id) return [];
    return students
      .filter(s => s.sectionId === section.id)
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'el'));
  }, [section, students]);

  // Filtered by local search query
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase().trim();
    return enrolledStudents.filter(s => 
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q) ||
      (s.mathitisAr || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  }, [enrolledStudents, searchQuery]);

  // Eligible students to be added to this section:
  // Prefer students of the same specialty who are NOT already in this section
  const eligibleStudentsToAdd = useMemo(() => {
    if (!section) return [];
    return students
      .filter(s => s.sectionId !== section.id && (!section.specialtyId || s.specialtyId === section.specialtyId))
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'el'));
  }, [students, section]);

  if (!isOpen || !section) return null;

  const handleRemove = async (student) => {
    const confirmed = window.confirm(
      `Επιβεβαίωση Αφαίρεσης:\n\nΕίστε βέβαιοι ότι θέλετε να αφαιρέσετε τον/την σπουδαστή/στρια "${student.fullName}" από το τμήμα "${section.name}";\n\n(Ο σπουδαστής ΔΕΝ διαγράφεται από το σύστημα, απλώς αποδεσμεύεται από το τμήμα).`
    );
    if (!confirmed) return;

    setActionLoading(true);
    setFeedback({ text: '', type: '' });
    try {
      await onRemoveStudentFromSection(student.id, section.id);
      setFeedback({ text: `Ο/Η ${student.fullName} αφαιρέθηκε από το τμήμα.`, type: 'success' });
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
      await onAddStudentToSection(selectedStudentToAdd, section.id);
      setFeedback({ text: `Ο/Η ${studentObj.fullName} προστέθηκε στο τμήμα ${section.name}!`, type: 'success' });
      setSelectedStudentToAdd('');
      setTimeout(() => setFeedback({ text: '', type: '' }), 3500);
    } catch (err) {
      setFeedback({ text: 'Σφάλμα κατά την προσθήκη: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePermanent = async (student) => {
    if (!onDeleteStudent) return;
    const confirmed = window.confirm(
      `ΠΡΟΣΟΧΗ - ΟΡΙΣΤΙΚΗ ΔΙΑΓΡΑΦΗ:\n\nΕίστε σίγουροι ότι θέλετε να διαγράψετε ΟΡΙΣΤΙΚΑ τον/την σπουδαστή/στρια "${student.fullName}" από ολόκληρο το σύστημα;`
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await onDeleteStudent(student.id);
      setFeedback({ text: `Ο/Η ${student.fullName} διαγράφηκε οριστικά.`, type: 'success' });
      setTimeout(() => setFeedback({ text: '', type: '' }), 3500);
    } catch (err) {
      setFeedback({ text: 'Σφάλμα κατά τη διαγραφή: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const semLabel = section.semester === 'semester1' ? 'Εξάμηνο Α' : 
                   section.semester === 'semester2' ? 'Εξάμηνο Β' : 
                   section.semester === 'semester3' ? 'Εξάμηνο Γ' : 
                   section.semester === 'semester4' ? 'Εξάμηνο Δ' : section.semester;

  return (
    <div className="dialog-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="dialog-box" 
        style={{ 
          maxWidth: '850px', 
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
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
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
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, fontWeight: '600' }}>
                Σπουδαστές Τμήματος • {semLabel}
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
                {section.name}
              </h2>
              {specialty && (
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{specialty.title}</span>
                  {specialty.sector && <span>• Τομέας: {specialty.sector}</span>}
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

        {/* Toolbar & Add Student Bar */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Top Row: Search & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
              <input
                type="text"
                className="sys-input"
                placeholder="🔍 Αναζήτηση σπουδαστή με όνομα, Α.Μ., τηλέφωνο..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff'
                }}
              />
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600' }}>
                Σύνολο: <strong>{enrolledStudents.length}</strong> σπουδαστές
              </span>

              {enrolledStudents.length > 0 && (
                <button
                  type="button"
                  className="btn-sys"
                  onClick={() => exportSectionStudents(section, enrolledStudents, specialty?.title || '')}
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
                  title="Εξαγωγή καταλόγου τμήματος σε Excel"
                >
                  <Download size={13} />
                  <span>Excel</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Student Section */}
          <form onSubmit={handleAdd} style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#1e3a8a' }}>
              <UserPlus size={15} color="#2563eb" />
              <span>Ένταξη Σπουδαστή:</span>
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <select
                className="sys-input"
                value={selectedStudentToAdd}
                onChange={e => setSelectedStudentToAdd(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #94a3b8',
                  fontSize: '12.5px',
                  background: '#f8fafc'
                }}
              >
                <option value="">-- Επιλέξτε σπουδαστή για προσθήκη στο τμήμα --</option>
                {eligibleStudentsToAdd.map(st => {
                  const currentSec = st.sectionId ? ` (Ήδη σε άλλο τμήμα)` : ` (Χωρίς Τμήμα)`;
                  return (
                    <option key={st.id} value={st.id}>
                      {st.fullName} {st.mathitisAr ? `[Α.Μ: ${st.mathitisAr}]` : ''}{currentSec}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedStudentToAdd || actionLoading}
              style={{
                background: selectedStudentToAdd ? '#2563eb' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: selectedStudentToAdd ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={13} />
              <span>Προσθήκη</span>
            </button>
          </form>
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
          {displayedStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
              color: '#64748b'
            }}>
              <Users size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', color: '#1e293b', fontWeight: '600' }}>
                {enrolledStudents.length === 0 ? 'Δεν υπάρχουν σπουδαστές σε αυτό το τμήμα' : 'Δεν βρέθηκαν σπουδαστές με αυτά τα κριτήρια αναζήτησης'}
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px' }}>
                {enrolledStudents.length === 0 
                  ? 'Χρησιμοποιήστε το παραπάνω πεδίο «Ένταξη Σπουδαστή» για να προσθέσετε σπουδαστές στο τμήμα.'
                  : 'Δοκιμάστε διαφορετική αναζήτηση.'}
              </p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700', fontSize: '12px' }}>
                    <th style={{ padding: '10px 14px', width: '40px' }}>#</th>
                    <th style={{ padding: '10px 14px' }}>Ονοματεπώνυμο</th>
                    <th style={{ padding: '10px 14px' }}>Α.Μ.</th>
                    <th style={{ padding: '10px 14px' }}>Τηλέφωνο</th>
                    <th style={{ padding: '10px 14px' }}>Κατάσταση</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((st, idx) => (
                    <tr 
                      key={st.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '12px' }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0f172a' }}>
                        <div>{st.fullName}</div>
                        {st.email && (
                          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '400' }}>{st.email}</div>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px', color: '#475569', fontFamily: 'monospace', fontSize: '12px' }}>
                        {st.mathitisAr || '—'}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        {st.phone ? (
                          <a 
                            href={`tel:${st.phone}`} 
                            style={{ 
                              color: '#2563eb', 
                              textDecoration: 'none', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontWeight: '500',
                              fontSize: '12.5px'
                            }}
                          >
                            <Phone size={12} />
                            <span>{st.phone}</span>
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: st.status === 'graduate' ? '#dcfce7' : st.status === 'dropped_out' ? '#fee2e2' : '#dbeafe',
                          color: st.status === 'graduate' ? '#15803d' : st.status === 'dropped_out' ? '#b91c1c' : '#1d4ed8'
                        }}>
                          {st.status === 'graduate' ? 'Απόφοιτος' : st.status === 'dropped_out' ? 'Διέκοψε' : 'Ενεργός'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
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
                            title="Αφαίρεση σπουδαστή από αυτό το τμήμα"
                          >
                            <UserMinus size={13} />
                            <span>Αφαίρεση από Τμήμα</span>
                          </button>

                          {onDeleteStudent && (
                            <button
                              type="button"
                              onClick={() => handleDeletePermanent(st)}
                              disabled={actionLoading}
                              style={{
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title="Οριστική διαγραφή σπουδαστή από το σύστημα"
                            >
                              <Trash2 size={13} color="#ef4444" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
            Τμήμα: <strong>{section.name}</strong> • Σύνολο: <strong>{enrolledStudents.length}</strong>
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
