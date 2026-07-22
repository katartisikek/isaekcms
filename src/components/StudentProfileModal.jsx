import React, { useMemo, useState, useEffect } from 'react';
import {
  X, User, Phone, Mail, BookOpen, GraduationCap,
  Hash, BarChart2, CheckCircle, AlertCircle, Clock, FileText, Download, Fingerprint, CreditCard, Shield, Eye, Award,
  Plus, Edit2, Trash2, Save, CalendarDays, Euro, Printer
} from 'lucide-react';
import { exportStudentPaymentReport } from '../services/exportExcel';

const gradeColor = (g) => {
  if (g === '' || g === null || g === undefined) return { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' };
  const n = parseFloat(g);
  if (isNaN(n)) return { bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0' };
  if (n >= 9) return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  if (n >= 7) return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  if (n >= 5) return { bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
  return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
};

// Helper to format date for input[type=date]
const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
};

export default function StudentProfileModal({
  isOpen,
  onClose,
  student,
  specialties = [],
  grades = [],
  absences = [],
  onUpdateDebt,
  paymentRecords = [],
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  currentUser
}) {
  const specialty = useMemo(
    () => specialties.find((s) => s.id === student?.specialtyId),
    [specialties, student]
  );
  
  const [previewDoc, setPreviewDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'grades'

  // Payment form state
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState(toInputDate(new Date().toISOString()));
  const [newPaymentNotes, setNewPaymentNotes] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  // Edit payment state
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPaymentDate, setEditPaymentDate] = useState('');
  const [editPaymentNotes, setEditPaymentNotes] = useState('');

  // Full payment state
  const [showFullPaymentDate, setShowFullPaymentDate] = useState(false);
  const [fullPaymentDate, setFullPaymentDate] = useState(toInputDate(new Date().toISOString()));
  const [fullPaymentNotes, setFullPaymentNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowAddPayment(false);
      setNewPaymentAmount('');
      setNewPaymentDate(toInputDate(new Date().toISOString()));
      setNewPaymentNotes('');
      setEditingPaymentId(null);
      setShowFullPaymentDate(false);
      setFullPaymentDate(toInputDate(new Date().toISOString()));
      setFullPaymentNotes('');
    }
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAbsences = absences.filter(a => a.studentId === student.id);
  const studentPayments = paymentRecords.filter(p => p.studentId === student.id)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

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

  const currentDebt = parseFloat(student.totalDebt || 0);
  const currentPaid = parseFloat(student.paidAmount || 0);
  const totalExpected = currentDebt + currentPaid;

  // Add payment handler
  const handleAddPayment = async () => {
    const amount = parseFloat(newPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      window.alert('Παρακαλώ εισάγετε έγκυρο ποσό.');
      return;
    }
    if (!newPaymentDate) {
      window.alert('Παρακαλώ επιλέξτε ημερομηνία πληρωμής.');
      return;
    }
    if (amount > currentDebt) {
      window.alert(`Το ποσό (${amount}€) δεν μπορεί να υπερβαίνει την οφειλή (${currentDebt.toFixed(2)}€).`);
      return;
    }
    setPaymentSaving(true);
    try {
      await onAddPayment(student.id, amount, newPaymentDate, newPaymentNotes, currentDebt, currentPaid);
      setNewPaymentAmount('');
      setNewPaymentDate(toInputDate(new Date().toISOString()));
      setNewPaymentNotes('');
      setShowAddPayment(false);
    } finally {
      setPaymentSaving(false);
    }
  };

  // Full payment handler
  const handleFullPayment = async () => {
    if (!fullPaymentDate) {
      window.alert('Παρακαλώ επιλέξτε ημερομηνία πληρωμής.');
      return;
    }
    if (window.confirm(`Επιβεβαίωση Ολικής Εξόφλησης ποσού ${currentDebt.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} για ${student.fullName};`)) {
      setPaymentSaving(true);
      try {
        await onAddPayment(student.id, currentDebt, fullPaymentDate, fullPaymentNotes || 'Ολική εξόφληση', currentDebt, currentPaid);
        setShowFullPaymentDate(false);
        setFullPaymentDate(toInputDate(new Date().toISOString()));
        setFullPaymentNotes('');
      } finally {
        setPaymentSaving(false);
      }
    }
  };

  // Start editing payment
  const startEditPayment = (payment) => {
    setEditingPaymentId(payment.id);
    setEditPaymentAmount(String(payment.amount));
    setEditPaymentDate(toInputDate(payment.paymentDate));
    setEditPaymentNotes(payment.notes || '');
  };

  // Save edited payment
  const saveEditPayment = async (payment) => {
    const amount = parseFloat(editPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      window.alert('Παρακαλώ εισάγετε έγκυρο ποσό.');
      return;
    }
    if (!editPaymentDate) {
      window.alert('Παρακαλώ επιλέξτε ημερομηνία.');
      return;
    }
    const oldAmount = parseFloat(payment.amount);
    const diff = amount - oldAmount;
    // Validation: new amount cannot exceed remaining debt + old amount
    const maxAllowed = currentDebt + oldAmount;
    if (amount > maxAllowed) {
      window.alert(`Το νέο ποσό (${amount}€) υπερβαίνει την ανώτατη επιτρεπτή αξία (${maxAllowed.toFixed(2)}€).`);
      return;
    }
    await onEditPayment(payment.id, {
      ...payment,
      amount,
      paymentDate: editPaymentDate,
      notes: editPaymentNotes,
    }, diff, student.id, currentDebt, currentPaid);
    setEditingPaymentId(null);
  };

  // Delete payment
  const handleDeletePayment = async (payment) => {
    if (window.confirm(`Διαγραφή πληρωμής ${parseFloat(payment.amount).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} (${new Date(payment.paymentDate).toLocaleDateString('el-GR')});`)) {
      await onDeletePayment(payment.id, parseFloat(payment.amount), student.id, currentDebt, currentPaid);
    }
  };

  const paidPercentage = totalExpected > 0 ? Math.round((currentPaid / totalExpected) * 100) : 0;

  return (
    <div className="dialog-overlay" style={{ zIndex: 1100 }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        width: '1000px',
        maxWidth: '97vw',
        maxHeight: '92vh',
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
              <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {student.fullName}
                {student.status === 'bek_graduate' && (
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={12} />
                    Απόφοιτος ΒΕΚ
                  </span>
                )}
              </div>
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
          <div style={{ width: '260px', flexShrink: 0, background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="#3b82f6" /> Στοιχεία Σπουδαστή
            </h3>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Τηλέφωνο</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.85rem' }}><Phone size={13} color="#64748b" /> {student.phone || '-'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.85rem' }}><Mail size={13} color="#64748b" /> {student.email || '-'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>ΑΜΚΑ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.85rem' }}><Shield size={13} color="#64748b" /> {student.amka || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>ΑΦΜ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.85rem' }}><CreditCard size={13} color="#64748b" /> {student.afm || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Α.Τ.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.85rem' }}><Fingerprint size={13} color="#64748b" /> {student.idNumber || '-'}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Ειδικότητα</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '500', fontSize: '0.85rem' }}><BookOpen size={13} color="#64748b" /> {specialty?.title || '-'}</div>
            </div>

            {/* BEK Degree Section */}
            {student.bekDegree && (
              <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.65rem', color: '#991b1b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={11} /> Πτυχίο ΒΕΚ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '5px 8px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: '0.78rem', color: '#7f1d1d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }} title={student.bekDegree.name}>
                    {student.bekDegree.name}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => setPreviewDoc(student.bekDegree)} style={{ color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Προεπισκόπηση Πτυχίου"><Eye size={13} /></button>
                    <a href={student.bekDegree.data} download={student.bekDegree.name} style={{ color: '#b91c1c', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Λήψη Πτυχίου"><Download size={13} /></a>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div style={{ background: '#f0fdfa', padding: '10px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
              <div style={{ fontSize: '0.65rem', color: '#0f766e', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={11} /> Δικαιολογητικά
              </div>
              {(!student.documents || student.documents.length === 0) ? (
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>Δεν υπάρχουν δικαιολογητικά.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {student.documents.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '5px 8px', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                      <div style={{ fontSize: '0.78rem', color: '#134e4a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }} title={doc.name}>{doc.name}</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" onClick={() => setPreviewDoc(doc)} style={{ color: '#0f766e', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Προεπισκόπηση"><Eye size={13} /></button>
                        <a href={doc.data} download={doc.name} style={{ color: '#0d9488', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Λήψη"><Download size={13} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Tabs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
              <button
                onClick={() => setActiveTab('payments')}
                style={{
                  padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                  background: activeTab === 'payments' ? '#fff' : '#f8fafc',
                  color: activeTab === 'payments' ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === 'payments' ? '2px solid #2563eb' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Euro size={15} /> Οικονομικά & Πληρωμές
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                style={{
                  padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                  background: activeTab === 'grades' ? '#fff' : '#f8fafc',
                  color: activeTab === 'grades' ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === 'grades' ? '2px solid #2563eb' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <BarChart2 size={15} /> Βαθμολογίες & Απουσίες
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              
              {/* ===== PAYMENTS TAB ===== */}
              {activeTab === 'payments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Financial Summary */}
                  <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c2410c', textTransform: 'uppercase', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Euro size={13} /> Οικονομική Εικόνα
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <div style={{ flex: 1, minWidth: '120px', background: '#fff', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>Συνολικό Ποσό</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#78350f' }}>{totalExpected.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: '120px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#14532d', textTransform: 'uppercase', marginBottom: '4px' }}>Εξοφλήθηκε</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803d' }}>{currentPaid.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: '120px', background: currentDebt > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${currentDebt > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.65rem', color: currentDebt > 0 ? '#991b1b' : '#14532d', textTransform: 'uppercase', marginBottom: '4px' }}>Υπόλοιπο</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: currentDebt > 0 ? '#dc2626' : '#15803d' }}>{currentDebt.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#92400e', marginBottom: '4px' }}>
                        <span>Πρόοδος Πληρωμής</span>
                        <span style={{ fontWeight: '700' }}>{paidPercentage}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#fed7aa', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${paidPercentage}%`, background: paidPercentage === 100 ? '#16a34a' : '#f97316', borderRadius: '4px', transition: 'width 0.4s' }} />
                      </div>
                    </div>
                    {/* Actions */}
                    {currentDebt > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { setShowFullPaymentDate(!showFullPaymentDate); setShowAddPayment(false); }}
                          disabled={paymentSaving}
                          style={{ flex: 1, minWidth: '140px', background: '#16a34a', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                          <CheckCircle size={14} /> Ολική Εξόφληση
                        </button>
                        <button
                          onClick={() => { setShowAddPayment(!showAddPayment); setShowFullPaymentDate(false); }}
                          disabled={paymentSaving}
                          style={{ flex: 1, minWidth: '140px', background: '#f97316', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                          <Plus size={14} /> Μερική Πληρωμή
                        </button>
                        <button
                          onClick={() => exportStudentPaymentReport(student, studentPayments, specialty)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Download size={14} /> Αναφορά Excel
                        </button>
                      </div>
                    )}
                    {currentDebt === 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '600', fontSize: '0.85rem' }}>
                          <CheckCircle size={16} /> Πλήρως Εξοφλημένος
                        </div>
                        <button
                          onClick={() => exportStudentPaymentReport(student, studentPayments, specialty)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Download size={13} /> Αναφορά Excel
                        </button>
                      </div>
                    )}

                    {/* Full payment date picker */}
                    {showFullPaymentDate && (
                      <div style={{ marginTop: '10px', background: '#fff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#166534' }}>Ολική Εξόφληση — Επιβεβαίωση Ημερομηνίας</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="date"
                            value={fullPaymentDate}
                            onChange={e => setFullPaymentDate(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <input
                            type="text"
                            placeholder="Σημείωση (προαιρετικό)..."
                            value={fullPaymentNotes}
                            onChange={e => setFullPaymentNotes(e.target.value)}
                            style={{ flex: 2, padding: '6px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <button
                            onClick={handleFullPayment}
                            disabled={paymentSaving}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                          >
                            {paymentSaving ? '...' : 'Επιβεβαίωση'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Partial payment form */}
                    {showAddPayment && (
                      <div style={{ marginTop: '10px', background: '#fff', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#9a3412' }}>Καταχώρηση Πληρωμής</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '100px' }}>
                            <label style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>Ποσό (€) *</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={newPaymentAmount}
                              onChange={e => setNewPaymentAmount(e.target.value)}
                              min="0.01"
                              step="0.01"
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>Ημερομηνία Πληρωμής *</label>
                            <input
                              type="date"
                              value={newPaymentDate}
                              onChange={e => setNewPaymentDate(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ flex: 2, minWidth: '150px' }}>
                            <label style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>Σημείωση</label>
                            <input
                              type="text"
                              placeholder="π.χ. 1η δόση, μετρητά..."
                              value={newPaymentNotes}
                              onChange={e => setNewPaymentNotes(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setShowAddPayment(false)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer' }}>Ακύρωση</button>
                          <button onClick={handleAddPayment} disabled={paymentSaving} style={{ padding: '6px 14px', borderRadius: '6px', background: '#f97316', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer' }}>
                            {paymentSaving ? 'Αποθήκευση...' : 'Καταχώρηση'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment History */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#64748b" /> Ιστορικό Πληρωμών
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '1px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>{studentPayments.length}</span>
                    </div>
                    {studentPayments.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                        Δεν υπάρχουν καταχωρημένες πληρωμές.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {studentPayments.map((payment, idx) => (
                          <div key={payment.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                            {editingPaymentId === payment.id ? (
                              // Edit mode
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', marginBottom: '2px' }}>Επεξεργασία Πληρωμής</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <div style={{ flex: 1, minWidth: '90px' }}>
                                    <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Ποσό (€)</label>
                                    <input type="number" value={editPaymentAmount} onChange={e => setEditPaymentAmount(e.target.value)} min="0.01" step="0.01"
                                      style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Ημερομηνία</label>
                                    <input type="date" value={editPaymentDate} onChange={e => setEditPaymentDate(e.target.value)}
                                      style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                                  </div>
                                  <div style={{ flex: 2, minWidth: '150px' }}>
                                    <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Σημείωση</label>
                                    <input type="text" value={editPaymentNotes} onChange={e => setEditPaymentNotes(e.target.value)}
                                      style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => setEditingPaymentId(null)} style={{ padding: '4px 12px', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>Ακύρωση</button>
                                  <button onClick={() => saveEditPayment(payment)} style={{ padding: '4px 12px', borderRadius: '5px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Save size={12} /> Αποθήκευση
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                                  <div style={{ background: '#f0fdf4', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                                    +{parseFloat(payment.amount).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.8rem' }}>
                                    <CalendarDays size={13} />
                                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                  </div>
                                  {payment.notes && (
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>{payment.notes}</div>
                                  )}
                                  {payment.createdBy && (
                                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <User size={11} /> {payment.createdBy}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                  <button onClick={() => startEditPayment(payment)}
                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Επεξεργασία">
                                    <Edit2 size={13} />
                                  </button>
                                  <button onClick={() => handleDeletePayment(payment)}
                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Διαγραφή">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== GRADES TAB ===== */}
              {activeTab === 'grades' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BarChart2 size={16} color="#2563eb" />
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>Βαθμολογίες & Απουσίες</span>
                  </div>
                  {coursesList.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '8px', padding: '40px 0' }}>
                      <AlertCircle size={36} style={{ opacity: 0.4 }} />
                      <span style={{ fontSize: '0.85rem' }}>Δεν υπάρχουν καταχωρημένες πληροφορίες.</span>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Μάθημα</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Απουσίες</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Εργ. 6μήνου</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Εξετάσεις</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Τελικός Βαθμός</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coursesList.map((courseTitle, idx) => {
                          const gradeRecord = studentGrades.find(g => g.courseTitle === courseTitle) || {};
                          const absHours = absencesByCourse[courseTitle] || 0;
                          const progress = gradeRecord.progressGrade || '';
                          const final = gradeRecord.finalGrade || '';
                          let avg = '-';
                          const pNum = parseFloat(progress);
                          const fNum = parseFloat(final);
                          if (!isNaN(pNum) || !isNaN(fNum)) {
                             const pVal = isNaN(pNum) ? 0 : pNum;
                             const fVal = isNaN(fNum) ? 0 : fNum;
                             avg = ((pVal * 0.2) + (fVal * 0.8)).toFixed(1);
                             if (avg.endsWith('.0')) avg = avg.slice(0, -2);
                          }
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
              )}
            </div>
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
            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '500', marginLeft: '24px' }}>Προεπισκόπηση: {previewDoc.name}</div>
            <button onClick={() => setPreviewDoc(null)} style={{ background: '#ef4444', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '24px' }}>
              <X size={20} color="#fff" />
            </button>
          </div>
          <div style={{ flex: 1, width: '90%', maxWidth: '1000px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '20px' }}>
            {previewDoc.type?.startsWith('image/') ? (
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
