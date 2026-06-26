import React, { useMemo, useState } from 'react';
import {
  X, User, Phone, Mail, BookOpen, GraduationCap,
  Hash, BarChart2, CheckCircle, AlertCircle, Clock, FileText, Download, Fingerprint, CreditCard, Shield, Eye
} from 'lucide-react';

const gradeColor = (g) => {
  if (g === '' || g === null || g === undefined) return { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' };
  const n = parseFloat(g);
  if (isNaN(n)) return { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' };
  if (n >= 9) return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  if (n >= 7) return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  if (n >= 5) return { bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
  return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
};

export default function StudentProfileModal({
  isOpen,
  onClose,
  student,
  specialties = [],
  grades = [],
  absences = []
}) {
  const specialty = useMemo(
    () => specialties.find((s) => s.id === student?.specialtyId),
    [specialties, student]
  );
  
  const [previewDoc, setPreviewDoc] = useState(null);

  if (!isOpen || !student) return null;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAbsences = absences.filter(a => a.studentId === student.id);

  const absencesByCourse = {};
  studentAbsences.forEach(abs => {
    if (!absencesByCourse[abs.courseTitle]) absencesByCourse[abs.courseTitle] = 0;
    absencesByCourse[abs.courseTitle] += abs.hours;
  });

  const allCoursesSet = new Set([
    ...studentGrades.map(g => g.courseTitle),
    ...studentAbsences.map(a => a.courseTitle)
  ]);
  const coursesList = Array.from(allCoursesSet);

  return (
    <div className="dialog-overlay" style={{ zIndex: 1100 }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        width: '900px',
        maxWidth: '96vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#fff',
          gap: '10px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>{student.fullName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{student.mathitisAr}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc', flexDirection: 'row' }}>
          {/* Left Side: Profile Information */}
          <div style={{ flex: 1, background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="#3b82f6" /> Στοιχεία Σπουδαστή
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Τηλέφωνο Επικοινωνίας</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}><Phone size={14} color="#64748b" /> {student.phone || '-'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}><Mail size={14} color="#64748b" /> {student.email || '-'}</div>
              </div>
              
              {/* IDs Block */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>ΑΜΚΑ</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}><Shield size={14} color="#64748b" /> {student.amka || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>ΑΦΜ</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}><CreditCard size={14} color="#64748b" /> {student.afm || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Α.Τ. (Ταυτότητα)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}><Fingerprint size={14} color="#64748b" /> {student.idNumber || '-'}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Ειδικότητα</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}><BookOpen size={14} color="#64748b" /> {specialty?.title || '-'}</div>
              </div>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                <div style={{ fontSize: '0.7rem', color: '#c2410c', textTransform: 'uppercase', marginBottom: '4px' }}>Οικονομική Εικόνα</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#9a3412', fontWeight: '500', fontSize: '0.85rem' }}>Συνολική Οφειλή:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ea580c' }}>{parseFloat(student.totalDebt || 0).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                </div>
              </div>

              {/* Documents Section */}
              <div style={{ background: '#f0fdfa', padding: '12px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                <div style={{ fontSize: '0.7rem', color: '#0f766e', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} /> Δικαιολογητικά
                </div>
                {(!student.documents || student.documents.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Δεν υπάρχουν δικαιολογητικά.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {student.documents.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                        <div style={{ fontSize: '0.8rem', color: '#134e4a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={doc.name}>
                          {doc.name}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            style={{ color: '#0f766e', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                            title="Προεπισκόπηση"
                          >
                            <Eye size={14} />
                          </button>
                          <a 
                            href={doc.data} 
                            download={doc.name}
                            style={{ color: '#0d9488', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                            title="Λήψη Αρχείου"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Grades & Absences */}
          <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <BarChart2 size={16} color="#2563eb" />
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>Βαθμολογίες & Απουσίες</span>
            </div>
            {coursesList.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '8px' }}>
                <AlertCircle size={36} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: '0.85rem' }}>Δεν υπάρχουν καταχωρημένες πληροφορίες.</span>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Μάθημα</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Απουσίες</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Πρόοδος</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Τελικός</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Μ.Ο.</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesList.map((courseTitle, idx) => {
                    const gradeRecord = studentGrades.find(g => g.courseTitle === courseTitle) || {};
                    const absHours = absencesByCourse[courseTitle] || 0;
                    const progress = gradeRecord.progressGrade || '';
                    const final = gradeRecord.finalGrade || '';
                    let avg = '-';
                    if (progress !== '' && final !== '') avg = ((parseFloat(progress) + parseFloat(final)) / 2).toFixed(1);
                    else if (progress !== '') avg = parseFloat(progress).toFixed(1);
                    else if (final !== '') avg = parseFloat(final).toFixed(1);
                    const gradeCol = gradeColor(avg);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '500' }}>{courseTitle}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ background: absHours > 0 ? '#fee2e2' : '#f0fdf4', color: absHours > 0 ? '#ef4444' : '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{absHours > 0 ? `${absHours} ώρες` : '0'}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{progress || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{final || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ background: gradeCol.bg, color: gradeCol.text, border: `1px solid ${gradeCol.border}`, padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>{avg}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 18px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button onClick={onClose} style={{ height: '30px', padding: '0 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
            Κλείσιμο
          </button>
        </div>
      </div>

      {/* Document Preview Overlay */}
      {previewDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '500', marginLeft: '24px' }}>
              Προεπισκόπηση: {previewDoc.name}
            </div>
            <button onClick={() => setPreviewDoc(null)} style={{ background: '#ef4444', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '24px' }}>
              <X size={20} color="#fff" />
            </button>
          </div>
          <div style={{ flex: 1, width: '90%', maxWidth: '1000px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '20px' }}>
            {previewDoc.type.startsWith('image/') ? (
              <img src={previewDoc.data} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} alt="Preview" />
            ) : previewDoc.type === 'application/pdf' ? (
              <iframe src={previewDoc.data} style={{ width: '100%', height: '100%', border: 'none', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} title="PDF Preview" />
            ) : (
              <div style={{ color: '#fff' }}>Μη υποστηριζόμενος τύπος αρχείου για προεπισκόπηση. Παρακαλώ κατεβάστε το.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
