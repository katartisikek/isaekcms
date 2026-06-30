import React from 'react';
import { Edit2, Trash2, Mail, Phone, BookOpen, Clock } from 'lucide-react';

export default function InterestList({ interests, specialties, onEdit, onDelete }) {
  if (!interests || interests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b' }}>Δεν υπάρχουν εκδηλώσεις ενδιαφέροντος αυτή τη στιγμή.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="sys-table">
        <thead>
          <tr>
            <th>Ονοματεπώνυμο</th>
            <th>Επικοινωνία</th>
            <th>Ειδικότητα Ενδιαφέροντος</th>
            <th>Σχόλια / Σημειώσεις</th>
            <th>Ημερομηνία</th>
            <th className="actions-col">Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {interests.map((interest) => {
            const specialty = specialties.find(s => s.id === interest.specialtyId);
            
            return (
              <tr key={interest.id}>
                <td>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>
                    {interest.lastName} {interest.firstName}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#475569' }}>
                    {interest.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {interest.phone}
                      </div>
                    )}
                    {interest.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {interest.email}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} color="#64748b" />
                    <span style={{ fontWeight: '500', color: '#334155' }}>
                      {specialty ? specialty.title : <span style={{ color: '#94a3b8' }}>-Δεν ορίστηκε-</span>}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '13px', color: '#475569', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                    {interest.comments || <span style={{ color: '#94a3b8' }}>-</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                    <Clock size={12} />
                    {interest.createdAt ? new Date(interest.createdAt).toLocaleDateString('el-GR') : '-'}
                  </div>
                </td>
                <td className="actions-col">
                  <button className="action-btn edit" onClick={() => onEdit(interest)} title="Επεξεργασία">
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => onDelete(interest.id)} title="Διαγραφή">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
