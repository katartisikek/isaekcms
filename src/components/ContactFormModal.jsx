import React, { useState, useEffect } from 'react';
import { X, PhoneCall } from 'lucide-react';

export default function ContactFormModal({ isOpen, onClose, onSubmit, contact = null, specialties = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Προμηθευτής',
    phone: '',
    email: '',
    description: '',
    specialtyId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      setFormData({
        id: contact.id,
        name: contact.name || '',
        category: contact.category || 'Προμηθευτής',
        phone: contact.phone || '',
        email: contact.email || '',
        description: contact.description || '',
        specialtyId: contact.specialtyId || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Προμηθευτής',
        phone: '',
        email: '',
        description: '',
        specialtyId: ''
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is typed in
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Το όνομα ή η επωνυμία είναι υποχρεωτικό πεδίο.';
    }
    if (!formData.phone.trim() && formData.category !== 'Εκπαιδευτής') {
      newErrors.phone = 'Το τηλέφωνο επικοινωνίας είναι υποχρεωτικό πεδίο.';
    }
    // Simple email regex validation if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Εισάγετε μια έγκυρη διεύθυνση email.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box" style={{ maxWidth: '480px' }}>
        {/* Windows style Dialog Header */}
        <div className="dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PhoneCall size={14} color="#2563eb" />
            <span>{contact ? 'Επεξεργασία Επαφής' : 'Νέα Επαφή'}</span>
          </div>
          <button className="dialog-close-btn" onClick={onClose} aria-label="Κλείσιμο" type="button">
            <X size={14} />
          </button>
        </div>

        {/* Dialog Form Body */}
        <form onSubmit={handleSubmit} className="dialog-body">
          {/* Name field */}
          <div className="sys-group">
            <label className="sys-label required-field">Όνομα / Επωνυμία</label>
            <input
              type="text"
              name="name"
              className={`sys-input ${errors.name ? 'error' : ''}`}
              placeholder="π.χ. Υπουργείο Παιδείας, Χαρτικά Κρήτης..."
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Category Dropdown Selector */}
          <div className="sys-group">
            <label className="sys-label">Κατηγορία</label>
            <select
              name="category"
              className="sys-input"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Εκπαιδευτής">Εκπαιδευτής</option>
              <option value="Υπουργείο / Πήγασος">Υπουργείο / Πήγασος</option>
              <option value="Προμηθευτής">Προμηθευτής</option>
              <option value="Συνεργάτης">Συνεργάτης</option>
              <option value="Άλλο">Άλλο</option>
            </select>
          </div>

          {/* Specialty Selector for Instructors */}
          {formData.category === 'Εκπαιδευτής' && (
            <div className="sys-group">
              <label className="sys-label">Ειδικότητα</label>
              <select
                name="specialtyId"
                className="sys-input"
                value={formData.specialtyId}
                onChange={handleChange}
              >
                <option value="">-- Επιλέξτε Ειδικότητα --</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Phone and Email side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="sys-group">
              <label className="sys-label required-field">Τλέφωνο</label>
              <input
                type="text"
                name="phone"
                className={`sys-input ${errors.phone ? 'error' : ''}`}
                placeholder="π.χ. 2810300400"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="sys-group">
              <label className="sys-label">Email</label>
              <input
                type="text"
                name="email"
                className={`sys-input ${errors.email ? 'error' : ''}`}
                placeholder="π.x. contact@email.gr"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Description / Object field */}
          <div className="sys-group">
            <label className="sys-label">Αντικείμενο / Σημείωση</label>
            <input
              type="text"
              name="description"
              className="sys-input"
              placeholder="π.χ. Αναλώσιμα εκτυπωτών, Courier, Διευθυντής..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Form Action Buttons */}
          <div className="dialog-footer">
            <button type="button" className="btn-sys" onClick={onClose}>
              Ακύρωση
            </button>
            <button type="submit" className="btn-sys primary">
              Αποθήκευση
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
