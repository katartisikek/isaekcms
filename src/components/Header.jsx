import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar } from 'lucide-react';

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--primary)', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
          <GraduationCap size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            Γραμματεία - Διαχείριση Σπουδαστών
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>
            Σύστημα Διαχείρισης Κατάρτισης & Οικονομικού Προγραμματισμού ΙΣΑΕΚ
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <Calendar size={15} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {formattedDate}
        </span>
      </div>
    </header>
  );
}
