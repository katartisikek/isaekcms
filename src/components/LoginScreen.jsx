import React, { useState } from 'react';
import { User, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const admins = [
    { id: 'admin1', name: 'Melpo' },
    { id: 'admin2', name: 'Nikolopoulou' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedAdmin) {
      setError('Παρακαλώ επιλέξτε προφίλ Γραμματείας.');
      return;
    }

    if (pin === 'kat123!!') {
      const admin = admins.find(a => a.id === selectedAdmin);
      onLogin({ role: 'admin', id: admin.id, name: admin.name });
    } else {
      setError('Λάθος Κωδικός Πρόσβασης.');
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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="sys-group" style={{ marginBottom: 0 }}>
            <label className="sys-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> Προφίλ Χρήστη
            </label>
            <select 
              className="sys-input" 
              value={selectedAdmin}
              onChange={e => setSelectedAdmin(e.target.value)}
              required
            >
              <option value="">-- Επιλέξτε Προφίλ --</option>
              {admins.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="sys-group" style={{ marginBottom: 0 }}>
            <label className="sys-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> Κωδικός Πρόσβασης
            </label>
            <input 
              type="password" 
              className="sys-input" 
              placeholder="Εισάγετε τον κωδικό σας..."
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
            />
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
