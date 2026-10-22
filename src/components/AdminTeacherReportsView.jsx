import React, { useState } from 'react';
import { FileText, Eye, X, Calendar as CalendarIcon, Clock, Users, Trash2, RefreshCw, ExternalLink, Edit2, CheckCircle2 } from 'lucide-react';

export default function AdminTeacherReportsView({ 
  reports = [], 
  students = [], 
  specialties = [], 
  absences = [],
  onViewStudentProfile,
  onDeleteReport,
  onUpdateReportDate,
  onRefresh,
  isRefreshing = false
}) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [newReportDate, setNewReportDate] = useState('');
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const [dateUpdateSuccess, setDateUpdateSuccess] = useState(false);

  // Sort reports by date descending
  const sortedReports = [...reports].sort((a, b) => new Date(b.submittedAt || b.timestamp || b.date) - new Date(a.submittedAt || a.timestamp || a.date));

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }
    try {
      return new Date(dateStr).toLocaleDateString('el-GR');
    } catch {
      return dateStr;
    }
  };

  const handleOpenDateModal = (report, e) => {
    if (e) e.stopPropagation();
    setEditingReport(report);
    const curDate = report.date ? (report.date.includes('T') ? report.date.split('T')[0] : report.date) : '';
    setNewReportDate(curDate);
    setDateUpdateSuccess(false);
  };

  const handleCloseDateModal = () => {
    if (isUpdatingDate) return;
    setEditingReport(null);
    setNewReportDate('');
    setDateUpdateSuccess(false);
  };

  const handleSaveReportDate = async (e) => {
    e.preventDefault();
    if (!editingReport || !newReportDate) return;
    const curDate = editingReport.date ? (editingReport.date.includes('T') ? editingReport.date.split('T')[0] : editingReport.date) : '';
    if (newReportDate === curDate) {
      handleCloseDateModal();
      return;
    }

    setIsUpdatingDate(true);
    try {
      if (onUpdateReportDate) {
        await onUpdateReportDate(editingReport, newReportDate);
        if (selectedReport && selectedReport.id === editingReport.id) {
          setSelectedReport(prev => ({
            ...prev,
            date: newReportDate
          }));
        }
      }
      setDateUpdateSuccess(true);
      setTimeout(() => {
        handleCloseDateModal();
      }, 700);
    } catch (err) {
      console.error('Error updating report date:', err);
    } finally {
      setIsUpdatingDate(false);
    }
  };

  const handleDeleteReport = async (report) => {
    const reportInfo = `${report.teacherName || 'Εκπαιδευτικός'} — ${report.courseTitle || 'Μάθημα'} (${formatDateDisplay(report.date)})`;
    const absCount = report.absences ? report.absences.length : (report.absentStudents ? report.absentStudents.length : 0);
    const absencesWarning = absCount > 0
      ? `\n\n⚠️ ΠΡΟΣΟΧΗ: Θα διαγραφούν αυτόματα και οι ${absCount} ${absCount === 1 ? 'απουσία' : 'απουσίες'} μαθητών που είχαν καταχωρηθεί με αυτή τη δήλωση!`
      : '';
    const confirmed = window.confirm(
      `Επιβεβαίωση Διαγραφής:\n\nΕίστε βέβαιοι ότι θέλετε να διαγράψετε τη δήλωση μαθήματος:\n"${reportInfo}";${absencesWarning}\n\nΗ ενέργεια αυτή θα διαγράψει οριστικά τη δήλωση και τις σχετικές απουσίες από το σύστημα.`
    );
    if (!confirmed) return;

    if (onDeleteReport) {
      await onDeleteReport(report);
    }
    if (selectedReport && selectedReport.id === report.id) {
      setSelectedReport(null);
    }
  };

  const findStudent = (idOrName) => {
    if (!idOrName) return null;
    return students.find(s => s.id === idOrName) || 
           students.find(s => s.fullName === idOrName || (s.fullName && s.fullName.toLowerCase() === String(idOrName).toLowerCase()));
  };

  const getStudentName = (id) => {
    const student = students.find(s => s.id === id);
    return student ? student.fullName : 'Άγνωστος Μαθητής';
  };

  const getSpecialtyTitle = (report) => {
    const spec = specialties.find(s => s.id === (report.specialtyId || report.sectionId));
    const baseSpec = spec ? spec.title : (report.specialtyTitle || '');
    if (report.sectionName && report.sectionName !== baseSpec) {
      return baseSpec ? `${report.sectionName} — ${baseSpec}` : report.sectionName;
    }
    return baseSpec || report.sectionName || 'Γενική Ειδικότητα';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="grid-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="grid-title">Δηλώσεις & Αναφορές Καθηγητών</span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '12px', fontWeight: '500' }}>
            Σύνολο: <strong>{reports.length}</strong> {reports.length === 1 ? 'δήλωση' : 'δηλώσεις'}
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: '600',
              fontSize: '13px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', color: '#2563eb' }} />
            <span>{isRefreshing ? 'Ανανέωση...' : 'Ανανέωση'}</span>
          </button>
        )}
      </div>

      <div className="desktop-grid-container" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, overflow: 'auto' }}>
        {reports.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '8px', minHeight: '300px' }}>
            <FileText size={36} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Δεν υπάρχουν υποβεβλημένες δηλώσεις καθηγητών ακόμα.</span>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                style={{
                  marginTop: '8px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Έλεγχος για νέες δηλώσεις
              </button>
            )}
          </div>
        ) : (
          <table className="desktop-table">
            <thead>
              <tr>
                <th style={{ width: '14%' }}>Ημερομηνία</th>
                <th style={{ width: '21%' }}>Εκπαιδευτής</th>
                <th style={{ width: '29%' }}>Μάθημα / Ειδικότητα</th>
                <th style={{ width: '13%', textAlign: 'center' }}>Χτύπημα Κάρτας</th>
                <th style={{ width: '7%', textAlign: 'center' }}>Ώρες</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Απουσίες</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map(report => {
                const specTitle = getSpecialtyTitle(report);
                const absCount = report.absences ? report.absences.length : (report.absentStudents ? report.absentStudents.length : 0);
                
                return (
                  <tr key={report.id}>
                    <td style={{ fontWeight: '500', color: '#0f172a' }}>
                      <div 
                        onClick={() => onUpdateReportDate && handleOpenDateModal(report)}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          cursor: onUpdateReportDate ? 'pointer' : 'default',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease',
                          border: onUpdateReportDate ? '1px solid transparent' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (onUpdateReportDate) {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (onUpdateReportDate) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                        title={onUpdateReportDate ? "Κάντε κλικ για αλλαγή ημερομηνίας δήλωσης" : undefined}
                      >
                        <span>{formatDateDisplay(report.date)}</span>
                        {onUpdateReportDate && (
                          <Edit2 size={12} style={{ color: '#2563eb', opacity: 0.8 }} />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600', color: '#334155' }}>
                      {report.teacherName}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{report.courseTitle}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{specTitle}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '13px', color: '#475569' }}>
                      {report.arrivalTime && report.departureTime ? (
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: '600', color: '#0f172a', letterSpacing: '0.02em' }}>
                          {report.arrivalTime} - {report.departureTime}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
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
                        <span style={{ color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>0 (Όλοι)</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => setSelectedReport(report)}
                          style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'transform 0.15s ease' }}
                          title="Προβολή Αναφοράς"
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Eye size={18} />
                        </button>
                        {onUpdateReportDate && (
                          <button 
                            onClick={(e) => handleOpenDateModal(report, e)}
                            style={{ background: 'transparent', border: 'none', color: '#d97706', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'transform 0.15s ease' }}
                            title="Αλλαγή Ημερομηνίας Δήλωσης"
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <CalendarIcon size={18} />
                          </button>
                        )}
                        {onDeleteReport && (
                          <button 
                            onClick={() => handleDeleteReport(report)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'transform 0.15s ease' }}
                            title="Διαγραφή Αναφοράς"
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
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
          <div className="sys-modal" style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '720px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            
            <div className="sys-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="sys-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <FileText size={20} color="#3b82f6" />
                </div>
                Λεπτομέρειες Δήλωσης Μαθήματος
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
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

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Ειδικοτητα / Τμημα</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{getSpecialtyTitle(selectedReport)}</div>
                </div>
                
                <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }}></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: selectedReport.arrivalTime && selectedReport.departureTime ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                        <CalendarIcon size={16} color="#64748b" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ημερομηνία</div>
                        <span style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>{formatDateDisplay(selectedReport.date)}</span>
                      </div>
                    </div>
                    {onUpdateReportDate && (
                      <button
                        type="button"
                        onClick={() => handleOpenDateModal(selectedReport)}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        title="Αλλαγή Ημερομηνίας Δήλωσης"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                      >
                        <Edit2 size={12} />
                        <span>Αλλαγή</span>
                      </button>
                    )}
                  </div>

                  {selectedReport.arrivalTime && selectedReport.departureTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: '#f0fdf4', padding: '6px', borderRadius: '6px' }}>
                        <Clock size={16} color="#16a34a" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Χτύπημα Κάρτας</div>
                        <span style={{ fontWeight: '600', color: '#16a34a', fontSize: '13px' }}>{selectedReport.arrivalTime} - {selectedReport.departureTime}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '6px' }}>
                      <Clock size={16} color="#2563eb" />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Διάρκεια</div>
                      <span style={{ fontWeight: '600', color: '#2563eb', fontSize: '13px' }}>{selectedReport.hours} {selectedReport.hours === 1 ? 'Ώρα' : 'Ώρες'}</span>
                    </div>
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
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Σπουδαστής</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Σήμερα</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Στο Μάθημα</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Γενικό Σύνολο</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Καρτέλα</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.absences && selectedReport.absences.length > 0 ? (
                        selectedReport.absences.map((abs, idx) => {
                          const student = findStudent(abs.studentId);
                          const studentId = student?.id || abs.studentId;
                          const studentDisplayName = student ? student.fullName : getStudentName(abs.studentId);
                          const courseAbsences = absences
                            .filter(a => a.studentId === studentId && a.courseTitle === selectedReport.courseTitle)
                            .reduce((sum, a) => sum + (a.hours || 0), 0);
                          const totalStudentAbsences = absences
                            .filter(a => a.studentId === studentId)
                            .reduce((sum, a) => sum + (a.hours || 0), 0);

                          return (
                            <tr key={`new-${idx}`} style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                              <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b', fontSize: '13.5px' }}>
                                {student && onViewStudentProfile ? (
                                  <button
                                    type="button"
                                    onClick={() => onViewStudentProfile(student, 'grades')}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      color: '#2563eb',
                                      fontWeight: '600',
                                      fontSize: '13.5px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                    title="Προβολή απουσιών & καρτέλας σπουδαστή"
                                  >
                                    <span>{studentDisplayName}</span>
                                    <ExternalLink size={12} color="#3b82f6" />
                                  </button>
                                ) : (
                                  <span>{studentDisplayName}</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#ef4444', fontSize: '13.5px' }}>
                                {abs.hours} {abs.hours === 1 ? 'ώρα' : 'ώρες'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                  {courseAbsences > 0 ? `${courseAbsences} ώρες` : `${abs.hours} ώρες`}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                  {totalStudentAbsences > 0 ? `${totalStudentAbsences} ώρες` : `${abs.hours} ώρες`}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                {student && onViewStudentProfile && (
                                  <button
                                    type="button"
                                    onClick={() => onViewStudentProfile(student, 'grades')}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#eff6ff',
                                      color: '#2563eb',
                                      border: '1px solid #bfdbfe',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title="Άνοιγμα καρτέλας & όλων των απουσιών"
                                  >
                                    <Eye size={13} />
                                    <span>Προβολή</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        selectedReport.absentStudents && selectedReport.absentStudents.map((studentName, idx) => {
                          const student = findStudent(studentName);
                          const studentId = student?.id;
                          const courseAbsences = studentId ? absences
                            .filter(a => a.studentId === studentId && a.courseTitle === selectedReport.courseTitle)
                            .reduce((sum, a) => sum + (a.hours || 0), 0) : 0;
                          const totalStudentAbsences = studentId ? absences
                            .filter(a => a.studentId === studentId)
                            .reduce((sum, a) => sum + (a.hours || 0), 0) : 0;
                          const reportHours = selectedReport.hours || 1;

                          return (
                            <tr key={`old-${idx}`} style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                              <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b', fontSize: '13.5px' }}>
                                {student && onViewStudentProfile ? (
                                  <button
                                    type="button"
                                    onClick={() => onViewStudentProfile(student, 'grades')}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      color: '#2563eb',
                                      fontWeight: '600',
                                      fontSize: '13.5px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                    title="Προβολή απουσιών & καρτέλας σπουδαστή"
                                  >
                                    <span>{studentName}</span>
                                    <ExternalLink size={12} color="#3b82f6" />
                                  </button>
                                ) : (
                                  <span>{studentName}</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#ef4444', fontSize: '13.5px' }}>
                                {reportHours} {reportHours === 1 ? 'ώρα' : 'ώρες'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                  {courseAbsences > 0 ? `${courseAbsences} ώρες` : `${reportHours} ώρες`}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                  {totalStudentAbsences > 0 ? `${totalStudentAbsences} ώρες` : `${reportHours} ώρες`}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                {student && onViewStudentProfile && (
                                  <button
                                    type="button"
                                    onClick={() => onViewStudentProfile(student, 'grades')}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#eff6ff',
                                      color: '#2563eb',
                                      border: '1px solid #bfdbfe',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title="Άνοιγμα καρτέλας & όλων των απουσιών"
                                  >
                                    <Eye size={13} />
                                    <span>Προβολή</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} />
                  Ημερομηνία Υποβολής: {selectedReport.timestamp ? new Date(selectedReport.timestamp).toLocaleString('el-GR') : 'Άγνωστη'}
                </span>
                {onDeleteReport && (
                  <button
                    onClick={() => handleDeleteReport(selectedReport)}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    title="Οριστική διαγραφή αυτής της δήλωσης"
                  >
                    <Trash2 size={14} />
                    <span>Διαγραφή Δήλωσης</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Edit Modal */}
      {editingReport && (
        <div 
          className="sys-modal-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.55)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1200, 
            backdropFilter: 'blur(4px)' 
          }}
          onClick={handleCloseDateModal}
        >
          <div 
            className="sys-modal" 
            style={{ 
              background: '#ffffff', 
              borderRadius: '14px', 
              width: '100%', 
              maxWidth: '460px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              overflow: 'hidden' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                  <CalendarIcon size={18} color="#2563eb" />
                </div>
                Αλλαγή Ημερομηνίας Δήλωσης
              </h3>
              <button
                onClick={handleCloseDateModal}
                disabled={isUpdatingDate}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReportDate} style={{ padding: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {editingReport.courseTitle}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span>Εκπαιδευτής: <strong style={{ color: '#334155' }}>{editingReport.teacherName}</strong></span>
                  <span>Τρέχουσα: <strong style={{ color: '#334155' }}>{formatDateDisplay(editingReport.date)}</strong></span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Νέα Ημερομηνία Δήλωσης <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={newReportDate}
                  onChange={(e) => setNewReportDate(e.target.value)}
                  required
                  disabled={isUpdatingDate}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                />
              </div>

              {/* Notice about absences */}
              {(() => {
                const absCount = editingReport.absences ? editingReport.absences.length : (editingReport.absentStudents ? editingReport.absentStudents.length : 0);
                return absCount > 0 ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '20px', display: 'flex', gap: '8px', lineHeight: '1.45' }}>
                    <span style={{ fontSize: '15px' }}>ℹ️</span>
                    <div>
                      <strong>Συγχρονισμός Απουσιών:</strong> Η δήλωση περιλαμβάνει <strong>{absCount} {absCount === 1 ? 'απουσία' : 'απουσίες'}</strong> μαθητών. Η ημερομηνία τους στο απουσιολόγιο και στις καρτέλες των σπουδαστών θα μεταφερθεί αυτόματα στη νέα ημερομηνία.
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#166534', marginBottom: '20px' }}>
                    ✓ Δεν υπάρχουν καταχωρημένες απουσίες σπουδαστών σε αυτή τη δήλωση.
                  </div>
                );
              })()}

              {dateUpdateSuccess && (
                <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>Η ημερομηνία ενημερώθηκε επιτυχώς!</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseDateModal}
                  disabled={isUpdatingDate}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: isUpdatingDate ? 'not-allowed' : 'pointer'
                  }}
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDate || !newReportDate || newReportDate === (editingReport.date ? editingReport.date.split('T')[0] : '')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: (isUpdatingDate || !newReportDate || newReportDate === (editingReport.date ? editingReport.date.split('T')[0] : '')) ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: (isUpdatingDate || !newReportDate || newReportDate === (editingReport.date ? editingReport.date.split('T')[0] : '')) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isUpdatingDate ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Αποθήκευση...</span>
                    </>
                  ) : (
                    <span>Αποθήκευση Αλλαγής</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
