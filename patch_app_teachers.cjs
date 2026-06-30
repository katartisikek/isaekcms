const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Import TeacherDirectory
const importRegex = /import ContactDirectory from '.\/components\/ContactDirectory';/;
content = content.replace(importRegex, "import ContactDirectory from './components/ContactDirectory';\nimport TeacherDirectory from './components/TeacherDirectory';");

// 2. Add 'teachers' tab
const bekTabRegex = /<li \s*className=\{`sector-item \$\{currentView === 'bek_graduates' \? 'active' : ''\}`\}\s*onClick=\{\(\) => \{\s*setCurrentView\('bek_graduates'\);\s*setSelectedSector\(''\);\s*setSelectedSpecialty\(''\);\s*setShowStartScreen\(false\);\s*\}\}\s*>\s*<GraduationCap size=\{14\} \/>\s*<span>Απόφοιτοι ΒΕΚ<\/span>\s*<\/li>/;

const teacherTabStr = `<li 
                className={\`sector-item \${currentView === 'teachers' ? 'active' : ''}\`}
                onClick={() => {
                  setCurrentView('teachers');
                  setSelectedSector('');
                  setSelectedSpecialty('');
                  setShowStartScreen(false);
                }}
              >
                <User size={14} />
                <span>Καθηγητές</span>
              </li>`;

// We also need to import `User` from lucide-react if it's not imported.
// It seems `App.jsx` imports many lucide icons.
// Let's check imports first.
content = content.replace(/\\n\} from 'lucide-react';/, ", User\\n} from 'lucide-react';");

const bekMatch = content.match(/<li \s*className=\{`sector-item \$\{currentView === 'bek_graduates'.*?<\/li>/s);
if (bekMatch) {
  content = content.replace(bekMatch[0], bekMatch[0] + '\n              ' + teacherTabStr);
}

// 3. Render TeacherDirectory when currentView === 'teachers'
const renderContactsRegex = /\{currentView === 'contacts' && \([\s\S]*?<\/div>\s*\)\}/;
const renderTeachersStr = `{currentView === 'teachers' && (
            <div className="desktop-content">
              <TeacherDirectory
                contacts={contacts.filter(c => c.role === 'Καθηγητής' || c.category === 'Εκπαιδευτής')}
                specialties={specialties}
                courses={courses}
                onAddContactClick={handleAddContactClick}
                onEditContactClick={handleEditContactClick}
                onDeleteContact={handleDeleteContact}
              />
            </div>
          )}`;

const renderContactsMatch = content.match(renderContactsRegex);
if (renderContactsMatch) {
  content = content.replace(renderContactsMatch[0], renderContactsMatch[0] + '\n\n          ' + renderTeachersStr);
}

// 4. Filter ContactDirectory to exclude teachers
const contactsPropRegex = /contacts=\{contacts\}/;
content = content.replace(
  /<ContactDirectory\s+contacts=\{contacts\}/,
  "<ContactDirectory\n                contacts={contacts.filter(c => c.role !== 'Καθηγητής' && c.category !== 'Εκπαιδευτής')}"
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx patched successfully!');
