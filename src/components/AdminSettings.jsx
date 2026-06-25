import React, { useState } from 'react';
import { 
  Settings, FolderPlus, BookOpen, Trash2, Plus, Edit2, ChevronDown, ChevronRight, Save, X, Layers
} from 'lucide-react';

export default function AdminSettings({ specialties, setSpecialties, courses, setCourses }) {
  const [activeTab, setActiveTab] = useState('specialties'); // 'specialties' or 'courses'
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);

  // New Specialty State
  const [showNewSpecForm, setShowNewSpecForm] = useState(false);
  const [newSpecTitle, setNewSpecTitle] = useState('');
  const [newSpecSector, setNewSpecSector] = useState('');

  const sectors = [...new Set(specialties.map(s => s.sector))];

  // Group specialties by sector
  const specialtiesBySector = specialties.reduce((acc, spec) => {
    if (!acc[spec.sector]) acc[spec.sector] = [];
    acc[spec.sector].push(spec);
    return acc;
  }, {});

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (!newSpecTitle || !newSpecSector) return;
    
    const newId = `spec_${Date.now()}`;
    const newSpec = {
      id: newId,
      title: newSpecTitle,
      sector: newSpecSector
    };
    
    setSpecialties(prev => [...prev, newSpec]);
    
    // Initialize courses for this new specialty
    setCourses(prev => ({
      ...prev,
      [newId]: {
        title: newSpecTitle,
        semester1: [],
        semester2: [],
        semester3: [],
        semester4: []
      }
    }));
    
    setNewSpecTitle('');
    setShowNewSpecForm(false);
  };

  const handleDeleteSpecialty = (id) => {
    if(window.confirm("Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την ειδικότητα;")) {
      setSpecialties(prev => prev.filter(s => s.id !== id));
      const newCourses = { ...courses };
      delete newCourses[id];
      setCourses(newCourses);
      if(selectedSpecialtyId === id) setSelectedSpecialtyId(null);
    }
  };

  const selectedSpecialty = specialties.find(s => s.id === selectedSpecialtyId);
  const selectedCourseData = selectedSpecialtyId ? courses[selectedSpecialtyId] : null;

  const handleAddCourse = (semester) => {
    const courseName = window.prompt("Εισάγετε όνομα νέου μαθήματος:");
    if (courseName && courseName.trim() !== '') {
      setCourses(prev => {
        const specCourses = prev[selectedSpecialtyId] || { title: selectedSpecialty.title, semester1: [], semester2: [], semester3: [], semester4: [] };
        return {
          ...prev,
          [selectedSpecialtyId]: {
            ...specCourses,
            [semester]: [...(specCourses[semester] || []), courseName.trim()]
          }
        };
      });
    }
  };

  const handleDeleteCourse = (semester, index) => {
    if(window.confirm("Διαγραφή μαθήματος;")) {
      setCourses(prev => {
        const specCourses = prev[selectedSpecialtyId];
        const newSemCourses = [...specCourses[semester]];
        newSemCourses.splice(index, 1);
        return {
          ...prev,
          [selectedSpecialtyId]: {
            ...specCourses,
            [semester]: newSemCourses
          }
        };
      });
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ background: '#2563eb', padding: '10px', borderRadius: '10px', color: '#fff' }}>
          <Settings size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Εργαλεία Διαχειριστή</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Διαχείριση Τομέων, Ειδικοτήτων & Μαθημάτων</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '24px', minHeight: 0 }}>
        
        {/* Left List Panel */}
        <div style={{ width: '350px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} /> Τομείς & Ειδικότητες
            </h3>
            <button 
              onClick={() => setShowNewSpecForm(!showNewSpecForm)}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {showNewSpecForm ? <X size={14}/> : <Plus size={14}/>} Νέα
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {showNewSpecForm && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#0369a1' }}>Νέα Ειδικότητα</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" placeholder="Όνομα Ειδικότητας..." 
                    value={newSpecTitle} onChange={e => setNewSpecTitle(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                  />
                  <input 
                    type="text" placeholder="Όνομα Τομέα..." 
                    value={newSpecSector} onChange={e => setNewSpecSector(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                    list="sectors-list"
                  />
                  <datalist id="sectors-list">
                    {sectors.map(s => <option key={s} value={s} />)}
                  </datalist>
                  <button onClick={handleAddSpecialty} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Αποθήκευση
                  </button>
                </div>
              </div>
            )}

            {Object.keys(specialtiesBySector).map(sector => (
              <div key={sector} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                  {sector}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {specialtiesBySector[sector].map(spec => (
                    <div 
                      key={spec.id}
                      onClick={() => setSelectedSpecialtyId(spec.id)}
                      style={{ 
                        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                        background: selectedSpecialtyId === spec.id ? '#eff6ff' : '#fff',
                        border: `1px solid ${selectedSpecialtyId === spec.id ? '#bfdbfe' : 'transparent'}`,
                        color: selectedSpecialtyId === spec.id ? '#1d4ed8' : '#334155',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: selectedSpecialtyId === spec.id ? '600' : '400' }}>{spec.title}</span>
                      {selectedSpecialtyId === spec.id && <ChevronRight size={14} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Details Panel */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedSpecialty ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <FolderPlus size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Επιλέξτε μια ειδικότητα από τη λίστα για να διαχειριστείτε τα μαθήματά της.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>{selectedSpecialty.sector}</div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{selectedSpecialty.title}</h3>
                </div>
                <button 
                  onClick={() => handleDeleteSpecialty(selectedSpecialty.id)}
                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> Διαγραφή Ειδικότητας
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#2563eb" /> Μαθήματα ανά Εξάμηνο
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {[
                    { id: 'semester1', label: "Α' Εξάμηνο" },
                    { id: 'semester2', label: "Β' Εξάμηνο" },
                    { id: 'semester3', label: "Γ' Εξάμηνο" },
                    { id: 'semester4', label: "Δ' Εξάμηνο" }
                  ].map(sem => {
                    const sCourses = selectedCourseData ? (selectedCourseData[sem.id] || []) : [];
                    return (
                      <div key={sem.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ background: '#f1f5f9', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#0f172a' }}>{sem.label}</span>
                          <button 
                            onClick={() => handleAddCourse(sem.id)}
                            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                            title="Προσθήκη Μαθήματος"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div style={{ padding: '10px' }}>
                          {sCourses.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '10px 0' }}>Δεν έχουν προστεθεί μαθήματα</div>
                          ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {sCourses.map((c, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>{c}</span>
                                  <button onClick={() => handleDeleteCourse(sem.id, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                                    <Trash2 size={12} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
