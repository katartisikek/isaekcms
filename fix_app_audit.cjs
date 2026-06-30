const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the duplicate `</div>` on line 918 introduced by fix_sidebar.
content = content.replace('          </div>\n          </div>\n\n          {/* Right workspace content pane */}', '          </div>\n\n          {/* Right workspace content pane */}');

// 2. Add imports
const importsTarget = "import InterestFormModal from './components/InterestFormModal';";
const importsReplacement = "import InterestFormModal from './components/InterestFormModal';\nimport AuditLogView from './components/AuditLogView';";
content = content.replace(importsTarget, importsReplacement);

// 3. Render AuditLogView
const renderTarget = "{currentView === 'interests' && (\n            <div className=\"desktop-content\">";
const renderReplacement = "{currentView === 'interests' && (\n            <div className=\"desktop-content\">";
// Wait, the interests render block ends with `)}` before calendar. Let's find exactly the spot before calendar.
const renderPointTarget = "          {currentView === 'calendar' && (";
const renderPointReplacement = "          {currentView === 'audit_log' && (\n            <AuditLogView />\n          )}\n\n          {currentView === 'calendar' && (";
content = content.replace(renderPointTarget, renderPointReplacement);

// 4. handleDeleteClick
const delStudTarget = "await api.deleteStudent(studentId);\n        setStudents((prev) => prev.filter((s) => s.id !== studentId));";
const delStudRepl = "await api.deleteStudent(studentId);\n        setStudents((prev) => prev.filter((s) => s.id !== studentId));\n        await api.logAction('DELETE', 'student', student.fullName, loggedInUser?.username || 'Unknown');";
content = content.replace(delStudTarget, delStudRepl);

// 5. handleFormSubmit
const upStudTarget = "const saved = await api.upsertStudent(studentData);\n        setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));";
const upStudRepl = "const saved = await api.upsertStudent(studentData);\n        setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));\n        await api.logAction('UPDATE', 'student', saved.fullName, loggedInUser?.username || 'Unknown');";
content = content.replace(upStudTarget, upStudRepl);

const newStudTarget = "const saved = await api.upsertStudent(newStudent);\n        setStudents((prev) => [saved, ...prev]);";
const newStudRepl = "const saved = await api.upsertStudent(newStudent);\n        setStudents((prev) => [saved, ...prev]);\n        await api.logAction('CREATE', 'student', saved.fullName, loggedInUser?.username || 'Unknown');";
content = content.replace(newStudTarget, newStudRepl);

// 6. handleDeleteInterest
const delIntTarget = "await api.deleteInterest(interestId);\n        setInterests((prev) => prev.filter((i) => i.id !== interestId));";
const delIntRepl = "const interest = interests.find(i => i.id === interestId);\n        await api.deleteInterest(interestId);\n        setInterests((prev) => prev.filter((i) => i.id !== interestId));\n        if (interest) await api.logAction('DELETE', 'interest', `${interest.lastName} ${interest.firstName}`, loggedInUser?.username || 'Unknown');";
content = content.replace(delIntTarget, delIntRepl);

// 7. handleInterestFormSubmit
const upIntTarget = "const saved = await api.upsertInterest(interestData);\n        setInterests((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));";
const upIntRepl = "const saved = await api.upsertInterest(interestData);\n        setInterests((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));\n        await api.logAction('UPDATE', 'interest', `${saved.lastName} ${saved.firstName}`, loggedInUser?.username || 'Unknown');";
content = content.replace(upIntTarget, upIntRepl);

const newIntTarget = "const saved = await api.upsertInterest(newInterest);\n        setInterests((prev) => [saved, ...prev]);";
const newIntRepl = "const saved = await api.upsertInterest(newInterest);\n        setInterests((prev) => [saved, ...prev]);\n        await api.logAction('CREATE', 'interest', `${saved.lastName} ${saved.firstName}`, loggedInUser?.username || 'Unknown');";
content = content.replace(newIntTarget, newIntRepl);

// 8. handleConvertInterest
const convertTarget = "const handleConvertInterest = (interest) => {\n    // Pre-fill student form";
const convertRepl = "const handleConvertInterest = (interest) => {\n    api.logAction('CONVERT', 'interest', `${interest.lastName} ${interest.firstName}`, loggedInUser?.username || 'Unknown', 'Μετατροπή σε σπουδαστή');\n    // Pre-fill student form";
content = content.replace(convertTarget, convertRepl);


fs.writeFileSync(filePath, content, 'utf8');
console.log("App.jsx audit log injections applied.");
