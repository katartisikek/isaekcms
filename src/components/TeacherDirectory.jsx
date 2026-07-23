import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  Package, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  Notebook,
  ExternalLink,
  GraduationCap,
  Download,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { exportContacts } from '../services/exportExcel';

export default function TeacherDirectory({ 
  contacts = [], 
  specialties = [],
  courses = {},
  onAddContactClick, 
  onEditContactClick, 
  onDeleteContact 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Όλοι');

  // Categories list for tabs
  const CATEGORIES = ['Όλοι', 'Εκπαιδευτής', 'Υπουργείο / Πήγασος', 'Συνεργάτης', 'Προμηθευτής', 'Άλλο'];

  // Map category to Lucide Icon
  const getCategoryIcon = (category, size = 16) => {
    switch (category) {
      case 'Υπουργείο / Πήγασος':
        return <Building size={size} />;
      case 'Προμηθευτής':
        return <Package size={size} />;
      case 'Συνεργάτης':
        return <Briefcase size={size} />;
      case 'Εκπαιδευτής':
        return <GraduationCap size={size} />;
      default:
        return <User size={size} />;
    }
  };

  // Gradient themes per category
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Εκπαιδευτής':
        return {
          bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          badgeBg: '#e0e7ff',
          badgeColor: '#3730a3',
          border: '#c7d2fe',
          lightBg: '#f5f3ff'
        };
      case 'Υπουργείο / Πήγασος':
        return {
          bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          badgeBg: '#dbeafe',
          badgeColor: '#1e40af',
          border: '#bfdbfe',
          lightBg: '#eff6ff'
        };
      case 'Συνεργάτης':
        return {
          bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          badgeBg: '#dcfce7',
          badgeColor: '#15803d',
          border: '#bbf7d0',
          lightBg: '#f0fdf4'
        };
      case 'Προμηθευτής':
        return {
          bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          badgeBg: '#fce7f3',
          badgeColor: '#9d174d',
          border: '#fbcfe8',
          lightBg: '#fdf2f8'
        };
      default:
        return {
          bgGradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
          badgeBg: '#f1f5f9',
          badgeColor: '#334155',
          border: '#e2e8f0',
          lightBg: '#f8fafc'
        };
    }
  };

  // Perform client-side real-time filtering
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Category filter check
      if (selectedCategory !== 'Όλοι' && contact.category !== selectedCategory) {
        return false;
      }

      // Text search check
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (contact.name || '').toLowerCase().includes(query);
        const phoneMatch = (contact.phone || '').includes(query);
        const descMatch = (contact.description || '').toLowerCase().includes(query);
        
        if (!nameMatch && !phoneMatch && !descMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'el'));
  }, [contacts, selectedCategory, searchQuery]);

  const handleDelete = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    
    if (window.confirm(`Επιβεβαίωση Διαγραφής:\nΕίστε βέβαιοι ότι θέλετε να διαγράψετε την επαφή "${contact.name}";`)) {
      onDeleteContact(contactId);
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
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Κατάλογος Καθηγητών & Επαφών
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Συνολικά {filteredContacts.length} καταχωρημένες επαφές
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
            <span>Νέα Επαφή</span>
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
            <span>Exαγωγή Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Category Selector Ribbon */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '540px', width: '100%' }}>
          <input
            type="text"
            className="sys-input"
            placeholder="🔍 Αναζήτηση με όνομα, τηλέφωνο, ειδικότητα ή μάθημα..."
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

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = cat === 'Όλοι' 
              ? contacts.length 
              : contacts.filter(c => c.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: isActive ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#ffffff',
                  color: isActive ? '#1e40af' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 2px 4px rgba(37,99,235,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {getCategoryIcon(cat, 14)}
                <span>{cat}</span>
                <span style={{
                  background: isActive ? '#2563eb' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
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
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Δεν βρέθηκαν καταχωρημένες επαφές με αυτά τα κριτήρια.</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {filteredContacts.map((contact) => {
              const theme = getCategoryTheme(contact.category);

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
                      background: theme.bgGradient, color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      {getCategoryIcon(contact.category, 22)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: theme.badgeBg, color: theme.badgeColor, padding: '2px 8px', borderRadius: '6px'
                        }}>
                          {contact.category || 'Καθηγητής'}
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
                  {contact.assignments && contact.assignments.length > 0 && (
                    <div style={{ padding: '14px 20px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={12} color="#6366f1" />
                        <span>Διδασκόμενα Μαθήματα ({contact.assignments.length})</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                                <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={spec.title}>
                                  {spec.title}
                                </div>
                              )}
                              {courseTitle && (
                                <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: '#94a3b8' }}>↳</span>
                                  <span>{courseTitle}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
                        onClick={() => onEditContactClick(contact)}
                        style={{
                          background: '#f1f5f9', color: '#334155', border: 'none',
                          borderRadius: '6px', padding: '5px 12px', fontSize: '11.5px',
                          fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={12} />
                        <span>Επεξεργασία</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id)}
                        style={{
                          background: '#fef2f2', color: '#dc2626', border: 'none',
                          borderRadius: '6px', padding: '5px 12px', fontSize: '11.5px',
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
    </div>
  );
}
