import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, User, Phone, Mail, BookOpen, CreditCard, Calendar, FileText } from 'lucide-react';

export default function StudentFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  student = null, 
  specialties = [],
  sections = []
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [amka, setAmka] = useState('');
  const [afm, setAfm] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('active');
  const [bekDegree, setBekDegree] = useState(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [year, setYear] = useState('1ο Έτος');
  const [mathitisAr, setMathitisAr] = useState('');
  const [totalDebt, setTotalDebt] = useState(0);
  const [hasInstallments, setHasInstallments] = useState(false);
  const [calculationMode, setCalculationMode] = useState('by_installments');
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);
  const [desiredMonthlyAmount, setDesiredMonthlyAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      if (student.fullName) {
        const parts = student.fullName.split(' ');
        setLastName(parts[0] || '');
        setFirstName(parts.slice(1).join(' ') || '');
      } else if (student.firstName !== undefined || student.lastName !== undefined) {
        // Pre-filled from interest conversion
        setLastName(student.lastName || '');
        setFirstName(student.firstName || '');
      } else {
        setFirstName('');
        setLastName('');
      }
      setAmka(student.amka || '');
      setAfm(student.afm || '');
      setIdNumber(student.idNumber || '');
      setDocuments(student.documents || []);
      setStatus(student.status || 'active');
      setBekDegree(student.bekDegree || null);
      setPhone(student.phone || '');
      setEmail(student.email || '');
      setSpecialtyId(student.specialtyId || '');
      setSectionId(student.sectionId || '');
      setYear(student.year || '1ο Έτος');
      setMathitisAr(student.mathitisAr || '');
      setTotalDebt(student.totalDebt || 0);
      setHasInstallments(student.hasInstallments || false);
      setNumberOfInstallments(student.numberOfInstallments || 1);
      setNotes(student.notes || '');
      
      const initialDebt = parseFloat(student.totalDebt || 0);
      const initialInstCount = parseInt(student.numberOfInstallments || 1, 10);
      setDesiredMonthlyAmount(initialInstCount > 0 ? parseFloat((initialDebt / initialInstCount).toFixed(2)) : 0);
      setCalculationMode('by_installments');
    } else {
      setFirstName('');
      setLastName('');
      setAmka('');
      setAfm('');
      setIdNumber('');
      setDocuments([]);
      setStatus('active');
      setBekDegree(null);
      setPhone('');
      setEmail('');
      setSpecialtyId('');
      setSectionId('');
      setYear('1ο Έτος');
      setMathitisAr('');
      setTotalDebt(0);
      setHasInstallments(false);
      setNumberOfInstallments(1);
      setDesiredMonthlyAmount(0);
      setCalculationMode('by_installments');
      setNotes('');
    }
    setErrors({});
  }, [student, isOpen, specialties]);

  const groupedSpecialties = useMemo(() => {
    return specialties.reduce((acc, spec) => {
      if (!acc[spec.sector]) {
        acc[spec.sector] = [];
      }
      acc[spec.sector].push(spec);
      return acc;
    }, {});
  }, [specialties]);

  const planDetails = useMemo(() => {
    const debt = parseFloat(totalDebt || 0);
    if (debt <= 0 || !hasInstallments) return null;

    if (calculationMode === 'by_installments') {
      const inst = parseInt(numberOfInstallments || 1, 10);
      if (inst <= 0) return null;
      const amount = (debt / inst).toFixed(2);
      return {
        count: inst,
        text: `${inst} δόσεις από ${parseFloat(amount).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} η καθεμία`
      };
    } else {
      const monthlyAmount = parseFloat(desiredMonthlyAmount || 0);
      if (monthlyAmount <= 0) return null;

      const computedCount = Math.ceil(debt / monthlyAmount);
      
      if (Math.abs((debt / monthlyAmount) - computedCount) < 0.001) {
        return {
          count: computedCount,
          text: `${computedCount} δόσεις από ${monthlyAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} η καθεμία`
        };
      } else {
        const previousInstallmentsCount = computedCount - 1;
        const remainingAmount = parseFloat((debt - (previousInstallmentsCount * monthlyAmount)).toFixed(2));
        return {
          count: computedCount,
          text: `${computedCount} δόσεις (${previousInstallmentsCount} δόσεις των ${monthlyAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} και 1 τελική δόση των ${remainingAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })})`
        };
      }
    }
  }, [totalDebt, hasInstallments, calculationMode, numberOfInstallments, desiredMonthlyAmount]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`Το αρχείο ${file.name} είναι πολύ μεγάλο (όριο 2MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDocuments(prev => [...prev, {
          id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          data: ev.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeDocument = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleBekDegreeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(`Το αρχείο ${file.name} είναι πολύ μεγάλο (όριο 2MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBekDegree({
        id: 'bek_' + Date.now(),
        name: file.name,
        type: file.type,
        data: ev.target.result
      });
      setStatus('bek_graduate'); // Auto-update status
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const removeBekDegree = () => {
    setBekDegree(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!lastName.trim()) {
      newErrors.lastName = 'Το επώνυμο είναι υποχρεωτικό.';
    }
    if (!firstName.trim()) {
      newErrors.firstName = 'Το όνομα είναι υποχρεωτικό.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Το τηλέφωνο είναι υποχρεωτικό.';
    } else if (!/^[0-9+\s-]{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Παρακαλώ εισάγετε ένα έγκυρο τηλέφωνο (τουλάχιστον 10 ψηφία).';
    }
    
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Παρακαλώ εισάγετε ένα έγκυρο email (π.χ. name@example.com).';
    }

    if (totalDebt < 0) {
      newErrors.totalDebt = 'Το ποσό οφειλής δεν μπορεί να είναι αρνητικό.';
    }

    let finalInstallments = 1;
    if (hasInstallments) {
      if (calculationMode === 'by_installments') {
        if (numberOfInstallments < 1) {
          newErrors.numberOfInstallments = 'Ο ελάχιστος αριθμός δόσεων είναι 1.';
        }
        finalInstallments = parseInt(numberOfInstallments, 10) || 1;
      } else {
        if (desiredMonthlyAmount <= 0) {
          newErrors.desiredMonthlyAmount = 'Το μηνιαίο ποσό πρέπει να είναι μεγαλύτερο από 0.';
        } else if (desiredMonthlyAmount > totalDebt) {
          newErrors.desiredMonthlyAmount = 'Το μηνιαίο ποσό δεν μπορεί να υπερβαίνει τη συνολική οφειλή.';
        }
        
        if (desiredMonthlyAmount > 0) {
          finalInstallments = Math.ceil(totalDebt / desiredMonthlyAmount);
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const studentData = {
      fullName: `${lastName.trim()} ${firstName.trim()}`,
      amka: amka.trim(),
      afm: afm.trim(),
      idNumber: idNumber.trim(),
      documents: documents,
      status: status,
      bekDegree: bekDegree,
      phone: phone.trim(),
      email: email.trim(),
      specialtyId,
      sectionId,
      year: year,
      mathitisAr: mathitisAr.trim(),
      totalDebt: parseFloat(totalDebt) || 0,
      hasInstallments,
      numberOfInstallments: hasInstallments ? finalInstallments : 1,
      notes: notes.trim()
    };

    if (student && student.id) {
      studentData.id = student.id;
    }

    onSubmit(studentData);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        {/* Windows style Dialog Header */}
        <div className="dialog-header">
          <div className="dialog-title">
            <User size={14} />
            <span>{student ? 'Επεξεργασία Σπουδαστή' : 'Προσθήκη Νέου Σπουδαστή'}</span>
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Κλείσιμο">
            <X size={16} />
          </button>
        </div>

        {/* Dialog Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            
            {/* Name Fields */}
            <div className="grid-2">
              <div className="sys-group">
                <label className="sys-label" htmlFor="lastName">
                  Επώνυμο <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="lastName"
                    type="text"
                    className="sys-input"
                    placeholder="π.χ. Παπαδόπουλος"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors({ ...errors, lastName: null });
                    }}
                    style={{ width: '100%', paddingLeft: '26px', borderColor: errors.lastName ? 'var(--danger)' : undefined }}
                  />
                  <User size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                {errors.lastName && (
                  <span className="sys-error">{errors.lastName}</span>
                )}
              </div>
              <div className="sys-group">
                <label className="sys-label" htmlFor="firstName">
                  Όνομα <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="firstName"
                    type="text"
                    className="sys-input"
                    placeholder="π.χ. Ιωάννης"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors({ ...errors, firstName: null });
                    }}
                    style={{ width: '100%', paddingLeft: '26px', borderColor: errors.firstName ? 'var(--danger)' : undefined }}
                  />
                  <User size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                {errors.firstName && (
                  <span className="sys-error">{errors.firstName}</span>
                )}
              </div>
            </div>

            {/* Identifiers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="sys-group">
                <label className="sys-label" htmlFor="amka">ΑΜΚΑ</label>
                <input
                  id="amka"
                  type="text"
                  className="sys-input"
                  placeholder="11 ψηφία"
                  value={amka}
                  onChange={(e) => setAmka(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="sys-group">
                <label className="sys-label" htmlFor="afm">ΑΦΜ</label>
                <input
                  id="afm"
                  type="text"
                  className="sys-input"
                  placeholder="9 ψηφία"
                  value={afm}
                  onChange={(e) => setAfm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="sys-group">
                <label className="sys-label" htmlFor="idNumber">Α.Τ.</label>
                <input
                  id="idNumber"
                  type="text"
                  className="sys-input"
                  placeholder="Αριθμός Ταυτότητας"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Layout Grid for Phone & Email to keep form compact */}
            <div className="grid-2">
              {/* Phone */}
              <div className="sys-group">
                <label className="sys-label" htmlFor="phone">
                  Τηλέφωνο <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="phone"
                    type="text"
                    className="sys-input"
                    placeholder="6971234567"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                    style={{ width: '100%', paddingLeft: '26px', borderColor: errors.phone ? 'var(--danger)' : undefined }}
                  />
                  <Phone size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                {errors.phone && (
                  <span className="sys-error">{errors.phone}</span>
                )}
              </div>

              {/* Email */}
              <div className="sys-group">
                <label className="sys-label" htmlFor="email">
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    className="sys-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    style={{ width: '100%', paddingLeft: '26px', borderColor: errors.email ? 'var(--danger)' : undefined }}
                  />
                  <Mail size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                {errors.email && (
                  <span className="sys-error">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Specialty / Department */}
            <div className="sys-group">
              <label className="sys-label" htmlFor="specialty">
                Τομέας & Ειδικότητα
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="specialty"
                  className="sys-input"
                  value={specialtyId}
                  onChange={(e) => {
                    setSpecialtyId(e.target.value);
                    if (errors.specialtyId) setErrors({ ...errors, specialtyId: null });
                  }}
                  style={{ width: '100%', paddingLeft: '26px', cursor: 'pointer', borderColor: errors.specialtyId ? 'var(--danger)' : undefined }}
                >
                  <option value="">-- Χωρίς Ειδικότητα --</option>
                  {Object.keys(groupedSpecialties).map((sector) => (
                    <optgroup key={sector} label={sector}>
                      {groupedSpecialties[sector].map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <BookOpen size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              {errors.specialtyId && (
                <span className="sys-error">{errors.specialtyId}</span>
              )}
            </div>

            {/* Section / Τμήμα */}
            <div className="sys-group">
              <label className="sys-label" htmlFor="section">
                Τμήμα
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="section"
                  className="sys-input"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  style={{ width: '100%', paddingLeft: '26px', cursor: 'pointer' }}
                >
                  <option value="">-- Χωρίς Τμήμα --</option>
                  {sections
                    .filter(sec => !specialtyId || sec.specialtyId === specialtyId)
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                  ))}
                </select>
                <BookOpen size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Year of study & Registration number */}
            <div className="grid-2">
              <div className="sys-group">
                <label className="sys-label" htmlFor="year">Έτος Σπουδών</label>
                <select
                  id="year"
                  className="sys-input"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="1ο Έτος">1ο Έτος</option>
                  <option value="2ο Έτος">2ο Έτος</option>
                  <option value="Απόφοιτος 2025Β">Απόφοιτος 2025Β</option>
                  <option value="Απόφοιτος 2024Β">Απόφοιτος 2024Β</option>
                  <option value="Απόφοιτος 2023Β">Απόφοιτος 2023Β</option>
                  <option value="Απόφοιτος">Απόφοιτος</option>
                </select>
              </div>
              <div className="sys-group">
                <label className="sys-label" htmlFor="mathitisAr">Αριθμός Μητρώου</label>
                <input
                  id="mathitisAr"
                  type="text"
                  className="sys-input"
                  placeholder="π.χ. 26"
                  value={mathitisAr}
                  onChange={(e) => setMathitisAr(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Status & BEK Degree */}
            <div className="grid-2">
              <div className="sys-group">
                <label className="sys-label">Κατάσταση Σπουδαστή</label>
                <select
                  className="sys-input"
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setStatus(newStatus);
                    if (newStatus === 'dropped_out') {
                      if (window.confirm('Ο σπουδαστής σημειώθηκε ως "Διέκοψε". Θέλετε να μηδενιστεί η εναπομένουσα συνολική οφειλή του;')) {
                        setTotalDebt(0);
                        setHasInstallments(false);
                      }
                    }
                  }}
                  style={{ width: '100%', paddingLeft: '12px' }}
                >
                  <option value="active">Ενεργός</option>
                  <option value="graduate">Απόφοιτος</option>
                  <option value="bek_graduate">Απόφοιτος ΒΕΚ</option>
                  <option value="dropped_out">Διέκοψε</option>
                </select>
              </div>

              <div className="sys-group">
                <label className="sys-label" htmlFor="bekDegreeUpload">
                  Πτυχίο ΒΕΚ (Αρχείο)
                </label>
                {!bekDegree ? (
                  <input
                    id="bekDegreeUpload"
                    type="file"
                    accept="image/png, image/jpeg, application/pdf"
                    className="sys-input"
                    onChange={handleBekDegreeUpload}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#991b1b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bekDegree.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeBekDegree}
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                      title="Διαγραφή"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Total Debt */}
            <div className="sys-group">
              <label className="sys-label" htmlFor="totalDebt">
                Συνολική Οφειλή (€)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="totalDebt"
                  type="number"
                  step="0.01"
                  min="0"
                  className="sys-input"
                  placeholder="0.00"
                  value={totalDebt === 0 ? '' : totalDebt}
                  onChange={(e) => {
                    setTotalDebt(parseFloat(e.target.value) || 0);
                    if (errors.totalDebt) setErrors({ ...errors, totalDebt: null });
                  }}
                  style={{ width: '100%', paddingLeft: '26px', borderColor: errors.totalDebt ? 'var(--danger)' : undefined }}
                />
                <CreditCard size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.totalDebt && (
                <span className="sys-error">{errors.totalDebt}</span>
              )}
            </div>

            {/* Installments Mode Switch Grid */}
            <div className="grid-2">
              <div className="sys-group" style={{ justifyContent: 'center' }}>
                <span className="sys-label">Πληρωμή με Δόσεις</span>
                <label className="toggle-container" style={{ marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={hasInstallments}
                    onChange={(e) => {
                      setHasInstallments(e.target.checked);
                      if (e.target.checked && numberOfInstallments < 1) {
                        setNumberOfInstallments(1);
                      }
                    }}
                  />
                  <div className="toggle-switch">
                    <div className="toggle-circle"></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '500' }}>
                    {hasInstallments ? 'Ενεργό' : 'Ανενεργό (Εφάπαξ)'}
                  </span>
                </label>
              </div>

              {hasInstallments && (
                <div className="sys-group">
                  <span className="sys-label">Τύπος Υπολογισμού</span>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', color: '#1f2937' }}>
                      <input 
                        type="radio" 
                        name="dialogCalculationMode" 
                        value="by_installments"
                        checked={calculationMode === 'by_installments'}
                        onChange={() => setCalculationMode('by_installments')}
                      />
                      Αριθμός Δόσεων
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', color: '#1f2937' }}>
                      <input 
                        type="radio" 
                        name="dialogCalculationMode" 
                        value="by_amount"
                        checked={calculationMode === 'by_amount'}
                        onChange={() => {
                          setCalculationMode('by_amount');
                          if (!desiredMonthlyAmount || desiredMonthlyAmount <= 0) {
                            const suggested = totalDebt > 0 ? Math.ceil(totalDebt / 5) : 100;
                            setDesiredMonthlyAmount(suggested);
                          }
                        }}
                      />
                      Μηνιαίο Ποσό
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs based on selection */}
            {hasInstallments && (
              <div className="grid-2">
                {calculationMode === 'by_installments' ? (
                  <div className="sys-group">
                    <label className="sys-label" htmlFor="numberOfInstallments">
                      Αριθμός Δόσεων
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="numberOfInstallments"
                        type="number"
                        min="1"
                        className="sys-input"
                        value={numberOfInstallments}
                        onChange={(e) => {
                          setNumberOfInstallments(parseInt(e.target.value, 10) || 0);
                          if (errors.numberOfInstallments) setErrors({ ...errors, numberOfInstallments: null });
                        }}
                        style={{ width: '100%', paddingLeft: '26px', borderColor: errors.numberOfInstallments ? 'var(--danger)' : undefined }}
                      />
                      <Calendar size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.numberOfInstallments && (
                      <span className="sys-error">{errors.numberOfInstallments}</span>
                    )}
                  </div>
                ) : (
                  <div className="sys-group">
                    <label className="sys-label" htmlFor="desiredMonthlyAmount">
                      Επιθυμητό Μηνιαίο Ποσό (€)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="desiredMonthlyAmount"
                        type="number"
                        step="0.01"
                        min="1"
                        className="sys-input"
                        value={desiredMonthlyAmount === 0 ? '' : desiredMonthlyAmount}
                        onChange={(e) => {
                          setDesiredMonthlyAmount(parseFloat(e.target.value) || 0);
                          if (errors.desiredMonthlyAmount) setErrors({ ...errors, desiredMonthlyAmount: null });
                        }}
                        style={{ width: '100%', paddingLeft: '26px', borderColor: errors.desiredMonthlyAmount ? 'var(--danger)' : undefined }}
                      />
                      <CreditCard size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.desiredMonthlyAmount && (
                      <span className="sys-error">{errors.desiredMonthlyAmount}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Calculation Block */}
            {planDetails && (
              <div className="sys-calc-box">
                {planDetails.text}
              </div>
            )}

            {/* Notes */}
            <div className="sys-group">
              <label className="sys-label" htmlFor="notes">
                Σημειώσεις / Σχόλια
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  id="notes"
                  className="sys-input"
                  placeholder="Εισάγετε σημειώσεις γραμματείας..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', minHeight: '60px', resize: 'vertical', paddingLeft: '26px' }}
                />
                <FileText size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '10px' }} />
              </div>
            </div>

            {/* Documents Upload */}
            <div className="sys-group">
              <label className="sys-label" htmlFor="docUpload">
                Δικαιολογητικά (Εικόνες ή PDF)
              </label>
              <input
                id="docUpload"
                type="file"
                multiple
                accept="image/png, image/jpeg, application/pdf"
                className="sys-input"
                onChange={handleFileUpload}
                style={{ width: '100%' }}
              />
              <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                Μέγιστο μέγεθος ανά αρχείο: 2MB. 
              </small>
              
              {documents.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {documents.map((doc, i) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <FileText size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        title="Διαγραφή"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Dialog Footer */}
          <div className="dialog-footer">
            <button type="button" className="btn-sys" onClick={onClose}>
              Ακύρωση
            </button>
            <button type="submit" className="btn-sys primary">
              <Save size={12} />
              Αποθήκευση
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
