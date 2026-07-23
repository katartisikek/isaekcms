import React from 'react';
import { Edit2, Trash2, Mail, Phone, BookOpen, Clock, UserPlus, Download, MessageSquare, CheckCircle2 } from 'lucide-react';
import { exportInterests } from '../services/exportExcel';

export default function InterestList({ interests, specialties, students = [], onEdit, onDelete, onConvert }) {
  if (!interests || interests.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '12px', background: '#fff', borderRadius: '12px', padding: '40px' }}>
        <MessageSquare size={48} style={{ opacity: 0.3 }} />
        <span style={{ fontSize: '1rem', fontWeight: '500' }}>Δεν υπάρχουν εκδηλώσεις ενδιαφέροντος αυτή τη στιγμή.</span>
      </div>
    );
  }

  // Sort by date descending (newest first)
  const sortedInterests = [...interests].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="desktop-grid-container" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      {/* Export row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <button
          className="btn-sys"
          onClick={() => exportInterests(interests, specialties)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 14px', borderRadius: '6px' }}
        >
          <Download size={14} />
          Εξαγωγή Excel ({interests.length})
        </button>
      </div>
      
      <table className="desktop-table">
        <thead>
          <tr>
            <th style={{ width: '24%' }}>Ονοματεπώνυμο</th>
            <th style={{ width: '18%' }}>Επικοινωνία</th>
            <th style={{ width: '23%' }}>Ειδικότητα Ενδιαφέροντος</th>
            <th style={{ width: '20%' }}>Σχόλια / Σημειώσεις</th>
            <th style={{ width: '10%' }}>Ημερομηνία</th>
            <th style={{ width: '5%', textAlign: 'center' }}>Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {sortedInterests.map((interest) => {
            const specialty = specialties.find(s => s.id === interest.specialtyId);
            
            const isRegistered = interest.status === 'registered' || 
              interest.isRegistered === true || 
              interest.converted === true ||
              (students && students.some(s => {
                if (!s) return false;
                const phoneMatch = interest.phone && s.phone && interest.phone.replace(/\s+/g, '') === s.phone.replace(/\s+/g, '');
                const emailMatch = interest.email && s.email && interest.email.toLowerCase() === s.email.toLowerCase();
                const fullNameInterest = `${interest.lastName || ''} ${interest.firstName || ''}`.trim().toLowerCase();
                const fullNameStudent = (s.fullName || '').trim().toLowerCase();
                const nameMatch = fullNameInterest && fullNameStudent && (fullNameInterest === fullNameStudent);
                return (phoneMatch && phoneMatch.length > 5) || (emailMatch && emailMatch.length > 5) || (nameMatch && fullNameInterest.length > 5);
              }));
            
            return (
              <tr key={interest.id} style={{ background: isRegistered ? '#f0fdf4' : undefined }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: '600', color: isRegistered ? '#14532d' : '#1e293b', fontSize: '14px' }}>
                      {interest.lastName} {interest.firstName}
                    </div>
                    {isRegistered && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        background: '#dcfce7', 
                        color: '#15803d', 
                        border: '1px solid #86efac', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                      }} title="Ο σπουδαστής έχει ολοκληρώσει την εγγραφή του">
                        <CheckCircle2 size={12} />
                        Εγγράφηκε
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                    {interest.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '14px' }}>
                        <Phone size={14} color="#64748b" /> {interest.phone}
                      </div>
                    )}
                    {interest.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#64748b" /> {interest.email}
                      </div>
                    )}
                    {!interest.phone && !interest.email && (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Δεν υπάρχει επικοινωνία</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '6px' }}>
                      <BookOpen size={16} color="#475569" />
                    </div>
                    <span style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>
                      {specialty ? specialty.title : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>-Δεν ορίστηκε-</span>}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#475569', 
                    maxWidth: '100%', 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px dashed #cbd5e1'
                  }}>
                    {interest.comments || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Κανένα σχόλιο</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    <Clock size={14} color="#94a3b8" />
                    {interest.createdAt ? new Date(interest.createdAt).toLocaleDateString('el-GR') : '-'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <button
                      className="action-btn"
                      onClick={() => onConvert(interest)}
                      title="Εγγραφή ως Σπουδαστής"
                      style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px', borderRadius: '6px' }}
                    >
                      <UserPlus size={16} />
                    </button>
                    <button 
                      className="action-btn edit" 
                      onClick={() => onEdit(interest)} 
                      title="Επεξεργασία"
                      style={{ padding: '6px', borderRadius: '6px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => onDelete(interest.id)} 
                      title="Διαγραφή"
                      style={{ padding: '6px', borderRadius: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
