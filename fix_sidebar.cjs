const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Lines 865-980 (0-indexed: 864-979)
const startIdx = 864;
const endIdx = 979;

const newSidebar = `          {/* Left Tree/Sidebar */}
          <div className="desktop-sidebar">
            <h4 className="sidebar-title">\u039c\u03b5\u03bd\u03bf\u03cd \u03a0\u03bb\u03bf\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2</h4>
            {(() => {
              const pendingTasksCount = tasks.filter(t => t.status === '\u0395\u03ba\u03ba\u03c1\u03b5\u03bc\u03b5\u03af').length;
              const debtStudentsCount = students.filter(s => parseFloat(s.totalDebt || 0) > 0).length;
              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              const newInterestsCount = interests.filter(i => i.createdAt && new Date(i.createdAt) > sevenDaysAgo).length;
              return (
                <ul className="sector-list" style={{ marginBottom: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                  <li className="sector-item" style={{ marginBottom: '4px' }} onClick={() => { setShowStartScreen(true); setCurrentView('students'); }}>
                    <Home size={14} color="var(--primary)" /><span>\u0391\u03c1\u03c7\u03b9\u03ba\u03ae \u039f\u03b8\u03cc\u03bd\u03b7</span>
                  </li>
                  <li className={\`sector-item \${currentView === 'students' && selectedSector === '' ? 'active' : ''}\`} onClick={() => { setCurrentView('students'); setSelectedSector(''); setSelectedSpecialty(''); setShowStartScreen(false); }}>
                    <Database size={14} /><span>\u0392\u03ac\u03c3\u03b7 \u03a3\u03c0\u03bf\u03c5\u03b4\u03b1\u03c3\u03c4\u03ce\u03bd</span>
                    {debtStudentsCount > 0 && <span style={{ marginLeft:'auto', background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:'700', borderRadius:'10px', padding:'1px 6px' }} title={debtStudentsCount + ' \u03bc\u03b5 \u03bf\u03c6\u03b5\u03b9\u03bb\u03ad\u03c2'}>{debtStudentsCount}</span>}
                  </li>
                  <li className={\`sector-item \${currentView === 'bek_graduates' ? 'active' : ''}\`} onClick={() => { setCurrentView('bek_graduates'); setSelectedSector(''); setSelectedSpecialty(''); setShowStartScreen(false); }}>
                    <GraduationCap size={14} /><span>\u0391\u03c0\u03cc\u03c6\u03bf\u03b9\u03c4\u03bf\u03b9 \u0392\u0395\u039a</span>
                  </li>
                  <li className={\`sector-item \${currentView === 'tasks' ? 'active' : ''}\`} onClick={() => { setCurrentView('tasks'); setShowStartScreen(false); }}>
                    <CheckSquare size={14} /><span>\u0395\u03c1\u03b3\u03b1\u03c3\u03af\u03b5\u03c2 (Kanban)</span>
                    {pendingTasksCount > 0 && <span style={{ marginLeft:'auto', background:'#fee2e2', color:'#991b1b', fontSize:'11px', fontWeight:'700', borderRadius:'10px', padding:'1px 6px' }} title={pendingTasksCount + ' \u03b5\u03ba\u03ba\u03c1\u03b5\u03bc\u03b5\u03af\u03c2'}>{pendingTasksCount}</span>}
                  </li>
                  <li className={\`sector-item \${currentView === 'contacts' ? 'active' : ''}\`} onClick={() => { setCurrentView('contacts'); setShowStartScreen(false); }}>
                    <BookOpen size={14} /><span>\u03a4\u03b7\u03bb\u03b5\u03c6\u03c9\u03bd\u03b9\u03ba\u03cc\u03c2 \u039a\u03b1\u03c4\u03ac\u03bb\u03bf\u03b3\u03bf\u03c2</span>
                  </li>
                  <li className={\`sector-item \${currentView === 'calendar' ? 'active' : ''}\`} onClick={() => { setCurrentView('calendar'); setShowStartScreen(false); }}>
                    <CalendarIcon size={14} /><span>\u0397\u03bc\u03b5\u03c1\u03bf\u03bb\u03cc\u03b3\u03b9\u03bf (\u03a0\u03c1\u03cc\u03b3\u03c1\u03b1\u03bc\u03bc\u03b1)</span>
                  </li>
                  <li className={\`sector-item \${currentView === 'teacher_reports' ? 'active' : ''}\`} onClick={() => { setCurrentView('teacher_reports'); setShowStartScreen(false); }}>
                    <FileText size={14} /><span>\u0391\u03bd\u03b1\u03c6\u03bf\u03c1\u03ad\u03c2 \u039a\u03b1\u03b8\u03b7\u03b3\u03b7\u03c4\u03ce\u03bd</span>
                  </li>
                  <li className={\`sector-item \${currentView === 'grades' ? 'active' : ''}\`} onClick={() => { setCurrentView('grades'); setShowStartScreen(false); }}>
                    <FileText size={14} /><span>\u0392\u03b1\u03b8\u03bc\u03bf\u03bb\u03bf\u03b3\u03af\u03b5\u03c2</span>
                  </li>
                  <li className={\`sector-item \${currentView === 'interests' ? 'active' : ''}\`} onClick={() => { setCurrentView('interests'); setShowStartScreen(false); }}>
                    <MessageSquare size={14} /><span>\u0395\u03ba\u03b4\u03b7\u03bb\u03ce\u03c3\u03b5\u03b9\u03c2 \u0395\u03bd\u03b4\u03b9\u03b1\u03c6\u03ad\u03c1\u03bf\u03bd\u03c4\u03bf\u03c2</span>
                    {newInterestsCount > 0 && <span style={{ marginLeft:'auto', background:'#fce7f3', color:'#9d174d', fontSize:'11px', fontWeight:'700', borderRadius:'10px', padding:'1px 6px' }} title={newInterestsCount + ' \u03bd\u03ad\u03b5\u03c2 (7 \u03b7\u03bc\u03ad\u03c1\u03b5\u03c2)'}>{newInterestsCount}</span>}
                  </li>
                </ul>
              );
            })()}
            <h4 className="sidebar-title">\u0394\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7 \u03a3\u03c5\u03c3\u03c4\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2</h4>
            <ul className="sector-list">
              <li className={\`sector-item \${currentView === 'settings' ? 'active' : ''}\`} onClick={() => { setCurrentView('settings'); setShowStartScreen(false); }}>
                <Settings size={14} color="#64748b" /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>\u0395\u03c1\u03b3\u03b1\u03bb\u03b5\u03af\u03b1 \u0394\u03b9\u03b1\u03c7\u03b5\u03b9\u03c1\u03b9\u03c3\u03c4\u03ae</span>
              </li>
              <li className={\`sector-item \${currentView === 'audit_log' ? 'active' : ''}\`} onClick={() => { setCurrentView('audit_log'); setShowStartScreen(false); }}>
                <FileText size={14} color="#64748b" /><span>\u0399\u03c3\u03c4\u03bf\u03c1\u03b9\u03ba\u03cc \u0391\u03bb\u03bb\u03b1\u03b3\u03ce\u03bd</span>
              </li>
            </ul>
          </div>`;

const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx);
const result = [...before, ...newSidebar.split('\n'), ...after];
fs.writeFileSync(filePath, result.join('\n'), 'utf8');
console.log('Sidebar replaced successfully. Total lines: ' + result.length);
