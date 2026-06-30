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
  Download
} from 'lucide-react';
import { exportContacts } from '../services/exportExcel';

export default function ContactDirectory({ 
  contacts = [], 
  specialties = [],
  onAddContactClick, 
  onEditContactClick, 
  onDeleteContact 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Όλοι');

  // Categories list for tabs
  const CATEGORIES = ['Όλοι', 'Εκπαιδευτής', 'Υπουργείο / Πήγασος', 'Συνεργάτης', 'Προμηθευτής', 'Άλλο'];

  // Map category to Lucide Icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Υπουργείο / Πήγασος':
        return <Building size={20} />;
      case 'Προμηθευτής':
        return <Package size={20} />;
      case 'Συνεργάτης':
        return <Briefcase size={20} />;
      case 'Εκπαιδευτής':
        return <GraduationCap size={20} />;
      default:
        return <User size={20} />;
    }
  };

  // Map category to CSS class for badges
  const getCategoryClass = (category) => {
    switch (category) {
      case 'Υπουργείο / Πήγασος':
        return 'cat-ministry';
      case 'Προμηθευτής':
        return 'cat-supplier';
      case 'Συνεργάτης':
        return 'cat-partner';
      case 'Εκπαιδευτής':
        return 'cat-teacher';
      default:
        return 'cat-other';
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
    });
  }, [contacts, selectedCategory, searchQuery]);

  const handleDelete = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    
    if (window.confirm(`Επιβεβαίωση Διαγραφής:\nΕίστε βέβαιοι ότι θέλετε να διαγράψετε την επαφή "${contact.name}";`)) {
      onDeleteContact(contactId);
    }
  };

  return (
    <div className="directory-workspace">
      {/* 1. Directory ribbon toolbar */}
      <div className="desktop-toolbar" style={{ borderBottom: '1px solid #cbd5e1' }}>
        <div className="toolbar-group">
          <Notebook size={14} color="#4b5563" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563' }}>
            Τηλεφωνικός Κατάλογος & Προμηθευτές
          </span>
        </div>
        <div className="toolbar-group">
          <button className="btn-sys primary" onClick={onAddContactClick}>
            <Plus size={14} />
            <span>Νέα Επαφή</span>
          </button>
          <button className="btn-sys" onClick={() => exportContacts(filteredContacts, specialties)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} />
            <span>Excel ({filteredContacts.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Categories Panel */}
      <div className="directory-filter-panel">
        {/* Quick Search Input */}
        <div className="directory-search-wrapper">
          <input
            type="text"
            className="sys-input search-large"
            placeholder="Αναζήτηση Επαφής (Όνομα, τηλέφωνο ή αντικείμενο...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} color="#9ca3af" className="search-icon-large" />
        </div>

        {/* Category Pills Tabs */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cards Grid Layout */}
      <div className="directory-grid-container">
        {filteredContacts.length === 0 ? (
          <div className="directory-empty-state">
            <span>Δεν βρέθηκαν καταχωρημένες επαφές με αυτά τα κριτήρια.</span>
          </div>
        ) : (
          <div className="directory-grid">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                {/* Header of card (Icon + Title & Category badge) */}
                <div className="contact-card-header">
                  <div className={`contact-avatar ${getCategoryClass(contact.category)}`}>
                    {getCategoryIcon(contact.category)}
                  </div>
                  <div className="contact-info-header">
                    <span className={`contact-badge ${getCategoryClass(contact.category)}`}>
                      {contact.category}
                    </span>
                    <h4 className="contact-name" title={contact.name}>{contact.name}</h4>
                    {contact.assignments && contact.assignments.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {contact.assignments.map((assignment, idx) => {
                          const spec = specialties.find(s => s.id === assignment.specialtyId);
                          let courseTitle = '';
                          if (assignment.courseId && courses[assignment.specialtyId]) {
                            const course = courses[assignment.specialtyId].find(c => c.id === assignment.courseId);
                            if (course) courseTitle = course.title;
                          }
                          
                          if (!spec) return null;
                          return (
                            <div key={idx} style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              background: '#f1f5f9', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '4px', 
                              padding: '2px 6px',
                              fontSize: '11px',
                              color: '#334155'
                            }}>
                              <span style={{ fontWeight: '600' }}>{spec.title}</span>
                              {courseTitle && (
                                <>
                                  <span style={{ color: '#94a3b8' }}>›</span>
                                  <span>{courseTitle}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description notes */}
                <div className="contact-card-body">
                  <p className="contact-desc">
                    {contact.description || 'Χωρίς σημειώσεις / περιγραφή.'}
                  </p>
                </div>

                {/* Direct Action links */}
                <div className="contact-card-links">
                  {/* Phone link */}
                  <a href={`tel:${contact.phone}`} className="contact-link" title="Κλήση τηλεφώνου">
                    <Phone size={13} />
                    <span>{contact.phone}</span>
                    <ExternalLink size={10} className="link-arrow" />
                  </a>

                  {/* Email link (only if exists) */}
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="contact-link" title="Αποστολή email">
                      <Mail size={13} />
                      <span>{contact.email}</span>
                      <ExternalLink size={10} className="link-arrow" />
                    </a>
                  ) : (
                    <div className="contact-link-placeholder">
                      <Mail size={13} />
                      <span>Χωρίς Email</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="contact-card-actions">
                  <button
                    type="button"
                    className="btn-card-action edit"
                    onClick={() => onEditContactClick(contact)}
                    title="Επεξεργασία"
                  >
                    <Edit size={12} />
                    <span>Επεξεργασία</span>
                  </button>
                  <button
                    type="button"
                    className="btn-card-action delete"
                    onClick={() => handleDelete(contact.id)}
                    title="Διαγραφή"
                  >
                    <Trash2 size={12} />
                    <span>Διαγραφή</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
