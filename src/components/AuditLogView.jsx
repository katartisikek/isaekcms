import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { exportAuditLog } from '../services/exportExcel';
import { FileText, Search, Download, AlertCircle, RefreshCw } from 'lucide-react';

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchAuditLog();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Προέκυψε σφάλμα κατά τη φόρτωση του ιστορικού. Ίσως ο πίνακας audit_log δεν έχει δημιουργηθεί στη βάση.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(q) ||
      (log.entity || '').toLowerCase().includes(q) ||
      (log.entity_name || '').toLowerCase().includes(q) ||
      (log.user_name || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q)
    );
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return { bg: '#dcfce7', text: '#166534' };
      case 'UPDATE': return { bg: '#dbeafe', text: '#1e40af' };
      case 'DELETE': return { bg: '#fee2e2', text: '#991b1b' };
      case 'CONVERT': return { bg: '#f3e8ff', text: '#6b21a8' };
      default: return { bg: '#f1f5f9', text: '#334155' };
    }
  };

  const translateAction = (action) => {
    switch (action) {
      case 'CREATE': return 'Προσθήκη';
      case 'UPDATE': return 'Επεξεργασία';
      case 'DELETE': return 'Διαγραφή';
      case 'CONVERT': return 'Μετατροπή';
      default: return action;
    }
  };

  const translateEntity = (entity) => {
    switch (entity) {
      case 'student': return 'Σπουδαστής';
      case 'interest': return 'Ενδιαφερόμενος';
      case 'task': return 'Εργασία';
      case 'contact': return 'Επαφή';
      case 'event': return 'Μάθημα';
      case 'grade': return 'Βαθμολογία';
      default: return entity;
    }
  };

  return (
    <div className="desktop-content">
      <div className="grid-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="grid-title">Ιστορικό Αλλαγών Συστήματος</span>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>
            Καταγραφή όλων των ενεργειών χρηστών (Audit Log)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-sys" onClick={fetchLogs} title="Ανανέωση">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Ανανέωση</span>
          </button>
          <button 
            className="btn-sys primary" 
            onClick={() => exportAuditLog(filteredLogs)}
            disabled={filteredLogs.length === 0}
          >
            <Download size={14} />
            <span>Εξαγωγή Excel</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="sys-input-group" style={{ flex: 1, maxWidth: '400px', margin: 0 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="sys-input"
              placeholder="Αναζήτηση ιστορικού (π.χ. όνομα, ενέργεια)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          {filteredLogs.length} {filteredLogs.length === 1 ? 'εγγραφή' : 'εγγραφές'}
        </div>
      </div>

      <div className="desktop-grid-container" style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Φόρτωση ιστορικού...</div>
        ) : error ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#dc2626', background: '#fef2f2', borderRadius: '8px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Δεν βρέθηκαν καταγραφές.</div>
        ) : (
          <div className="table-responsive">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Ημερομηνία & Ώρα</th>
                  <th style={{ width: '10%' }}>Χρήστης</th>
                  <th style={{ width: '10%' }}>Ενέργεια</th>
                  <th style={{ width: '15%' }}>Κατηγορία</th>
                  <th style={{ width: '20%' }}>Όνομα Εγγραφής</th>
                  <th style={{ width: '30%' }}>Λεπτομέρειες</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const actionColor = getActionColor(log.action);
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '13px', color: '#475569' }}>
                        {new Date(log.created_at).toLocaleString('el-GR')}
                      </td>
                      <td style={{ fontWeight: '500' }}>
                        {log.user_name || 'Άγνωστος'}
                      </td>
                      <td>
                        <span style={{ 
                          background: actionColor.bg, 
                          color: actionColor.text, 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {translateAction(log.action)}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {translateEntity(log.entity)}
                      </td>
                      <td style={{ fontWeight: '500', color: '#0f172a' }}>
                        {log.entity_name || '-'}
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {log.details || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
