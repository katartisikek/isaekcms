import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function InterestFormModal({ isOpen, onClose, onSubmit, interest, specialties }) {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    specialtyId: '',
    comments: ''
  });

  useEffect(() => {
    if (interest) {
      setFormData(interest);
    } else {
      setFormData({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        specialtyId: '',
        comments: ''
      });
    }
  }, [interest, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box" style={{ maxWidth: '500px' }}>
        {/* Windows style Dialog Header */}
        <div className="dialog-header">
          <div className="dialog-title">
            <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {interest ? 'Επεξεργασία Ενδιαφέροντος' : 'Νέα Εκδήλωση Ενδιαφέροντος'}
            </span>
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Κλείσιμο">
            <X size={16} />
          </button>
        </div>

        {/* Dialog Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            
            <div className="grid-2">
              <div className="sys-group">
                <label className="sys-label">
                  Επώνυμο <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="lastName"
                    className="sys-input"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', paddingLeft: '26px' }}
                    placeholder="π.χ. Παπαδόπουλος"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>

              <div className="sys-group">
                <label className="sys-label">
                  Όνομα <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="firstName"
                    className="sys-input"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', paddingLeft: '26px' }}
                    placeholder="π.χ. Γεώργιος"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="sys-group">
                <label className="sys-label">Τηλέφωνο</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    name="phone"
                    className="sys-input"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '26px' }}
                    placeholder="π.χ. 6900000000"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
              </div>

              <div className="sys-group">
                <label className="sys-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    className="sys-input"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '26px' }}
                    placeholder="name@example.com"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
              </div>
            </div>

            <div className="sys-group">
              <label className="sys-label">
                Ειδικότητα Ενδιαφέροντος <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  name="specialtyId"
                  className="sys-input"
                  value={formData.specialtyId}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', paddingLeft: '26px', cursor: 'pointer' }}
                >
                  <option value="">-- Επιλέξτε Ειδικότητα --</option>
                  {specialties.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.title}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
            </div>

            <div className="sys-group">
              <label className="sys-label">Σχόλια / Σημειώσεις Γραμματείας</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  name="comments"
                  className="sys-input"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical', paddingLeft: '26px' }}
                  placeholder="Γράψτε εδώ τι έχετε συζητήσει..."
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '8px', top: '10px' }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              </div>
            </div>

          </div>

          <div className="dialog-footer">
            <button type="button" className="btn-sys" onClick={onClose}>
              Ακύρωση
            </button>
            <button type="submit" className="btn-sys primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Αποθήκευση
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
