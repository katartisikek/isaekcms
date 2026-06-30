import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, UserPlus, Folder, FolderOpen, Database, Home, BarChart4, CheckSquare, Plus, Phone, BookOpen, Settings, LogOut, Calendar as CalendarIcon, Clock, MapPin, FileText, GraduationCap, MessageSquare
} from 'lucide-react';
import StudentTable from './components/StudentTable';
import StudentFormModal from './components/StudentFormModal';
import StudentProfileModal from './components/StudentProfileModal';
import SpecialtyManager from './components/SpecialtyManager';
import DashboardStats from './components/DashboardStats';
import TaskBoard from './components/TaskBoard';
import TaskFormModal from './components/TaskFormModal';
import ContactDirectory from './components/ContactDirectory';
import ContactFormModal from './components/ContactFormModal';
import ScheduleCalendar from './components/ScheduleCalendar';
import EventFormModal from './components/EventFormModal';
import LoginScreen from './components/LoginScreen';
import TeacherPortal from './components/TeacherPortal';
import AdminGradesView from './components/AdminGradesView';
import AdminTeacherReportsView from './components/AdminTeacherReportsView';
import InterestList from './components/InterestList';
import InterestFormModal from './components/InterestFormModal';
import { api } from './services/api';
import { syncLocalDataToCloud } from './services/syncData';
import { Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Core Data State
  const [students, setStudents] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [courses, setCourses] = useState({});
  const [events, setEvents] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teacherReports, setTeacherReports] = useState([]);
  const [sections, setSections] = useState([]);
  const [interests, setInterests] = useState([]);

  // UI State
  const [currentView, setCurrentView] = useState('students');
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = localStorage.getItem('isaek_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user) => {
    setLoggedInUser(user);
    localStorage.setItem('isaek_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('isaek_user');
  };

  // Fetch from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          s, sp, t, c, crs, e, a, g, tr, sec
        ] = await Promise.all([
          api.fetchStudents(), api.fetchSpecialties(), api.fetchTasks(),
          api.fetchContacts(), api.fetchCourses(), api.fetchEvents(),
          api.fetchAbsences(), api.fetchGrades(), api.fetchTeacherReports(),
          api.fetchSections(), api.fetchInterests()
        ]);
        
        setStudents(s);
        setSpecialties(sp);
        setTasks(t);
        setContacts(c);
        setCourses(crs);
        setEvents(e.map(ev => ({
          ...ev,
          start: ev.start_time ? new Date(ev.start_time) : new Date(),
          end: ev.end_time ? new Date(ev.end_time) : new Date()
        })));
        setAbsences(a);
        setGrades(g);
        setTeacherReports(tr);
        setSections(sec);
        setInterests(int);
      } catch (err) {
        console.error("Failed to load from Supabase:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    loadData();
  }, []);

  const handleSyncData = async () => {
    if (!window.confirm("Προσοχή: Αυτό θα μεταφέρει τα δεδομένα της τοπικής μνήμης στη βάση δεδομένων. Θέλετε να συνεχίσετε;")) return;
    setIsSyncing(true);
    try {
      await syncLocalDataToCloud();
      window.alert("Ο συγχρονισμός ολοκληρώθηκε! Παρακαλώ κάντε ανανέωση της σελίδας.");
    } catch (err) {
      window.alert("Σφάλμα κατά τον συγχρονισμό: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Extract distinct sectors
  const sectorsList = useMemo(() => {
    const sectors = new Set(specialties.map(s => s.sector));
    return Array.from(sectors);
  }, [specialties]);

  // Handle Sector click in sidebar
  const handleSectorSelect = (sector) => {
    setCurrentView('students');
    setSelectedSector(sector);
    setSelectedSpecialty('');
    setShowStartScreen(false); // Move to grid view
  };

  // Filter specialties dropdown based on selected sector
  const filteredSpecialtiesDropdown = useMemo(() => {
    if (!selectedSector) return specialties;
    return specialties.filter(s => s.sector === selectedSector);
  }, [specialties, selectedSector]);

  // Filter students based on search, sector, and specialty
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const spec = specialties.find(s => s.id === student.specialtyId);
      
      if (selectedSector && spec?.sector !== selectedSector) return false;
      if (selectedSpecialty && student.specialtyId !== selectedSpecialty) return false;

      if (searchQuery.trim() !== '') {
        const normalizeGreek = (str) => {
          if (!str) return '';
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        };
        const q = normalizeGreek(searchQuery.trim());
        
        const nameMatch = normalizeGreek(student.fullName).includes(q);
        const phoneMatch = student.phone ? student.phone.includes(q) : false;
        const amkaMatch = student.amka ? student.amka.includes(q) : false;
        const afmMatch = student.afm ? student.afm.includes(q) : false;
        const idMatch = student.idNumber ? normalizeGreek(student.idNumber).includes(q) : false;
        
        if (!nameMatch && !phoneMatch && !amkaMatch && !afmMatch && !idMatch) return false;
      }

      if (currentView === 'bek_graduates' && student.status !== 'bek_graduate') return false;
      if (currentView === 'students' && student.status === 'bek_graduate') return false;

      return true;
    });
  }, [students, specialties, selectedSector, selectedSpecialty, searchQuery, currentView]);

  // Calculated totals for statusbar
  const totals = useMemo(() => {
    const debt = filteredStudents.reduce((sum, s) => sum + parseFloat(s.totalDebt || 0), 0);
    return {
      count: filteredStudents.length,
      debt: debt
    };
  }, [filteredStudents]);

  // CRUD Operation Handlers
  const handleViewProfile = (student) => {
    setViewingStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleSaveGrades = (studentId, newGrades) => {
    setStudents((prev) => prev.map((s) => {
      if (s.id === studentId) {
        return { ...s, grades: newGrades };
      }
      return s;
    }));
  };

  const handleAddClick = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const confirmed = window.confirm(
      `Επιβεβαίωση Διαγραφής:\nΕίστε βέβαιοι ότι θέλετε να διαγράψετε τον/την σπουδαστή/στρια "${student.fullName}";`
    );

    if (confirmed) {
      try {
        await api.deleteStudent(studentId);
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
      } catch (e) {
        window.alert('Σφάλμα: ' + e.message);
      }
    }
  };

  const handleFormSubmit = async (studentData) => {
    try {
      if (studentData.id) {
        const saved = await api.upsertStudent(studentData);
        setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      } else {
        const newStudent = {
          ...studentData,
          id: `stud_${Date.now()}`
        };
        const saved = await api.upsertStudent(newStudent);
        setStudents((prev) => [saved, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  // Task CRUD Handlers
  const handleAddTaskClick = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = async (newTask) => {
    try {
      const saved = await api.upsertTask(newTask);
      setTasks((prev) => [saved, ...prev]);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const saved = await api.upsertTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  const handleTaskFormSubmit = async (taskData) => {
    try {
      if (taskData.id) {
        const saved = await api.upsertTask(taskData);
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      } else {
        const newTask = {
          ...taskData,
          id: `task_${Date.now()}`
        };
        const saved = await api.upsertTask(newTask);
        setTasks((prev) => [saved, ...prev]);
      }
      setIsTaskModalOpen(false);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  // Contact CRUD Handlers
  const handleAddContactClick = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContactClick = (contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.deleteContact(contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  const handleContactFormSubmit = async (contactData) => {
    try {
      if (contactData.id) {
        const saved = await api.upsertContact(contactData);
        setContacts((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      } else {
        const newContact = {
          ...contactData,
          id: `contact_${Date.now()}`
        };
        const saved = await api.upsertContact(newContact);
        setContacts((prev) => [saved, ...prev]);
      }
      setIsContactModalOpen(false);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  // Event CRUD Handlers
  const handleAddEventClick = (initialData = null) => {
    setEditingEvent(initialData);
    setIsEventModalOpen(true);
  };

  const handleEditEventClick = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το μάθημα/συμβάν;')) {
      try {
        await api.deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        setIsEventModalOpen(false);
      } catch (e) {
        window.alert('Σφάλμα: ' + e.message);
      }
    }
  };

  const handleEventFormSubmit = async (eventData) => {
    try {
      if (eventData.start) eventData.start_time = new Date(eventData.start).toISOString();
      if (eventData.end) eventData.end_time = new Date(eventData.end).toISOString();
      let eventToSave = { ...eventData };
      delete eventToSave.start;
      delete eventToSave.end;

      if (eventToSave.id) {
        const saved = await api.upsertEvent(eventToSave);
        setEvents((prev) => prev.map((e) => (e.id === saved.id ? {
          ...saved,
          start: saved.start_time ? new Date(saved.start_time) : new Date(),
          end: saved.end_time ? new Date(saved.end_time) : new Date()
        } : e)));
      } else {
        const newEvent = {
          ...eventToSave,
          id: `evt_${Date.now()}`
        };
        const saved = await api.upsertEvent(newEvent);
        setEvents((prev) => [...prev, {
          ...saved,
          start: saved.start_time ? new Date(saved.start_time) : new Date(),
          end: saved.end_time ? new Date(saved.end_time) : new Date()
        }]);
      }
      setIsEventModalOpen(false);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  // Interest CRUD Handlers
  const handleAddInterestClick = () => {
    setEditingInterest(null);
    setIsInterestModalOpen(true);
  };

  const handleEditInterestClick = (interest) => {
    setEditingInterest(interest);
    setIsInterestModalOpen(true);
  };

  const handleDeleteInterest = async (interestId) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την εκδήλωση ενδιαφέροντος;')) {
      try {
        await api.deleteInterest(interestId);
        setInterests((prev) => prev.filter((i) => i.id !== interestId));
      } catch (e) {
        window.alert('Σφάλμα: ' + e.message);
      }
    }
  };

  const handleInterestFormSubmit = async (interestData) => {
    try {
      if (interestData.id) {
        const saved = await api.upsertInterest(interestData);
        setInterests((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      } else {
        const newInterest = {
          ...interestData,
          id: `int_${Date.now()}`
        };
        const saved = await api.upsertInterest(newInterest);
        setInterests((prev) => [saved, ...prev]);
      }
      setIsInterestModalOpen(false);
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  // Convert Interest -> Student
  const handleConvertInterest = (interest) => {
    // Pre-fill student form with data from the interest record
    const prefilled = {
      lastName: interest.lastName || '',
      firstName: interest.firstName || '',
      phone: interest.phone || '',
      email: interest.email || '',
      specialtyId: interest.specialtyId || '',
      // Leave rest blank for secretary to fill in
      amka: '',
      afm: '',
      idNumber: '',
      year: '1ο Έτος',
      status: 'active',
      totalDebt: 0,
      hasInstallments: false,
      numberOfInstallments: 1,
      notes: `Μετατράπηκε από Εκδήλωση Ενδιαφέροντος. ${interest.comments ? 'Σχόλια: ' + interest.comments : ''}`.trim(),
    };
    setEditingStudent(prefilled);
    setIsModalOpen(true);
    // Navigate to students view so context is clear
    setCurrentView('students');
    setShowStartScreen(false);
  };

  // Helper menu links action
  const handleMenuHelp = () => {
    window.alert(
      "Γραμματεία ISAEK - Σύστημα Διαχείρισης Σπουδαστών\nΈκδοση 1.0.0 (Desktop Edition)\n\nΗ εφαρμογή εκκινεί με παράθυρο γρήγορης αναζήτησης για την προστασία των προσωπικών δεδομένων."
    );
  };

  const handleResetFilters = () => {
    setSelectedSector('');
    setSelectedSpecialty('');
    setSearchQuery('');
    setShowStartScreen(true);
  };

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' }}>
        <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <h2 style={{ color: '#1e293b', margin: 0 }}>Φόρτωση Δεδομένων...</h2>
        <p style={{ color: '#64748b' }}>Σύνδεση με Supabase Database</p>
      </div>
    );
  }

  if (!loggedInUser) {
    return <LoginScreen onLogin={handleLogin} contacts={contacts} />;
  }

  if (loggedInUser.role === 'teacher') {
    return (
      <TeacherPortal 
        teacher={loggedInUser}
        events={events}
        students={students}
        specialties={specialties}
        absences={absences}
        setAbsences={setAbsences}
        grades={grades}
        setGrades={setGrades}
        teacherReports={teacherReports}
        setTeacherReports={setTeacherReports}
        sections={sections}
        courses={courses}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="desktop-app">
      {/* 1. System Title Bar */}
      <div className="desktop-titlebar">
        <div className="window-title">
          <Database size={14} color="#2563eb" />
          <span>Γραμματεία ΙΣΑΕΚ - Διαχείριση Σπουδαστών (v1.0.0)</span>
        </div>
        <div className="window-controls">
          <button className="win-btn min" title="Ελαχιστοποίηση" />
          <button className="win-btn max" title="Μεγιστοποίηση" />
          <button className="win-btn close" title="Κλείσιμο" onClick={() => {
            if (window.confirm("Θέλετε να κλείσετε την εφαρμογή;")) window.close();
          }} />
        </div>
      </div>

      {/* 2. Software Menu Bar */}
      <div className="desktop-menubar" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          <div className={`menu-item ${showStartScreen ? 'active' : ''}`} onClick={() => setShowStartScreen(true)}>
            Αρχική (Αναζήτηση)
          </div>
          <div className="menu-item" onClick={handleAddClick}>Αρχείο (Νέος)</div>
          <div className="menu-item" onClick={handleResetFilters}>Επεξεργασία (Επαναφορά)</div>
          <div className="menu-item" onClick={handleMenuHelp}>Βοήθεια</div>
          <div className="menu-item" onClick={handleSyncData} style={{ color: '#3b82f6', fontWeight: 'bold' }}>
            {isSyncing ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite', marginRight: '4px', verticalAlign: 'middle' }} /> : <Database size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
            Συγχρονισμός (Cloud)
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div className="menu-item" onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 'bold' }}>
            <LogOut size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Αποσύνδεση
          </div>
        </div>
      </div>

      {/* 3. Horizontal Ribbon Toolbar (Only if NOT on Start Screen) */}
      {!showStartScreen && (
        <div className="desktop-toolbar">
          <div className="toolbar-group">
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563' }}>Αναζήτηση:</span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="text"
                className="sys-input"
                placeholder="Όνομα ή τηλέφωνο..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '220px', paddingLeft: '24px' }}
              />
              <Search size={12} color="#9ca3af" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563', marginLeft: '8px' }}>Ειδικότητα:</span>
            <select
              className="sys-input"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              style={{ width: '280px', cursor: 'pointer' }}
            >
              <option value="">Όλες οι Ειδικότητες {selectedSector ? `(${selectedSector})` : ''}</option>
              {filteredSpecialtiesDropdown.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.title}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar-group">
            <button 
              type="button" 
              className={`btn-sys ${showAnalytics ? 'active' : ''}`} 
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <BarChart4 size={14} />
              <span>{showAnalytics ? 'Απόκρυψη Στατιστικών' : 'Εμφάνιση Στατιστικών'}</span>
            </button>
            <button className="btn-sys primary" onClick={handleAddClick}>
              <UserPlus size={14} />
              <span>Εισαγωγή Σπουδαστή</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Split Pane Workspace OR Start Welcome Search Screen Overlay */}
      {showStartScreen ? (
        <div className="start-screen-overlay" style={{ backgroundColor: '#f1f5f9', padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header / Welcome Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ background: 'var(--primary)', color: '#fff', padding: '8px', borderRadius: '12px', display: 'inline-flex' }}>
                    <Home size={24} />
                  </span>
                  Γραμματεία ΙΕΚ
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Κεντρικό σύστημα ελέγχου και διαχείρισης</p>
              </div>
              
              {/* Central Search Form Group */}
              <div style={{ background: '#fff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', gap: '8px', width: '400px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className="sys-input"
                    placeholder="Αναζήτηση Σπουδαστή (Όνομα / Τηλ)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowStartScreen(false);
                        setCurrentView('students');
                      }
                    }}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}
                  />
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <button 
                  type="button" 
                  className="btn-sys primary"
                  onClick={() => {
                    setShowStartScreen(false);
                    setCurrentView('students');
                  }}
                  style={{ padding: '0 16px', borderRadius: '8px' }}
                >
                  Αναζήτηση
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ display: 'flex', gap: '12px', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <button className="premium-quick-btn" onClick={() => { setCurrentView('students'); setShowStartScreen(false); handleAddClick(); }}>
                <div className="btn-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><UserPlus size={20} /></div>
                <div className="btn-text">
                  <span>Νέος Σπουδαστής</span>
                  <small>Εγγραφή</small>
                </div>
              </button>
              
              <button className="premium-quick-btn" onClick={() => { setCurrentView('tasks'); setShowStartScreen(false); handleAddTaskClick(); }}>
                <div className="btn-icon" style={{ background: '#fef3c7', color: '#d97706' }}><CheckSquare size={20} /></div>
                <div className="btn-text">
                  <span>Νέα Εργασία</span>
                  <small>Εκκρεμότητα</small>
                </div>
              </button>
              
              <button className="premium-quick-btn" onClick={() => { setCurrentView('calendar'); setShowStartScreen(false); handleAddEventClick(); }}>
                <div className="btn-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}><CalendarIcon size={20} /></div>
                <div className="btn-text">
                  <span>Νέο Μάθημα</span>
                  <small>Ημερολόγιο</small>
                </div>
              </button>

              <div style={{ width: '1px', background: '#e2e8f0', margin: '0 8px' }}></div>

              <button className="premium-quick-btn" onClick={() => { setCurrentView('contacts'); setShowStartScreen(false); handleAddContactClick(); }}>
                <div className="btn-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Phone size={20} /></div>
                <div className="btn-text">
                  <span>Νέα Επαφή</span>
                  <small>Κατάλογος</small>
                </div>
              </button>
              
              <button className="premium-quick-btn" onClick={() => { setCurrentView('interests'); setShowStartScreen(false); handleAddInterestClick(); }}>
                <div className="btn-icon" style={{ background: '#fce7f3', color: '#db2777' }}><MessageSquare size={20} /></div>
                <div className="btn-text">
                  <span>Νέο Ενδιαφέρον</span>
                  <small>Καταγραφή</small>
                </div>
              </button>
              
              <button className="premium-quick-btn" onClick={() => { setCurrentView('grades'); setShowStartScreen(false); }}>
                <div className="btn-icon" style={{ background: '#ffedd5', color: '#ea580c' }}><FileText size={20} /></div>
                <div className="btn-text">
                  <span>Βαθμολογίες</span>
                  <small>Εκπαιδευτών</small>
                </div>
              </button>
              
              <button className="premium-quick-btn" onClick={() => { setCurrentView('settings'); setShowStartScreen(false); }}>
                <div className="btn-icon" style={{ background: '#f1f5f9', color: '#475569' }}><Settings size={20} /></div>
                <div className="btn-text">
                  <span>Ρυθμίσεις</span>
                  <small>Διαχείριση</small>
                </div>
              </button>
            </div>

            {/* Main Content Grid: Dashboard & Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
              
              {/* Left Side: Stats and Overview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart4 size={20} color="var(--primary)" />
                    Συνολική Στατιστική Εικόνα
                  </h2>
                  <DashboardStats 
                    students={students} 
                    specialties={specialties} 
                    sections={sections}
                    teacherReports={teacherReports}
                  />
                </div>
                
                {/* Modules Navigation Box */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                   <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOpen size={20} color="var(--primary)" />
                    Πρόσβαση στο Σύστημα
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button className="nav-module-card" onClick={() => { setCurrentView('students'); setShowStartScreen(false); }}>
                      <Database size={24} color="#3b82f6" />
                      <div>
                        <h3>Βάση Σπουδαστών</h3>
                        <p>Προβολή & φίλτρα εγγραφών</p>
                      </div>
                    </button>
                    <button className="nav-module-card" onClick={() => { setCurrentView('tasks'); setShowStartScreen(false); }}>
                      <CheckSquare size={24} color="#f59e0b" />
                      <div>
                        <h3>Εργασίες (Kanban)</h3>
                        <p>Διαχείριση εκκρεμοτήτων</p>
                      </div>
                    </button>
                    <button className="nav-module-card" onClick={() => { setCurrentView('calendar'); setShowStartScreen(false); }}>
                      <CalendarIcon size={24} color="#8b5cf6" />
                      <div>
                        <h3>Πρόγραμμα Μαθημάτων</h3>
                        <p>Εβδομαδιαίο ημερολόγιο</p>
                      </div>
                    </button>
                    <button className="nav-module-card" onClick={() => { setCurrentView('contacts'); setShowStartScreen(false); }}>
                      <BookOpen size={24} color="#10b981" />
                      <div>
                        <h3>Κατάλογος Επαφών</h3>
                        <p>Τηλέφωνα & Συνεργάτες</p>
                      </div>
                    </button>
                    <button className="nav-module-card" onClick={() => { setCurrentView('grades'); setShowStartScreen(false); }}>
                      <FileText size={24} color="#ea580c" />
                      <div>
                        <h3>Βαθμολογίες</h3>
                        <p>Έλεγχος επίδοσης</p>
                      </div>
                    </button>
                    <button className="nav-module-card" onClick={() => { setCurrentView('interests'); setShowStartScreen(false); }}>
                      <MessageSquare size={24} color="#db2777" />
                      <div>
                        <h3>Εκδηλώσεις Ενδιαφέροντος</h3>
                        <p>Λίστα ενδιαφερομένων</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Today's Schedule */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarIcon size={20} color="#ec4899" />
                  Σημερινό Πρόγραμμα
                  <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '500', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                    {new Date().toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </h2>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }} className="custom-scrollbar">
                  {(() => {
                    const today = new Date();
                    const todayEvents = events.filter(ev => 
                      ev.start.getFullYear() === today.getFullYear() &&
                      ev.start.getMonth() === today.getMonth() &&
                      ev.start.getDate() === today.getDate()
                    ).sort((a, b) => a.start - b.start);

                    if (todayEvents.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                          <CalendarIcon size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
                          <p style={{ margin: 0 }}>Δεν υπάρχουν προγραμματισμένα μαθήματα για σήμερα.</p>
                        </div>
                      );
                    }

                    return todayEvents.map(ev => {
                      const spec = specialties.find(s => s.id === ev.specialtyId);
                      const instructor = contacts.find(c => c.id === ev.instructorId);
                      return (
                        <div key={ev.id} style={{ borderLeft: `4px solid ${ev.color || '#3b82f6'}`, background: '#f8fafc', padding: '16px', borderRadius: '8px', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{ev.title}</div>
                            <div style={{ background: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#475569', border: '1px solid #e2e8f0', display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <Clock size={12} />
                              {ev.start.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })} - {ev.end.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                            {spec && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BookOpen size={14} color="#94a3b8" />
                                {spec.title}
                              </div>
                            )}
                            {instructor && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <UserPlus size={14} color="#94a3b8" /> {/* Fallback icon, real User icon missing in imports at top but let's assume it's there or just use UserPlus */}
                                {instructor.name}
                              </div>
                            )}
                            {ev.room && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} color="#94a3b8" />
                                {ev.room}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      ) : (
        <div className="desktop-workspace">
          {/* Left Tree/Sidebar */}
          <div className="desktop-sidebar">
            <h4 className="sidebar-title">Μενού Πλοήγησης</h4>
            <ul className="sector-list" style={{ marginBottom: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
              <li 
                className="sector-item"
                onClick={() => {
                  setShowStartScreen(true);
                  setCurrentView('students');
                }}
                style={{ marginBottom: '4px' }}
              >
                <Home size={14} color="var(--primary)" />
                <span>Αρχική Οθόνη</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'students' && selectedSector === '' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('students');
                  setSelectedSector('');
                  setSelectedSpecialty('');
                  setShowStartScreen(false);
                }}
              >
                <Database size={14} />
                <span>Βάση Σπουδαστών</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'bek_graduates' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('bek_graduates');
                  setSelectedSector('');
                  setSelectedSpecialty('');
                  setShowStartScreen(false);
                }}
              >
                <GraduationCap size={14} />
                <span>Απόφοιτοι ΒΕΚ</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('tasks');
                  setShowStartScreen(false);
                }}
              >
                <CheckSquare size={14} />
                <span>Εργασίες (Kanban)</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'contacts' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('contacts');
                  setShowStartScreen(false);
                }}
              >
                <BookOpen size={14} />
                <span>Τηλεφωνικός Κατάλογος</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('calendar');
                  setShowStartScreen(false);
                }}
              >
                <CalendarIcon size={14} />
                <span>Ημερολόγιο (Πρόγραμμα)</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'teacher_reports' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('teacher_reports');
                  setShowStartScreen(false);
                }}
              >
                <FileText size={14} />
                <span>Αναφορές Καθηγητών</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'grades' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('grades');
                  setShowStartScreen(false);
                }}
              >
                <FileText size={14} />
                <span>Βαθμολογίες</span>
              </li>
              <li 
                className={`sector-item ${currentView === 'interests' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('interests');
                  setShowStartScreen(false);
                }}
              >
                <MessageSquare size={14} />
                <span>Εκδηλώσεις Ενδιαφέροντος</span>
              </li>
            </ul>

            <h4 className="sidebar-title">Διαχείριση Συστήματος</h4>
            <ul className="sector-list">
              <li 
                className={`sector-item ${currentView === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('settings');
                  setShowStartScreen(false);
                }}
                title="Ρυθμίσεις Τομέων, Ειδικοτήτων & Μαθημάτων"
              >
                <Settings size={14} color="#64748b" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Εργαλεία Διαχειριστή</span>
              </li>
            </ul>
          </div>

          {/* Right workspace content pane */}
          {currentView === 'students' && (
            <div className="desktop-content">
              <div className="grid-header">
                <span className="grid-title">
                  Βάση Δεδομένων Σπουδαστών {selectedSector ? `» ${selectedSector}` : '» Όλοι οι Τομείς'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Εμφανίζονται {filteredStudents.length} εγγραφές
                </span>
              </div>

              {/* Key Metrics Widgets & Analytics Chart Panel */}
              {showAnalytics && (
                <DashboardStats 
                  students={students} 
                  specialties={specialties} 
                  sections={sections}
                  teacherReports={teacherReports}
                />
              )}

              <div className="desktop-grid-container">
                <StudentTable
                  students={filteredStudents}
                  specialties={specialties}
                  onViewProfile={handleViewProfile}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </div>
            </div>
          )}

          {currentView === 'bek_graduates' && (
            <div className="desktop-content">
              <div className="grid-header">
                <span className="grid-title">
                  Απόφοιτοι ΒΕΚ {selectedSector ? `» ${selectedSector}` : '» Όλοι οι Τομείς'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Εμφανίζονται {filteredStudents.length} απόφοιτοι
                </span>
              </div>
              <div className="desktop-grid-container">
                <StudentTable
                  students={filteredStudents}
                  specialties={specialties}
                  onViewProfile={handleViewProfile}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  isBekView={true}
                />
              </div>
            </div>
          )}

          {currentView === 'tasks' && (
            <div className="desktop-content">
              <TaskBoard 
                tasks={tasks}
                onAddTaskClick={handleAddTaskClick}
                onEditTaskClick={handleEditTaskClick}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}

          {currentView === 'contacts' && (
            <div className="desktop-content">
              <ContactDirectory
                contacts={contacts}
                specialties={specialties}
                onAddContactClick={handleAddContactClick}
                onEditContactClick={handleEditContactClick}
                onDeleteContact={handleDeleteContact}
              />
            </div>
          )}

          {currentView === 'interests' && (
            <div className="desktop-content" style={{ padding: '12px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Εκδηλώσεις Ενδιαφέροντος</h2>
                <button className="btn-sys primary" onClick={handleAddInterestClick}>
                  <Plus size={14} />
                  Νέα Εκδήλωση
                </button>
              </div>
              <InterestList
                interests={interests}
                specialties={specialties}
                onEdit={handleEditInterestClick}
                onDelete={handleDeleteInterest}
                onConvert={handleConvertInterest}
              />
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="desktop-content" style={{ padding: '12px' }}>
              <ScheduleCalendar
                events={events}
                specialties={specialties}
                onAddEvent={handleAddEventClick}
                onEditEvent={handleEditEventClick}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          )}

          {currentView === 'teacher_reports' && (
            <div className="desktop-content" style={{ padding: '12px', background: '#f8fafc' }}>
              <AdminTeacherReportsView 
                reports={teacherReports}
                students={students}
                specialties={specialties}
              />
            </div>
          )}

          {currentView === 'grades' && (
            <div className="desktop-content" style={{ padding: '12px', background: '#f8fafc' }}>
              <AdminGradesView 
                students={students}
                specialties={specialties}
                grades={grades}
                courses={courses}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="desktop-content" style={{ padding: 0 }}>
              <SpecialtyManager 
                specialties={specialties}
                setSpecialties={setSpecialties}
                courses={courses}
                setCourses={setCourses}
                sections={sections}
                setSections={setSections}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom Status Bar */}
      <div className="desktop-statusbar">
        <div className="statusbar-pane">
          <span>Κατάσταση: Έτοιμο</span>
        </div>
        <div className="statusbar-pane">
          <span>Σπουδαστές: <strong>{totals.count}</strong></span>
          <span>Συνολικές Οφειλές: <strong>{totals.debt.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</strong></span>
        </div>
      </div>

      {/* Form Dialog Box Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        student={editingStudent}
        specialties={specialties}
        sections={sections}
      />

      {/* Student Profile (Grades & Absences) Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={viewingStudent}
        specialties={specialties}
        courses={courses}
        grades={grades}
        absences={absences}
        onSaveGrades={handleSaveGrades}
      />

      {/* Task Form Dialog Box Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskFormSubmit}
        task={editingTask}
      />

      {/* Contact Form Dialog Box Modal */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleContactFormSubmit}
        contact={editingContact}
        specialties={specialties}
      />

      {/* Event Form Dialog Box Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventFormSubmit}
        onDelete={handleDeleteEvent}
        event={editingEvent}
        specialties={specialties}
        courses={courses}
        contacts={contacts}
      />

      {/* Interest Form Dialog Box Modal */}
      <InterestFormModal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        onSubmit={handleInterestFormSubmit}
        interest={editingInterest}
        specialties={specialties}
      />
    </div>
  );
}
