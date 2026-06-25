import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, BookOpen, MapPin, Trash2, Folder, User } from 'lucide-react';

export default function EventFormModal({ isOpen, onClose, onSubmit, onDelete, event, specialties, courses, contacts }) {
  const [sector, setSector] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [title, setTitle] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (event) {
      setSpecialtyId(event.specialtyId || '');
      setTitle(event.title || '');
      setInstructorId(event.instructorId || '');
      
      const spec = specialties.find(s => s.id === event.specialtyId);
      if (spec) setSector(spec.sector);
      else setSector('');

      const d = new Date(event.start);
      const e = new Date(event.end);
      
      setDate(d.toISOString().split('T')[0]);
      
      const formatTime = (dt) => {
        return dt.getHours().toString().padStart(2, '0') + ':' + dt.getMinutes().toString().padStart(2, '0');
      };
      
      setStartTime(formatTime(d));
      setEndTime(formatTime(e));
      setRoom(event.room || '');
      setColor(event.color || '#3b82f6');
    } else {
      resetForm();
    }
  }, [event, isOpen]);

  const resetForm = () => {
    setSector('');
    setSpecialtyId('');
    setTitle('');
    setInstructorId('');
    
    const today = new Date();
    // adjust for local timezone offset when setting date input
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setDate(localDate);
    
    const start = new Date();
    start.setMinutes(0);
    start.setHours(start.getHours() + 1);
    
    const end = new Date(start);
    end.setHours(start.getHours() + 2);
    
    const formatTime = (dt) => {
      return dt.getHours().toString().padStart(2, '0') + ':' + dt.getMinutes().toString().padStart(2, '0');
    };
    
    setStartTime(formatTime(start));
    setEndTime(formatTime(end));
    setRoom('');
    setColor('#3b82f6');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDt = new Date(`${date}T${startTime}:00`);
    const endDt = new Date(`${date}T${endTime}:00`);
    
    const eventData = {
      id: event ? event.id : null,
      title,
      specialtyId,
      instructorId,
      start: startDt,
      end: endDt,
      room,
      color
    };
    
    onSubmit(eventData);
    resetForm();
  };

  if (!isOpen) return null;

  const PRESET_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'
  ];

  const sectorsList = Array.from(new Set(specialties.map(s => s.sector)));
  const filteredSpecialties = sector ? specialties.filter(s => s.sector === sector) : specialties;
  
  let specialtyCourses = [];
  if (specialtyId && courses && courses[specialtyId]) {
    const specData = courses[specialtyId];
    const semesters = ['semester1', 'semester2', 'semester3', 'semester4'];
    semesters.forEach(sem => {
      if (specData[sem] && Array.isArray(specData[sem])) {
        specData[sem].forEach(courseName => {
          specialtyCourses.push({
            title: courseName,
            type: sem === 'semester1' ? 'Εξάμηνο Α' : 
                  sem === 'semester2' ? 'Εξάμηνο Β' : 
                  sem === 'semester3' ? 'Εξάμηνο Γ' : 'Εξάμηνο Δ'
          });
        });
      }
    });
  }

  // Get instructors for the dropdown
  const instructors = contacts && contacts.length > 0 ? contacts.filter(c => c.category === 'Εκπαιδευτής') : [];
  
  // Filter instructors by specialty if possible
  const filteredInstructors = specialtyId ? instructors.filter(i => {
    // 1. Strict match if instructor has specialtyId
    if (i.specialtyId) {
      return i.specialtyId === specialtyId;
    }
    
    // 2. Fallback to free-text matching for legacy mock data
    if (!i.description) return true;
    const spec = specialties.find(s => s.id === specialtyId);
    if (!spec) return true;
    const keywords = spec.title.split(' ').filter(w => w.length > 4);
    return keywords.some(k => i.description.includes(k)) || i.description.includes('Γενικά');
  }) : instructors;

  // Fallback to all instructors if filtering is too strict
  const availableInstructors = filteredInstructors.length > 0 ? filteredInstructors : instructors;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <CalendarIcon size={18} color="var(--primary)" />
            <span>{event ? 'Επεξεργασία Μαθήματος' : 'Νέο Μάθημα'}</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="sys-group">
            <label className="sys-label">Τομέας Σπουδών</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="sys-input"
                value={sector || ''}
                onChange={e => {
                  setSector(e.target.value);
                  setSpecialtyId('');
                  setTitle('');
                }}
                style={{ paddingLeft: '32px' }}
              >
                <option value="">-- Επιλέξτε Τομέα (Προαιρετικό) --</option>
                {sectorsList.filter(Boolean).map((sec, idx) => (
                  <option key={`sec-${idx}`} value={sec}>{sec}</option>
                ))}
              </select>
              <Folder size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="sys-group">
            <label className="sys-label">Σύνδεση με Ειδικότητα</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="sys-input"
                value={specialtyId || ''}
                onChange={e => {
                  setSpecialtyId(e.target.value);
                  setTitle('');
                }}
                style={{ paddingLeft: '32px' }}
                required
              >
                <option value="">-- Επιλέξτε Ειδικότητα --</option>
                {filteredSpecialties.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.title}</option>
                ))}
              </select>
              <BookOpen size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="sys-group">
            <label className="sys-label">Τίτλος Μαθήματος</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="sys-input" 
                value={title || ''}
                onChange={e => setTitle(e.target.value)}
                style={{ paddingLeft: '32px' }}
                required
                disabled={!specialtyId}
              >
                <option value="">{specialtyId ? '-- Επιλέξτε Μάθημα --' : '-- Επιλέξτε Ειδικότητα Πρώτα --'}</option>
                {specialtyCourses.filter(Boolean).map((course, idx) => (
                  <option key={`crs-${idx}`} value={course.title}>{course.title} ({course.type})</option>
                ))}
              </select>
              <BookOpen size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="sys-group">
            <label className="sys-label">Εκπαιδευτής / Καθηγητής</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="sys-input" 
                value={instructorId || ''}
                onChange={e => setInstructorId(e.target.value)}
                style={{ paddingLeft: '32px' }}
                disabled={!specialtyId}
              >
                <option value="">{specialtyId ? '-- Επιλέξτε Καθηγητή (Προαιρετικό) --' : '-- Επιλέξτε Ειδικότητα Πρώτα --'}</option>
                {availableInstructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                ))}
              </select>
              <User size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="sys-group">
              <label className="sys-label">Ημερομηνία</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  className="sys-input" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  required
                />
                <CalendarIcon size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="sys-group">
              <label className="sys-label">Αίθουσα</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="sys-input" 
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  placeholder="π.χ. Αίθουσα 3"
                />
                <MapPin size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="sys-group">
              <label className="sys-label">Ώρα Έναρξης</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="time" 
                  className="sys-input" 
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  required
                />
                <Clock size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            
            <div className="sys-group">
              <label className="sys-label">Ώρα Λήξης</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="time" 
                  className="sys-input" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  required
                />
                <Clock size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          <div className="sys-group">
            <label className="sys-label">Χρώμα Επισήμανσης</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <div 
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: c, 
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: color === c ? '2px solid #1e293b' : '2px solid transparent',
                    boxShadow: color === c ? '0 0 0 2px white inset' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: event ? 'space-between' : 'flex-end' }}>
            {event && (
              <button 
                type="button" 
                className="btn-sys" 
                style={{ color: '#ef4444', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                onClick={() => onDelete(event.id)}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                Διαγραφή
              </button>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-sys" onClick={onClose}>Ακύρωση</button>
              <button type="submit" className="btn-sys primary">Αποθήκευση</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
