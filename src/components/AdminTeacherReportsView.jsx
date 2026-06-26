import React, { useState } from 'react';
import { FileText, Eye, X, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';

export default function AdminTeacherReportsView({ reports = [], students = [], specialties = [] }) {
  const [selectedReport, setSelectedReport] = useState(null);

  // Sort reports by date descending
  const sortedReports = [...reports].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const getStudentName = (id) => {
    const student = students.find(s => s.id === id);
    return student ? student.fullName : 'Άγνωστος Μαθητής';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="grid-header" style={{ marginBottom: '16px' }}>
        <span className="grid-title">Δηλώσεις & Αναφορές Καθηγητών</span>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Σύνολο Δηλώσεων: {reports.length}
        </span>
      </div>

      <div className="desktop-grid-container" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, overflow: 'auto' }}>
        {reports.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '8px', minHeight: '300px' }}>
            <FileText size={36} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Δεν υπάρχουν υποβεβλημένες δηλώσεις καθηγητών ακόμα.</span>
          </div>
        ) : (
          <table className="desktop-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Ημερομηνία</th>
                <th style={{ width: '25%' }}>Εκπαιδευτής</th>
                <th style={{ width: '30%' }}>Μάθημα / Ειδικότητα</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Ώρες Διδ.</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Απουσίες</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map(report => {
                const spec = specialties.find(s => s.id === report.specialtyId);
                const absCount = report.absences ? report.absences.length : 0;
                
                return (
                  <tr key={report.id}>
                    <td style={{ fontWeight: '500', color: '#0f172a' }}>
                      {new Date(report.date).toLocaleDateString('el-GR')}
                    </td>
                    <td style={{ fontWeight: '600', color: '#334155' }}>
                      {report.teacherName}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{report.courseTitle}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{spec ? spec.title : 'Άγνωστη Ειδικότητα'}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#0f172a' }}>
                      {report.taughtHours}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {absCount > 0 ? (
                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          {absCount} Μαθητές
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Καμία</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedReport(report)}
                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                        title="Προβολή Αναφοράς"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="sys-modal-overlay">
          <div className="sys-modal" style={{ maxWidth: '600px' }}>
            <div className="sys-modal-header">
              <h2 className="sys-modal-title">
                <FileText size={20} color="#2563eb" /> Λεπτομέρειες Δήλωσης
              </h2>
              <button className="sys-close-btn" onClick={() => setSelectedReport(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sys-modal-content">
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Εκπαιδευτης</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{selectedReport.teacherName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Μαθημα</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{selectedReport.courseTitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarIcon size={16} color="#64748b" />
                  <span style={{ fontWeight: '500', color: '#334155' }}>{new Date(selectedReport.date).toLocaleDateString('el-GR')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#64748b" />
                  <span style={{ fontWeight: '500', color: '#334155' }}>{selectedReport.taughtHours} Ώρες Διδασκαλίας</span>
                </div>
              </div>

              <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> Καταγραφή Απουσιών
              </h3>

              {!selectedReport.absences || selectedReport.absences.length === 0 ? (
                <div style={{ background: '#f0fdf4', color: '#166534', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                  Κανένας μαθητής δεν απουσίαζε σε αυτή τη δήλωση. Όλοι παρόντες!
                </div>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="sys-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Σπουδαστής</th>
                        <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>Ώρες Απουσίας</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.absences.map((abs, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '500', color: '#334155' }}>
                            {getStudentName(abs.studentId)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                            {abs.hours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '24px', fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
                Ημερομηνία Υποβολής: {new Date(selectedReport.submittedAt).toLocaleString('el-GR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
