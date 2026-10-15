import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  Download, 
  BookOpen, 
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exportContacts } from '../services/exportExcel';
import TeacherCoursesModal from './TeacherCoursesModal';

export default function TeacherDirectory({ 
  contacts = [], 
  specialties = [], 
  courses = {}, 
  onAddContactClick, 
  onEditContactClick, 
  onDeleteContact,
  onUpdateTeacherAssignments
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [selectedTeacherForCourses, setSelectedTeacherForCourses] = useState(null);

  // Perform client-side real-time filtering
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const hasAssignments = Array.isArray(contact.assignments) && contact.assignments.length > 0;

      // 1. Assignment Filter
      if (assignmentFilter === 'assigned' && !hasAssignments) {
        return false;
      }
      if (assignmentFilter === 'unassigned' && hasAssignments) {
        return false;
      }

      // 2. Specialty Filter
      if (specialtyFilter) {
        if (!hasAssignments) return false;
        const matchesSpec = contact.assignments.some(a => a.specialtyId === specialtyFilter);
        if (!matchesSpec) return false;
      }

      // 3. Text Search (name, phone, notes, specialty, or course title)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (contact.name || '').toLowerCase().includes(query);
        const phoneMatch = (contact.phone || '').includes(query);
        const descMatch = (contact.description || '').toLowerCase().includes(query);
        
        const coursesMatch = hasAssignments && contact.assignments.some(a => {
          const spec = specialties.find(s => s.id === a.specialtyId);
          const specTitle = (spec?.title || '').toLowerCase();
          const courseTitle = (a.courseId || '').toLowerCase();
          return specTitle.includes(query) || courseTitle.includes(query);
        });

        if (!nameMatch && !phoneMatch && !descMatch && !coursesMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'el'));
  }, [contacts, assignmentFilter, specialtyFilter, searchQuery, specialties]);

  // Counts for tabs
  const countAll = contacts.length;
  const countAssigned = contacts.filter(c => Array.isArray(c.assignments) && c.assignments.length > 0).length;
  const countUnassigned = contacts.filter(c => !Array.isArray(c.assignments) || c.assignments.length === 0).length;

  const handleDelete = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    
    if (window.confirm(`Επιβεβαίωση Διαγραφής:\nΕίστε βέβαιοι ότι θέλετε να διαγράψετε τον/την καθηγητή/τρια "${contact.name}";`)) {
      onDeleteContact(contactId);
    }
  };

  const handleOpenCourseModal = (teacher) => {
    setSelectedTeacherForCourses(teacher);
  };

  const handleSaveAssignments = async (teacherId, newAssignments) => {
    if (onUpdateTeacherAssignments) {
      await onUpdateTeacherAssignments(teacherId, newAssignments);
      setSelectedTeacherForCourses(prev => prev ? { ...prev, assignments: newAssignments } : null);
    }
  };

  return (
    <div className="directory-workspace" style={{ background: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
      {/* 1. Header Toolbar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Κατάλογος & Μαθήματα Καθηγητών
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Συνολικά {contacts.length} εκπαιδευτικοί • {countAssigned} με ανατεθειμένα μαθήματα
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-sys primary" 
            onClick={onAddContactClick}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px',
              fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Plus size={15} />
            <span>Νέος Καθηγητής</span>
          </button>
          <button 
            className="btn-sys" 
            onClick={() => exportContacts(filteredContacts, specialties)} 
            style={{
              background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1',
              borderRadius: '8px', padding: '8px 14px', fontWeight: '600', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Εξαγωγή Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Ribbon */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Search & Specialty Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '540px' }}>
            <input
              type="text"
              className="sys-input"
              placeholder="🔍 Αναζήτηση καθηγητή, μαθήματος, ειδικότητας ή τηλεφώνου..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px 10px 38px',
                borderRadius: '10px', border: '1px solid #cbd5e1',
                fontSize: '13.5px', background: '#f8fafc', outline: 'none'
              }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Specialty Dropdown Filter */}
          <div style={{ minWidth: '220px' }}>
            <select
              className="sys-input"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="">🎓 Όλες οι Ειδικότητες</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Status Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setAssignmentFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: assignmentFilter === 'all' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
              background: assignmentFilter === 'all' ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#ffffff',
              color: assignmentFilter === 'all' ? '#1e40af' : '#475569',
              fontSize: '12.5px',
              fontWeight: assignmentFilter === 'all' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: assignmentFilter === 'all' ? '0 2px 4px rgba(37,99,235,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <GraduationCap size={14} />
            <span>Όλοι οι Καθηγητές</span>
            <span style={{
              background: assignmentFilter === 'all' ? '#2563eb' : '#f1f5f9',
              color: assignmentFilter === 'all' ? '#ffffff' : '#64748b',
              fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px'
            }}>
              {countAll}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAssignmentFilter('assigned')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: assignmentFilter === 'assigned' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
              background: assignmentFilter === 'assigned' ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#ffffff',
              color: assignmentFilter === 'assigned' ? '#15803d' : '#475569',
              fontSize: '12.5px',
              fontWeight: assignmentFilter === 'assigned' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: assignmentFilter === 'assigned' ? '0 2px 4px rgba(22,163,74,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={14} color="#16a34a" />
            <span>Με Ανατεθειμένα Μαθήματα</span>
            <span style={{
              background: assignmentFilter === 'assigned' ? '#16a34a' : '#f1f5f9',
              color: assignmentFilter === 'assigned' ? '#ffffff' : '#64748b',
              fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px'
            }}>
              {countAssigned}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAssignmentFilter('unassigned')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: assignmentFilter === 'unassigned' ? '1.5px solid #d97706' : '1px solid #cbd5e1',
              background: assignmentFilter === 'unassigned' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : '#ffffff',
              color: assignmentFilter === 'unassigned' ? '#b45309' : '#475569',
              fontSize: '12.5px',
              fontWeight: assignmentFilter === 'unassigned' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: assignmentFilter === 'unassigned' ? '0 2px 4px rgba(217,119,6,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertCircle size={14} color="#d97706" />
            <span>Χωρίς Μαθήματα</span>
            <span style={{
              background: assignmentFilter === 'unassigned' ? '#d97706' : '#f1f5f9',
              color: assignmentFilter === 'unassigned' ? '#ffffff' : '#64748b',
              fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px'
            }}>
              {countUnassigned}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Cards Grid */}
      <div style={{ padding: '24px', flex: 1 }}>
        {filteredContacts.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '240px', background: '#ffffff', borderRadius: '16px', border: '2px dashed #cbd5e1',
            color: '#64748b', gap: '8px'
          }}>
            <Sparkles size={32} color="#94a3b8" />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Δεν βρέθηκαν εκπαιδευτικοί με αυτά τα κριτήρια.</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {filteredContacts.map((contact) => {
              const hasAssignments = Array.isArray(contact.assignments) && contact.assignments.length > 0;
              const assignmentCount = contact.assignments?.length || 0;

              return (
                <div key={contact.id} className="pretty-contact-card" style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out'
                }}>
                  {/* Top Header Section */}
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Gradient Circle Avatar */}
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, boxShadow: '0 4px 8px rgba(79, 70, 229, 0.25)'
                    }}>
                      <GraduationCap size={24} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: hasAssignments ? '#e0e7ff' : '#fef3c7',
                          color: hasAssignments ? '#3730a3' : '#92400e',
                          padding: '2px 8px', borderRadius: '6px'
                        }}>
                          {contact.category || contact.role || 'Καθηγητής'}
                        </span>
                        
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {assignmentCount} {assignmentCount === 1 ? 'μάθημα' : 'μαθήματα'}
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }} title={contact.name}>
                        {contact.name}
                      </h3>
                    </div>
                  </div>

                  {/* Course Assignments List */}
                  {hasAssignments ? (
                    <div style={{ padding: '14px 20px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BookOpen size={13} color="#6366f1" />
                          <span>Διδασκόμενα Μαθήματα ({assignmentCount})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenCourseModal(contact)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Αλλαγή των μαθημάτων που διδάσκει ο καθηγητής"
                        >
                          <Edit size={11} />
                          <span>Αλλαγή</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                        {contact.assignments.map((assignment, idx) => {
                          const spec = specialties.find(s => s.id === assignment.specialtyId);
                          const courseTitle = assignment.courseId || '';
                          if (!spec && !courseTitle) return null;

                          return (
                            <div key={idx} style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px'
                            }}>
                              {spec && (
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={spec.title}>
                                  {spec.title}
                                </div>
                              )}
                              {courseTitle && (
                                <div style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: '#94a3b8' }}>↳</span>
                                  <span>{courseTitle}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '14px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontSize: '12px', fontWeight: '500' }}>
                        <AlertCircle size={14} />
                        <span>Δεν έχουν ανατεθεί μαθήματα</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenCourseModal(contact)}
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={12} /> Ανάθεση
                      </button>
                    </div>
                  )}

                  {/* Description / Notes */}
                  <div style={{ padding: '12px 20px', flex: 1 }}>
                    <p style={{
                      fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4,
                      fontStyle: contact.description ? 'normal' : 'italic'
                    }}>
                      {contact.description || 'Χωρίς επιπλέον σημειώσεις.'}
                    </p>
                  </div>

                  {/* Contact Links & Actions Footer */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Contact Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {contact.phone && (
                        <a 
                          href={`tel:${contact.phone}`} 
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px',
                            fontWeight: '600', textDecoration: 'none'
                          }}
                        >
                          <Phone size={12} />
                          <span>{contact.phone}</span>
                        </a>
                      )}

                      {contact.email && (
                        <a 
                          href={`mailto:${contact.email}`} 
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px',
                            fontWeight: '500', textDecoration: 'none', maxWidth: '200px',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}
                          title={contact.email}
                        >
                          <Mail size={12} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenCourseModal(contact)}
                        style={{
                          background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                          color: '#4338ca',
                          border: '1px solid #c7d2fe',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(67, 56, 202, 0.08)'
                        }}
                        title="Αλλαγή των μαθημάτων που διδάσκει ο καθηγητής"
                      >
                        <BookOpen size={13} color="#4f46e5" />
                        <span>Μαθήματα ({assignmentCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditContactClick(contact)}
                        style={{
                          background: '#f1f5f9', color: '#334155', border: 'none',
                          borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px',
                          fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={12} />
                        <span>Στοιχεία</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id)}
                        style={{
                          background: '#fef2f2', color: '#dc2626', border: 'none',
                          borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px',
                          fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Διαγραφή</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teacher Courses Modal */}
      <TeacherCoursesModal
        isOpen={!!selectedTeacherForCourses}
        onClose={() => setSelectedTeacherForCourses(null)}
        teacher={selectedTeacherForCourses}
        specialties={specialties}
        courses={courses}
        onSave={handleSaveAssignments}
      />
    </div>
  );
}
