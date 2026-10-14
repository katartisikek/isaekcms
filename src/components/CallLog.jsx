import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneForwarded,
  Search, Filter, Download, ChevronLeft, ChevronRight, Clock,
  ArrowUpDown, Trash2, MessageSquare, RefreshCw, BarChart3, X, User
} from 'lucide-react';
import { fetchCallLog, getCallStats, updateCallNote, deleteCallLogEntry } from '../services/telephonyService';

/**
 * CallLog — Ιστορικό Κλήσεων
 * 
 * Πίνακας κλήσεων με:
 * - Φίλτρα: ημερομηνία, direction, αναζήτηση, station
 * - Sorting: ημερομηνία, διάρκεια
 * - Stats: σύνοψη κλήσεων
 * - Export: Excel
 * - Notes: σημειώσεις ανά κλήση
 */
export default function CallLog({ contacts = [] }) {
  // Data
  const [calls, setCalls] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 30;

  // Note editing
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // ────────────────────────────────────────────────
  // Data Fetching
  // ────────────────────────────────────────────────

  const loadCalls = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchCallLog({
        limit: pageSize,
        offset: page * pageSize,
        direction: directionFilter || null,
        search: search || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        station: stationFilter || null
      });
      setCalls(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Failed to load calls:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, directionFilter, dateFrom, dateTo, stationFilter]);

  // Load on mount and when filters change
  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  // Load stats
  useEffect(() => {
    if (showStats) {
      getCallStats(dateFrom || null, dateTo || null).then(setStats).catch(() => {});
    }
  }, [showStats, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, directionFilter, dateFrom, dateTo, stationFilter]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────

  const handleSaveNote = async (callId) => {
    try {
      await updateCallNote(callId, noteText);
      setCalls(prev => prev.map(c => c.id === callId ? { ...c, notes: noteText } : c));
      setEditingNoteId(null);
      setNoteText('');
    } catch (err) {
      alert('Αποτυχία αποθήκευσης σημείωσης');
    }
  };

  const handleDeleteCall = async (callId) => {
    if (!window.confirm('Διαγραφή αυτής της εγγραφής κλήσης;')) return;
    try {
      await deleteCallLogEntry(callId);
      setCalls(prev => prev.filter(c => c.id !== callId));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      alert('Αποτυχία διαγραφής');
    }
  };

  // ────────────────────────────────────────────────
  // Export to Excel
  // ────────────────────────────────────────────────

  const handleExport = () => {
    try {
      // CSV export (universal compatibility)
      const headers = ['Ημερομηνία', 'Ώρα', 'Κατεύθυνση', 'Αριθμός Καλούντος', 'Όνομα', 'Αριθμός Κλήθηκε', 'Εσωτερικό', 'Διάρκεια', 'Κατάσταση', 'Σημειώσεις'];
      const rows = calls.map(call => [
        formatDate(call.start_time),
        formatTime(call.start_time),
        directionLabels[call.direction] || call.direction,
        call.caller_number || '',
        call.caller_name || '',
        call.called_number || '',
        call.station_number || '',
        call.duration || '00:00:00',
        statusLabels[call.status] || call.status,
        call.notes || ''
      ]);

      // BOM for proper Greek encoding in Excel
      const BOM = '\uFEFF';
      const csv = BOM + [
        headers.join(';'),
        ...rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
      ].join('\r\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ιστορικο_κλησεων_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Αποτυχία εξαγωγής');
    }
  };

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────

  const directionLabels = {
    incoming: 'Εισερχόμενη',
    outgoing: 'Εξερχόμενη',
    missed: 'Αναπάντητη',
    internal: 'Εσωτερική',
    unknown: 'Άγνωστο'
  };

  const statusLabels = {
    answered: 'Απαντήθηκε',
    missed: 'Αναπάντητη',
    busy: 'Κατειλημμένο',
    rejected: 'Απόρριψη'
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'incoming': return <PhoneIncoming size={15} style={{ color: '#22c55e' }} />;
      case 'outgoing': return <PhoneOutgoing size={15} style={{ color: '#3b82f6' }} />;
      case 'missed': return <PhoneMissed size={15} style={{ color: '#ef4444' }} />;
      case 'internal': return <PhoneForwarded size={15} style={{ color: '#8b5cf6' }} />;
      default: return <Phone size={15} style={{ color: '#94a3b8' }} />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      answered: { bg: '#dcfce7', color: '#16a34a' },
      missed: { bg: '#fee2e2', color: '#dc2626' },
      busy: { bg: '#fef3c7', color: '#d97706' },
      rejected: { bg: '#fce7f3', color: '#db2777' }
    };
    const c = colors[status] || { bg: '#f1f5f9', color: '#64748b' };
    return (
      <span className="call-status-badge" style={{ background: c.bg, color: c.color }}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString('el-GR');
    } catch { return '—'; }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}ω ${m}λ ${s}δ`;
    if (m > 0) return `${m}λ ${s}δ`;
    return `${s}δ`;
  };

  const formatTotalDuration = (seconds) => {
    if (!seconds) return '0';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}ω ${m}λ`;
    return `${m}λ`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Find contact name for a call
  const getContactName = (call) => {
    if (call.caller_name) return call.caller_name;
    if (!call.caller_number || contacts.length === 0) return null;

    const normalize = (num) => {
      if (!num) return '';
      return num.replace(/[\s\-\(\)]/g, '').replace(/^(\+30|0030)/, '').replace(/^0/, '');
    };
    const normalized = normalize(call.caller_number);
    if (!normalized) return null;

    for (const contact of contacts) {
      if (!contact.phone) continue;
      const contactNorm = normalize(contact.phone);
      if (contactNorm === normalized) return contact.name;
      if (normalized.length >= 7 && contactNorm.endsWith(normalized.slice(-7))) return contact.name;
    }
    return null;
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  return (
    <div className="call-log-container" id="call-log-page">
      {/* Header */}
      <div className="call-log-header">
        <div className="call-log-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={22} style={{ color: '#6366f1' }} />
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Ιστορικό Κλήσεων</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>
              {totalCount} εγγραφές
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`call-log-btn ${showStats ? 'active' : ''}`}
              onClick={() => setShowStats(!showStats)}
              title="Στατιστικά"
            >
              <BarChart3 size={14} />
            </button>
            <button
              className={`call-log-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title="Φίλτρα"
            >
              <Filter size={14} />
            </button>
            <button className="call-log-btn" onClick={handleExport} title="Εξαγωγή CSV">
              <Download size={14} />
            </button>
            <button className="call-log-btn" onClick={loadCalls} title="Ανανέωση">
              <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="call-log-search">
          <Search size={15} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Αναζήτηση αριθμού, ονόματος..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="call-log-search-clear" onClick={() => setSearchInput('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="call-log-filters">
            <div className="call-log-filter-group">
              <label>Κατεύθυνση</label>
              <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}>
                <option value="">Όλες</option>
                <option value="incoming">📞 Εισερχόμενες</option>
                <option value="outgoing">📱 Εξερχόμενες</option>
                <option value="missed">❌ Αναπάντητες</option>
                <option value="internal">🔄 Εσωτερικές</option>
              </select>
            </div>
            <div className="call-log-filter-group">
              <label>Από</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="call-log-filter-group">
              <label>Έως</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="call-log-filter-group">
              <label>Εσωτερικό</label>
              <input
                type="text"
                placeholder="π.χ. 1001"
                value={stationFilter}
                onChange={e => setStationFilter(e.target.value)}
                style={{ width: '80px' }}
              />
            </div>
            {(directionFilter || dateFrom || dateTo || stationFilter) && (
              <button
                className="call-log-btn"
                onClick={() => {
                  setDirectionFilter('');
                  setDateFrom('');
                  setDateTo('');
                  setStationFilter('');
                }}
                style={{ alignSelf: 'flex-end', fontSize: '11px' }}
              >
                <X size={12} /> Καθαρισμός
              </button>
            )}
          </div>
        )}

        {/* Stats panel */}
        {showStats && stats && (
          <div className="call-log-stats">
            <div className="call-stat-card">
              <div className="call-stat-value">{stats.total}</div>
              <div className="call-stat-label">Σύνολο</div>
            </div>
            <div className="call-stat-card" style={{ borderLeftColor: '#22c55e' }}>
              <div className="call-stat-value" style={{ color: '#22c55e' }}>{stats.incoming}</div>
              <div className="call-stat-label">Εισερχόμενες</div>
            </div>
            <div className="call-stat-card" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="call-stat-value" style={{ color: '#3b82f6' }}>{stats.outgoing}</div>
              <div className="call-stat-label">Εξερχόμενες</div>
            </div>
            <div className="call-stat-card" style={{ borderLeftColor: '#ef4444' }}>
              <div className="call-stat-value" style={{ color: '#ef4444' }}>{stats.missed}</div>
              <div className="call-stat-label">Αναπάντητες</div>
            </div>
            <div className="call-stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
              <div className="call-stat-value" style={{ color: '#8b5cf6' }}>{stats.internal}</div>
              <div className="call-stat-label">Εσωτερικές</div>
            </div>
            <div className="call-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="call-stat-value" style={{ color: '#f59e0b' }}>{formatTotalDuration(stats.avgDuration)}</div>
              <div className="call-stat-label">Μέση Διάρκεια</div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="call-log-table-wrapper">
        <table className="call-log-table">
          <thead>
            <tr>
              <th style={{ width: '36px' }}></th>
              <th>Ημερομηνία</th>
              <th>Ώρα</th>
              <th>Αριθμός</th>
              <th>Όνομα</th>
              <th>Εσωτερικό</th>
              <th>Διάρκεια</th>
              <th>Κατάσταση</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <RefreshCw size={20} className="spinning" style={{ marginBottom: '8px' }} />
                  <br />Φόρτωση...
                </td>
              </tr>
            ) : calls.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <Phone size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                  <br />
                  {search || directionFilter || dateFrom || dateTo
                    ? 'Δεν βρέθηκαν κλήσεις με αυτά τα φίλτρα'
                    : 'Δεν υπάρχουν κλήσεις ακόμα'
                  }
                  <br />
                  <span style={{ fontSize: '11px' }}>
                    Οι κλήσεις θα εμφανιστούν αυτόματα μόλις συνδεθεί ο Bridge Server με το iPECS
                  </span>
                </td>
              </tr>
            ) : (
              calls.map(call => {
                const contactName = getContactName(call);

                return (
                  <React.Fragment key={call.id}>
                    <tr className={`call-log-row ${call.status === 'missed' ? 'call-missed' : ''}`}>
                      <td className="call-direction-cell">
                        {getDirectionIcon(call.direction)}
                      </td>
                      <td className="call-date-cell">{formatDate(call.start_time)}</td>
                      <td className="call-time-cell">{formatTime(call.start_time)}</td>
                      <td className="call-number-cell">
                        <span className="call-number">{call.caller_number || '—'}</span>
                        {call.called_number && call.direction === 'outgoing' && (
                          <span className="call-number-secondary">→ {call.called_number}</span>
                        )}
                      </td>
                      <td className="call-name-cell">
                        {contactName ? (
                          <span className="call-contact-name">
                            <User size={12} />
                            {contactName}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td className="call-station-cell">
                        {call.station_number || '—'}
                        {call.station_name && (
                          <span className="call-station-name">{call.station_name}</span>
                        )}
                      </td>
                      <td className="call-duration-cell">
                        {call.duration_seconds > 0 ? (
                          <span className="call-duration">
                            <Clock size={11} />
                            {formatDuration(call.duration_seconds)}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td>{getStatusBadge(call.status)}</td>
                      <td className="call-actions-cell">
                        <button
                          className="call-action-btn"
                          onClick={() => {
                            setEditingNoteId(editingNoteId === call.id ? null : call.id);
                            setNoteText(call.notes || '');
                          }}
                          title="Σημείωση"
                        >
                          <MessageSquare size={13} style={{ color: call.notes ? '#6366f1' : '#cbd5e1' }} />
                        </button>
                        <button
                          className="call-action-btn"
                          onClick={() => handleDeleteCall(call.id)}
                          title="Διαγραφή"
                        >
                          <Trash2 size={13} style={{ color: '#cbd5e1' }} />
                        </button>
                      </td>
                    </tr>
                    {/* Inline note editor */}
                    {editingNoteId === call.id && (
                      <tr className="call-note-row">
                        <td colSpan="9">
                          <div className="call-note-editor">
                            <input
                              type="text"
                              placeholder="Γράψτε σημείωση για αυτή την κλήση..."
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveNote(call.id);
                                if (e.key === 'Escape') { setEditingNoteId(null); setNoteText(''); }
                              }}
                              autoFocus
                            />
                            <button onClick={() => handleSaveNote(call.id)}>Αποθήκευση</button>
                            <button onClick={() => { setEditingNoteId(null); setNoteText(''); }} style={{ background: 'transparent', color: '#94a3b8' }}>
                              Ακύρωση
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="call-log-pagination">
          <button
            className="call-log-btn"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="call-log-page-info">
            Σελίδα {page + 1} / {totalPages}
          </span>
          <button
            className="call-log-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
