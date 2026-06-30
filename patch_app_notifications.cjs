const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Imports
content = content.replace(
  /LogOut, Calendar as CalendarIcon, Clock, MapPin, FileText, GraduationCap, MessageSquare/g,
  "LogOut, Calendar as CalendarIcon, Clock, MapPin, FileText, GraduationCap, MessageSquare, Bell, AlertTriangle"
);

// 2. State & useMemo
const stateRegex = /const \[searchQuery, setSearchQuery\] = useState\(''\);/;
const stateReplacement = `const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Smart Notifications Logic
  const notifications = useMemo(() => {
    const alerts = [];
    
    // 1. Pending Tasks
    const pendingTasks = tasks.filter(t => t.status === 'Εκκρεμεί');
    if (pendingTasks.length > 0) {
      alerts.push({ 
        id: 'tasks', 
        type: 'warning', 
        title: 'Εκκρεμείς Εργασίες',
        message: \`Έχετε \${pendingTasks.length} εκκρεμείς εργασίες (Kanban) που χρειάζονται προσοχή.\`, 
        icon: <CheckSquare size={16} /> 
      });
    }

    // 2. New Interests
    const recentInterests = interests.filter(i => {
      if (!i.createdAt) return false;
      const days = (new Date() - new Date(i.createdAt)) / (1000 * 60 * 60 * 24);
      return days <= 7;
    });
    if (recentInterests.length > 0) {
      alerts.push({ 
        id: 'interests', 
        type: 'info', 
        title: 'Νέες Εκδηλώσεις Ενδιαφέροντος',
        message: \`Καταχωρήθηκαν \${recentInterests.length} εκδηλώσεις ενδιαφέροντος τις τελευταίες 7 ημέρες.\`, 
        icon: <MessageSquare size={16} /> 
      });
    }

    // 3. Students with Debt
    const debtors = students.filter(s => parseFloat(s.totalDebt || 0) > 0);
    if (debtors.length > 0) {
      alerts.push({ 
        id: 'debt', 
        type: 'error', 
        title: 'Οφειλές Σπουδαστών',
        message: \`Υπάρχουν \${debtors.length} σπουδαστές με ανεξόφλητα υπόλοιπα.\`, 
        icon: <AlertTriangle size={16} /> 
      });
    }

    return alerts;
  }, [tasks, interests, students]);`;
content = content.replace(stateRegex, stateReplacement);

// 3. Render Menu Item
const menuRegex = /<div style=\{\{ display: 'flex' \}\}>\s*<div className="menu-item" onClick=\{handleLogout\} style=\{\{ color: '#ef4444', fontWeight: 'bold' \}\}>/g;
const menuReplacement = `<div style={{ display: 'flex', alignItems: 'center' }}>
          
          {/* Notifications Bell */}
          <div className="menu-item" style={{ position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Ειδοποιήσεις
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            
            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">
                  <span>Ειδοποιήσεις Γραμματείας</span>
                  {notifications.length > 0 && (
                    <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '12px' }}>{notifications.length} Νέες</span>
                  )}
                </div>
                
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <Bell size={24} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                      Δεν υπάρχουν νέες ειδοποιήσεις
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="notification-item">
                        <div className={\`notification-icon \${notif.type}\`}>
                          {notif.icon}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notif.title}</div>
                          <div className="notification-message">{notif.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="menu-item" onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 'bold' }}>`;
content = content.replace(menuRegex, menuReplacement);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx patched successfully!');
