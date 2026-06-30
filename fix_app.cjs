const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Looking for:
// <button 
//   type="button" 
//   <span>Νέα Εργασία</span>

const regex = /<button\s*type="button"\s*<span>Νέα Εργασία<\/span>\s*<small>Εκκρεμότητα<\/small>\s*<\/div>\s*<\/button>/g;

const fixedPart = `<button 
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
              </button>`;

if (regex.test(content)) {
    content = content.replace(regex, fixedPart);
    fs.writeFileSync('src/App.jsx', content, 'utf8');
    console.log('Fixed successfully with regex');
} else {
    console.log('Could not find the broken part even with regex.');
}
