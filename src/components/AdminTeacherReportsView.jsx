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
                const absCount = report.absences ? report.absences.length : (report.absentStudents ? report.absentStudents.length : 0);
                
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
                      {report.hours || '-'}
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
        <div className="sys-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="sys-modal" style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            
            <div className="sys-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="sys-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <FileText size={20} color="#3b82f6" />
                </div>
                Λεπτομέρειες Δήλωσης
              </h2>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: '#64748b', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="sys-modal-content" style={{ padding: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Εκπαιδευτης</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{selectedReport.teacherName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Μαθημα</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{selectedReport.courseTitle}</div>
                  </div>
                </div>
                
                <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }}></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                      <CalendarIcon size={16} color="#64748b" />
                    </div>
                    <span style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>{new Date(selectedReport.date).toLocaleDateString('el-GR')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                      <Clock size={16} color="#64748b" />
                    </div>
                    <span style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>{selectedReport.hours} Ώρες Διδασκαλίας</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: '#fef2f2', padding: '6px', borderRadius: '6px' }}>
                  <Users size={16} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: '15px', margin: 0, fontWeight: '600', color: '#1e293b' }}>
                  Καταγραφή Απουσιών
                </h3>
              </div>

              {(!selectedReport.absences || selectedReport.absences.length === 0) && (!selectedReport.absentStudents || selectedReport.absentStudents.length === 0) ? (
                <div style={{ background: '#f0fdf4', color: '#166534', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #dcfce7', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '50%' }}>
                    <Users size={20} color="#15803d" />
                  </div>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>Κανένας μαθητής δεν απουσίαζε. Όλοι παρόντες!</span>
                </div>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  <table className="sys-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Σπουδαστής</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ώρες Απουσίας</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.absences && selectedReport.absences.length > 0 ? (
                        selectedReport.absences.map((abs, idx) => (
                          <tr key={`new-${idx}`} style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                            <td style={{ padding: '14px 16px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>
                              {getStudentName(abs.studentId)}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#ef4444', fontSize: '14px' }}>
                              {abs.hours}
                            </td>
                          </tr>
                        ))
                      ) : (
                        selectedReport.absentStudents && selectedReport.absentStudents.map((studentName, idx) => (
                          <tr key={`old-${idx}`} style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                            <td style={{ padding: '14px 16px', fontWeight: '500', color: '#334155', fontSize: '14px' }}>
                              {studentName}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#ef4444', fontSize: '14px' }}>
                              {selectedReport.hours || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} />
                  Ημερομηνία Υποβολής: {selectedReport.timestamp ? new Date(selectedReport.timestamp).toLocaleString('el-GR') : 'Άγνωστη'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
