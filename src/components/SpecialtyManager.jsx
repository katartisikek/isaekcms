import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Layers, X, ChevronRight, Save, Filter } from 'lucide-react';

export default function SpecialtyManager({ specialties, setSpecialties, courses, setCourses }) {
  const [activeTab, setActiveTab] = useState('specialties'); // 'specialties' or 'courses'
  const [selectedSpecIdForCourses, setSelectedSpecIdForCourses] = useState('');
  
  // Specialty Form State
  const [isSpecFormOpen, setIsSpecFormOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [specTitle, setSpecTitle] = useState('');
  const [specSector, setSpecSector] = useState('');

  // Course Form State
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSemester, setCourseSemester] = useState('semester1');
  const [editingCourse, setEditingCourse] = useState(null); // { oldTitle, oldSemester }

  const sectors = Array.from(new Set(specialties.map(s => s.sector))).filter(Boolean);

  // --- Specialty Actions ---
  const openSpecForm = (spec = null) => {
    if (spec) {
      setEditingSpec(spec);
      setSpecTitle(spec.title);
      setSpecSector(spec.sector);
    } else {
      setEditingSpec(null);
      setSpecTitle('');
      setSpecSector('');
    }
    setIsSpecFormOpen(true);
  };

  const handleSaveSpec = (e) => {
    e.preventDefault();
    if (editingSpec) {
      setSpecialties(prev => prev.map(s => s.id === editingSpec.id ? { ...s, title: specTitle, sector: specSector } : s));
    } else {
      const newId = 'spec_' + Date.now();
      setSpecialties(prev => [...prev, { id: newId, title: specTitle, sector: specSector }]);
      setCourses(prev => ({
        ...prev,
        [newId]: {
          title: specTitle,
          semester1: [],
          semester2: [],
          semester3: [],
          semester4: []
        }
      }));
    }
    setIsSpecFormOpen(false);
  };

  const handleDeleteSpec = (id) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την Ειδικότητα; Θα διαγραφούν και όλα τα μαθήματά της.')) {
      setSpecialties(prev => prev.filter(s => s.id !== id));
      if (selectedSpecIdForCourses === id) {
        setSelectedSpecIdForCourses('');
      }
      setCourses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // --- Course Actions ---
  const openCourseForm = (course = null) => {
    if (!selectedSpecIdForCourses) {
      alert('Επιλέξτε πρώτα ειδικότητα!');
      return;
    }
    if (course) {
      setEditingCourse(course);
      setCourseTitle(course.title);
      setCourseSemester(course.semester);
    } else {
      setEditingCourse(null);
      setCourseTitle('');
      setCourseSemester('semester1');
    }
    setIsCourseFormOpen(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!selectedSpecIdForCourses) return;
    const specId = selectedSpecIdForCourses;
    const specTitle = specialties.find(s => s.id === specId)?.title || '';
    
    setCourses(prev => {
      const specCourses = prev[specId] || { title: specTitle, semester1: [], semester2: [], semester3: [], semester4: [] };
      const nextCourses = { ...prev, [specId]: { ...specCourses } };
      
      ['semester1', 'semester2', 'semester3', 'semester4'].forEach(sem => {
        if (!nextCourses[specId][sem]) nextCourses[specId][sem] = [];
      });

      if (editingCourse) {
        nextCourses[specId][editingCourse.semester] = nextCourses[specId][editingCourse.semester].filter(c => c !== editingCourse.title);
      }
      
      if (!nextCourses[specId][courseSemester].includes(courseTitle)) {
        nextCourses[specId][courseSemester].push(courseTitle);
      }
      
      return nextCourses;
    });
    
    setIsCourseFormOpen(false);
  };

  const handleDeleteCourse = (title, semester) => {
    if (window.confirm(`Διαγραφή του μαθήματος "${title}";`)) {
      const specId = selectedSpecIdForCourses;
      setCourses(prev => {
        const nextCourses = { ...prev };
        if (nextCourses[specId] && nextCourses[specId][semester]) {
          nextCourses[specId][semester] = nextCourses[specId][semester].filter(c => c !== title);
        }
        return nextCourses;
      });
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('specialties')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'specialties' ? '#eff6ff' : 'transparent',
            color: activeTab === 'specialties' ? '#2563eb' : '#64748b',
            border: activeTab === 'specialties' ? '1px solid #bfdbfe' : '1px solid transparent',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={18} />
          Διαχείριση Ειδικοτήτων
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'courses' ? '#eff6ff' : 'transparent',
            color: activeTab === 'courses' ? '#2563eb' : '#64748b',
            border: activeTab === 'courses' ? '1px solid #bfdbfe' : '1px solid transparent',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={18} />
          Διαχείριση Μαθημάτων
        </button>
      </div>

      {/* Tab Content: Specialties */}
      {activeTab === 'specialties' && (
        <div className="sys-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#1e293b' }}>Όλες οι Ειδικότητες</h2>
            <button className="btn-sys primary" onClick={() => openSpecForm()}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Νέα Ειδικότητα
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {specialties.map(spec => (
              <div 
                key={spec.id} 
                style={{ 
                  padding: '16px', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{spec.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={12} /> Τομέας: {spec.sector}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-sys" style={{ padding: '6px' }} onClick={() => openSpecForm(spec)}>
                    <Edit2 size={14} color="#64748b" />
                  </button>
                  <button className="btn-sys" style={{ padding: '6px' }} onClick={() => handleDeleteSpec(spec.id)}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
            {specialties.length === 0 && <div style={{ color: '#64748b' }}>Δεν υπάρχουν ειδικότητες.</div>}
          </div>
        </div>
      )}

      {/* Tab Content: Courses */}
      {activeTab === 'courses' && (
        <div className="sys-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div className="sys-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="sys-label">Επιλέξτε Ειδικότητα για προβολή/επεξεργασία μαθημάτων:</label>
              <select 
                className="sys-input"
                value={selectedSpecIdForCourses}
                onChange={e => setSelectedSpecIdForCourses(e.target.value)}
                style={{ fontWeight: '500' }}
              >
                <option value="">-- Επιλέξτε Ειδικότητα --</option>
                {specialties.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.title}</option>
                ))}
              </select>
            </div>
            <button 
              className="btn-sys primary" 
              onClick={() => openCourseForm()}
              disabled={!selectedSpecIdForCourses}
              style={{ opacity: selectedSpecIdForCourses ? 1 : 0.5 }}
            >
              <Plus size={16} style={{ marginRight: '6px' }} /> Νέο Μάθημα
            </button>
          </div>

          {selectedSpecIdForCourses ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['semester1', 'semester2', 'semester3', 'semester4'].map(sem => {
                const semCourses = courses[selectedSpecIdForCourses]?.[sem] || [];
                const semLabel = sem === 'semester1' ? 'Εξάμηνο Α' : 
                                 sem === 'semester2' ? 'Εξάμηνο Β' : 
                                 sem === 'semester3' ? 'Εξάμηνο Γ' : 'Εξάμηνο Δ';
                
                return (
                  <div key={sem} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: '600', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                      {semLabel}
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' }}>
                      {semCourses.map((c, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                          padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{c}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className="btn-sys" style={{ padding: '4px 8px', border: 'none', background: '#fff' }}
                              onClick={() => openCourseForm({ title: c, semester: sem })}
                            ><Edit2 size={14} color="#64748b" /></button>
                            <button 
                              className="btn-sys" style={{ padding: '4px 8px', border: 'none', background: '#fff' }}
                              onClick={() => handleDeleteCourse(c, sem)}
                            ><Trash2 size={14} color="#ef4444" /></button>
                          </div>
                        </div>
                      ))}
                      {semCourses.length === 0 && (
                        <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Δεν υπάρχουν μαθήματα στο {semLabel}.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <BookOpen size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
              <p>Παρακαλώ επιλέξτε μια ειδικότητα από το μενού παραπάνω για να διαχειριστείτε τα μαθήματά της.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Ειδικότητας */}
      {isSpecFormOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '400px', width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div className="modal-header" style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#0f172a' }}>
                <Layers size={18} color="var(--primary)" />
                <span>{editingSpec ? 'Επεξεργασία Ειδικότητας' : 'Νέα Ειδικότητα'}</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setIsSpecFormOpen(false)}><X size={18} /></button>
            </div>
            <form style={{ padding: '20px' }} onSubmit={handleSaveSpec}>
              <div className="sys-group">
                <label className="sys-label">Τίτλος Ειδικότητας</label>
                <input 
                  type="text" className="sys-input" required 
                  value={specTitle} onChange={e => setSpecTitle(e.target.value)} 
                />
              </div>
              <div className="sys-group">
                <label className="sys-label">Τομέας (π.χ. Τομέας Πληροφορικής)</label>
                <input 
                  type="text" className="sys-input" required 
                  value={specSector} onChange={e => setSpecSector(e.target.value)} 
                  list="sector-suggestions"
                />
                <datalist id="sector-suggestions">
                  {sectors.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <button type="button" className="btn-sys" onClick={() => setIsSpecFormOpen(false)}>Ακύρωση</button>
                <button type="submit" className="btn-sys primary"><Save size={16} style={{ marginRight: '6px' }}/> Αποθήκευση</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Μαθήματος */}
      {isCourseFormOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '400px', width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div className="modal-header" style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#0f172a' }}>
                <BookOpen size={18} color="var(--primary)" />
                <span>{editingCourse ? 'Επεξεργασία Μαθήματος' : 'Νέο Μάθημα'}</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setIsCourseFormOpen(false)}><X size={18} /></button>
            </div>
            <form style={{ padding: '20px' }} onSubmit={handleSaveCourse}>
              <div className="sys-group">
                <label className="sys-label">Τίτλος Μαθήματος</label>
                <input 
                  type="text" className="sys-input" required 
                  value={courseTitle} onChange={e => setCourseTitle(e.target.value)} 
                />
              </div>
              <div className="sys-group">
                <label className="sys-label">Εξάμηνο</label>
                <select 
                  className="sys-input" required
                  value={courseSemester} onChange={e => setCourseSemester(e.target.value)}
                >
                  <option value="semester1">Εξάμηνο Α</option>
                  <option value="semester2">Εξάμηνο Β</option>
                  <option value="semester3">Εξάμηνο Γ</option>
                  <option value="semester4">Εξάμηνο Δ</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <button type="button" className="btn-sys" onClick={() => setIsCourseFormOpen(false)}>Ακύρωση</button>
                <button type="submit" className="btn-sys primary"><Save size={16} style={{ marginRight: '6px' }}/> Αποθήκευση</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
