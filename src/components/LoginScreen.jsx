import React, { useState } from 'react';
import { Lock, User, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginScreen({ onLogin, contacts }) {
  const [role, setRole] = useState('admin'); // 'admin' or 'teacher'
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const teachers = contacts.filter(c => c.category === 'Καθηγητής' || c.category === 'Εκπαιδευτής' || c.role === 'Καθηγητής');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      // For Admin, just use a hardcoded PIN for now: '0000' or let them in easily
      if (pin === '0000' || pin === '') { 
        onLogin({ role: 'admin' });
      } else {
        setError('Λάθος PIN Διαχειριστή. Δοκιμάστε 0000 (ή αφήστε το κενό)');
      }
    } else {
      if (!selectedTeacherId) {
        setError('Παρακαλώ επιλέξτε το όνομά σας.');
        return;
      }
      // For Teachers, simple mock PIN '1234'
      if (pin === '1234' || pin === '') {
        const teacher = teachers.find(t => t.id === selectedTeacherId);
        onLogin({ role: 'teacher', id: teacher.id, name: teacher.name, assignments: teacher.assignments || [] });
      } else {
        setError('Λάθος PIN Καθηγητή. Δοκιμάστε 1234 (ή αφήστε το κενό)');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', background: '#eff6ff', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 16px', color: '#2563eb'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Γραμματεία ΙΕΚ</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Είσοδος στο σύστημα διαχείρισης</p>
        </div>

        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '6px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: role === 'admin' ? '#fff' : 'transparent',
              color: role === 'admin' ? '#0f172a' : '#64748b',
              fontWeight: role === 'admin' ? '600' : '500',
              boxShadow: role === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Διαχειριστής
          </button>
          <button 
            type="button"
            onClick={() => setRole('teacher')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: role === 'teacher' ? '#fff' : 'transparent',
              color: role === 'teacher' ? '#0f172a' : '#64748b',
              fontWeight: role === 'teacher' ? '600' : '500',
              boxShadow: role === 'teacher' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Καθηγητής
          </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {role === 'teacher' && (
            <div className="sys-group" style={{ marginBottom: 0 }}>
              <label className="sys-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Επιλογή Καθηγητή
              </label>
              <select 
                className="sys-input" 
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                required
              >
                <option value="">-- Επιλέξτε το όνομά σας --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="sys-group" style={{ marginBottom: 0 }}>
            <label className="sys-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> PIN Πρόσβασης
            </label>
            <input 
              type="password" 
              className="sys-input" 
              placeholder={role === 'admin' ? 'Κωδικός Γραμματείας...' : 'Το προσωπικό σας PIN...'}
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
            {role === 'admin' && <small style={{ color: '#94a3b8', marginTop: '4px', display: 'block' }}>* Αφήστε κενό για γρήγορη είσοδο (Demo)</small>}
            {role === 'teacher' && <small style={{ color: '#94a3b8', marginTop: '4px', display: 'block' }}>* Δοκιμάστε το 1234 ή αφήστε κενό (Demo)</small>}
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2' }}>{error}</div>}

          <button 
            type="submit" 
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              padding: '12px', borderRadius: '10px', fontWeight: '600',
              fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: 'pointer', marginTop: '8px'
            }}
          >
            Είσοδος <ArrowRight size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
