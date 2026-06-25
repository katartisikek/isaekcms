import React, { useState } from 'react';
import { Calendar as CalendarIcon, BookOpen, Clock, Users, ArrowLeft, CheckCircle, FileText, MapPin } from 'lucide-react';
import TeacherClassView from './TeacherClassView';

export default function TeacherPortal({ 
  teacher, 
  events, 
  students, 
  specialties, 
  absences, 
  setAbsences, 
  grades, 
  setGrades,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'classes'
  const [selectedClass, setSelectedClass] = useState(null);

  // Get teacher's events
  const teacherEvents = events.filter(e => e.instructorId === teacher.id).sort((a, b) => a.start - b.start);
  
  // Calculate unique classes (Course + Specialty combination) taught by this teacher
  const teacherClassesMap = new Map();
  teacherEvents.forEach(ev => {
    const key = `${ev.specialtyId}-${ev.title}`;
    if (!teacherClassesMap.has(key)) {
      teacherClassesMap.set(key, {
        specialtyId: ev.specialtyId,
        courseTitle: ev.title,
        specialtyTitle: specialties.find(s => s.id === ev.specialtyId)?.title || 'Άγνωστη Ειδικότητα',
        semester: ev.semester || 'semester1' // Needs fallback if semester isn't on event, but usually it's known context
      });
    }
  });
  const teacherClasses = Array.from(teacherClassesMap.values());

  if (selectedClass) {
    return (
      <TeacherClassView 
        classInfo={selectedClass} 
        onBack={() => setSelectedClass(null)} 
        students={students}
        absences={absences}
        setAbsences={setAbsences}
        grades={grades}
        setGrades={setGrades}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Navbar */}
      <header style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {teacher.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{teacher.name}</h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Πύλη Εκπαιδευτή</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
        >
          Αποσύνδεση
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Καλώς ήρθατε, Καθηγητά</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{
              padding: '10px 20px', background: activeTab === 'schedule' ? '#eff6ff' : 'transparent',
              color: activeTab === 'schedule' ? '#2563eb' : '#64748b', border: activeTab === 'schedule' ? '1px solid #bfdbfe' : '1px solid transparent',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <CalendarIcon size={18} /> Το Πρόγραμμά μου
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            style={{
              padding: '10px 20px', background: activeTab === 'classes' ? '#eff6ff' : 'transparent',
              color: activeTab === 'classes' ? '#2563eb' : '#64748b', border: activeTab === 'classes' ? '1px solid #bfdbfe' : '1px solid transparent',
              borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <BookOpen size={18} /> Τα Μαθήματά μου
          </button>
        </div>

        {/* Content: Schedule */}
        {activeTab === 'schedule' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {teacherEvents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', color: '#94a3b8' }}>
                <CalendarIcon size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
                Δεν υπάρχουν προγραμματισμένα μαθήματα στο ημερολόγιο για εσάς.
              </div>
            ) : (
              teacherEvents.map(ev => {
                const spec = specialties.find(s => s.id === ev.specialtyId);
                return (
                  <div key={ev.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: `4px solid ${ev.color || '#3b82f6'}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{ev.start.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                      <span style={{ background: '#eff6ff', padding: '2px 8px', borderRadius: '12px' }}>
                        {ev.start.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })} - {ev.end.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>{ev.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      {spec && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} /> {spec.title}</div>}
                      {ev.room && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Αίθουσα: {ev.room}</div>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Content: Classes */}
        {activeTab === 'classes' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {teacherClasses.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', color: '#94a3b8' }}>
                Δεν βρέθηκαν μαθήματα. Βεβαιωθείτε ότι η γραμματεία σας έχει αναθέσει μαθήματα στο ημερολόγιο.
              </div>
            ) : (
              teacherClasses.map((cls, idx) => (
                <div key={idx} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
                  onClick={() => setSelectedClass(cls)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f3e8ff', color: '#9333ea', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>{cls.courseTitle}</h3>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{cls.specialtyTitle}</div>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                        <Users size={16} /> Διαχείριση Σπουδαστών
                      </div>
                    </div>
                    <div style={{ color: '#2563eb', background: '#eff6ff', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                      Άνοιγμα
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
