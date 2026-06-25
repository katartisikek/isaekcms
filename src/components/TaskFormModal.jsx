import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';

export default function TaskFormModal({ isOpen, onClose, onSubmit, task = null }) {
  // Initialize state based on whether we are editing or creating
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Εκκρεμεί',
    priority: 'Κανονική',
    assignee: '',
    dueDate: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Εκκρεμεί',
        priority: task.priority || 'Κανονική',
        assignee: task.assignee || '',
        dueDate: task.dueDate || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Εκκρεμεί',
        priority: 'Κανονική',
        assignee: '',
        dueDate: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

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
    if (!formData.title.trim()) {
      newErrors.title = 'Ο τίτλος της εργασίας είναι υποχρεωτικός.';
    }
    if (!formData.assignee.trim()) {
      newErrors.assignee = 'Ο αρμόδιος/υπεύθυνος είναι υποχρεωτικός.';
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
      <div className="dialog-box" style={{ maxWidth: '500px' }}>
        {/* Windows style Dialog Header */}
        <div className="dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckSquare size={14} color="#2563eb" />
            <span>{task ? 'Επεξεργασία Εργασίας' : 'Νέα Εργασία'}</span>
          </div>
          <button className="dialog-close-btn" onClick={onClose} aria-label="Κλείσιμο" type="button">
            <X size={14} />
          </button>
        </div>

        {/* Dialog Form Body */}
        <form onSubmit={handleSubmit} className="dialog-body">
          {/* Title field */}
          <div className="sys-group">
            <label className="sys-label required-field">Τίτλος Εργασίας</label>
            <input
              type="text"
              name="title"
              className={`sys-input ${errors.title ? 'error' : ''}`}
              placeholder="π.χ. Αναμονή βαθμολογίας, Έλεγχος δικαιολογητικών..."
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Description field */}
          <div className="sys-group">
            <label className="sys-label">Περιγραφή</label>
            <textarea
              name="description"
              className="sys-input"
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Λεπτομέρειες ή σημειώσεις για την εργασία..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Status and Priority side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="sys-group">
              <label className="sys-label">Κατάσταση</label>
              <select
                name="status"
                className="sys-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Εκκρεμεί">Εκκρεμεί</option>
                <option value="Σε Εξέλιξη">Σε Εξέλιξη</option>
                <option value="Ολοκληρώθηκε">Ολοκληρώθηκε</option>
              </select>
            </div>

            <div className="sys-group">
              <label className="sys-label">Προτεραιότητα</label>
              <select
                name="priority"
                className="sys-input"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Κανονική">Κανονική</option>
                <option value="Επείγον">Επείγον</option>
              </select>
            </div>
          </div>

          {/* Assignee and Due Date side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="sys-group">
              <label className="sys-label required-field">Αρμόδιος / Υπεύθυνος</label>
              <input
                type="text"
                name="assignee"
                className={`sys-input ${errors.assignee ? 'error' : ''}`}
                placeholder="π.χ. Κατερίνα, Μαίρη"
                value={formData.assignee}
                onChange={handleChange}
              />
              {errors.assignee && <span className="error-text">{errors.assignee}</span>}
            </div>

            <div className="sys-group">
              <label className="sys-label">Προθεσμία</label>
              <input
                type="date"
                name="dueDate"
                className="sys-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Form Footer Action Buttons */}
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
