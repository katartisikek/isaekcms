import React from 'react';
import { Edit2, Trash2, FileText, AlertCircle, Award } from 'lucide-react';

export default function StudentTable({ students = [], specialties = [], onViewProfile, onEdit, onDelete }) {
  
  // Resolve specialty title & sector for a given specialtyId
  const getSpecialtyDetails = (specialtyId) => {
    const specialty = specialties.find(s => s.id === specialtyId);
    if (!specialty) {
      return {
        title: 'Μη καταχωρημένη',
        sector: 'Άγνουστος Τομέας'
      };
    }
    return {
      title: specialty.title,
      sector: specialty.sector
    };
  };

  const sortedStudents = [...students].sort((a, b) => 
    (a.fullName || '').localeCompare(b.fullName || '', 'el')
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {students.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '8px' }}>
          <AlertCircle size={36} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Δεν βρέθηκαν καταχωρημένοι σπουδαστές με αυτά τα φίλτρα.</span>
        </div>
      ) : (
        <table className="desktop-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Ονοματεπώνυμο</th>
              <th style={{ width: '14%' }}>Τηλέφωνο</th>
              <th style={{ width: '26%' }}>Ειδικότητα / Τομέας</th>
              <th style={{ width: '10%' }}>Έτος</th>
              <th style={{ width: '12%', textAlign: 'right' }}>Οφειλή (€)</th>
              <th style={{ width: '10%' }}>Πλάνο Πληρωμής</th>
              <th style={{ width: '6%', textAlign: 'center' }}>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => {
              const { title, sector } = getSpecialtyDetails(student.specialtyId);
              const totalDebt = parseFloat(student.totalDebt || 0);
              const installments = parseInt(student.numberOfInstallments || 1, 10);
              
              const calculatedAmount = installments > 0 
                ? (totalDebt / installments).toFixed(2) 
                : '0.00';

              return (
                <tr key={student.id}>
                  {/* Name and Email column */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#1f2937' }}>
                        <span>{student.fullName}</span>
                        {student.notes && (
                          <FileText size={12} color="#3b82f6" title={student.notes} />
                        )}
                      </div>
                      {student.email && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '400', fontFamily: 'monospace' }}>
                          {student.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Phone column */}
                  <td style={{ fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                    {student.phone}
                  </td>

                  {/* Specialty and sector column */}
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{sector}</div>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{title}</div>
                  </td>

                  {/* Year of study column */}
                  <td>
                    {student.year && (
                      <span className="sys-badge info" style={{ fontSize: '0.7rem' }}>
                        {student.year}
                      </span>
                    )}
                    {student.mathitisAr && student.mathitisAr !== '-' && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>#{student.mathitisAr}</div>
                    )}
                  </td>

                  {/* Total Debt column */}
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {totalDebt.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                  </td>

                  {/* Payment plan column */}
                  <td>
                    {!student.hasInstallments ? (
                      <span className="sys-badge info">Εφάπαξ</span>
                    ) : (
                      <span className="sys-badge success" title={`${installments} δόσεις`}>
                        {installments} δόσεις ({parseFloat(calculatedAmount).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}/μήνα)
                      </span>
                    )}
                  </td>

                  {/* Actions column */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button 
                        className="btn-icon edit" 
                        onClick={() => onViewProfile(student)}
                        title="Βαθμολογίες"
                        style={{ width: '26px', height: '26px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Award size={13} />
                      </button>
                      <button 
                        className="btn-icon edit" 
                        onClick={() => onEdit(student)}
                        title="Επεξεργασία"
                        style={{ width: '26px', height: '26px', borderRadius: '4px' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => onDelete(student.id)}
                        title="Διαγραφή"
                        style={{ width: '26px', height: '26px', borderRadius: '4px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
