import React, { useState, useEffect } from 'react';
import { X, PhoneCall, Plus, Trash2, BookOpen } from 'lucide-react';

export default function ContactFormModal({ isOpen, onClose, onSubmit, contact = null, specialties = [], courses = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Προμηθευτής',
    phone: '',
    email: '',
    description: '',
    assignments: []
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
        assignments: contact.assignments || []
      });
    } else {
      setFormData({
        name: '',
        category: 'Προμηθευτής',
        phone: '',
        email: '',
        description: '',
        assignments: []
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

    const handleAddAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { specialtyId: '', courseId: '' }]
    }));
  };

  const handleRemoveAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index)
    }));
  };

  const handleAssignmentChange = (index, field, value) => {
    setFormData(prev => {
      const newAssignments = [...prev.assignments];
      newAssignments[index] = { ...newAssignments[index], [field]: value };
      // if specialty changes, reset course
      if (field === 'specialtyId') {
        newAssignments[index].courseId = '';
      }
      return { ...prev, assignments: newAssignments };
    });
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
            <div className="sys-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="sys-label" style={{ margin: 0, color: '#0f172a' }}>
                  <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/>
                  Αναθέσεις Μαθημάτων
                </label>
                <button type="button" onClick={handleAddAssignment} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  <Plus size={12} /> Προσθήκη
                </button>
              </div>

              {formData.assignments.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '8px 0' }}>
                  Δεν υπάρχουν αναθέσεις ακόμα.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.assignments.map((assignment, idx) => {
                    // Filter courses based on specialty
                    const specialtyCourses = courses[assignment.specialtyId] || [];
                    
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select
                            className="sys-input"
                            value={assignment.specialtyId}
                            onChange={(e) => handleAssignmentChange(idx, 'specialtyId', e.target.value)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            <option value="">-- Επιλογή Ειδικότητας --</option>
                            {specialties.map((s) => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                          
                          <select
                            className="sys-input"
                            value={assignment.courseId}
                            onChange={(e) => handleAssignmentChange(idx, 'courseId', e.target.value)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                            disabled={!assignment.specialtyId}
                          >
                            <option value="">-- Επιλογή Μαθήματος --</option>
                            {specialtyCourses.map((c) => (
                              <option key={c.id} value={c.id}>{c.title} (Εξ. {c.semester})</option>
                            ))}
                          </select>
                        </div>
                        <button type="button" onClick={() => handleRemoveAssignment(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Διαγραφή ανάθεσης">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
