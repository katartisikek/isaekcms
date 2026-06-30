const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix duplicate div
const badSidebarEnd = '            </ul>\n          </div>\n          </div>\n\n          {/* Right workspace content pane */}';
const goodSidebarEnd = '            </ul>\n          </div>\n\n          {/* Right workspace content pane */}';
if (content.includes(badSidebarEnd)) {
    content = content.replace(badSidebarEnd, goodSidebarEnd);
}

// Add imports
const importsTarget = "import InterestFormModal from './components/InterestFormModal';";
const importsReplacement = "import InterestFormModal from './components/InterestFormModal';\nimport AuditLogView from './components/AuditLogView';";
if (!content.includes('import AuditLogView')) {
    content = content.replace(importsTarget, importsReplacement);
}

// Render AuditLogView
const renderPointTarget = "          {currentView === 'calendar' && (";
const renderPointReplacement = "          {currentView === 'audit_log' && (\n            <AuditLogView />\n          )}\n\n          {currentView === 'calendar' && (";
if (!content.includes("{currentView === 'audit_log' && (")) {
    content = content.replace(renderPointTarget, renderPointReplacement);
}

// handleDeleteClick
const delStudTarget = "await api.deleteStudent(studentId);\n        setStudents((prev) => prev.filter((s) => s.id !== studentId));";
const delStudRepl = "await api.deleteStudent(studentId);\n        setStudents((prev) => prev.filter((s) => s.id !== studentId));\n        await api.logAction('DELETE', 'student', student.fullName, loggedInUser?.username || 'Unknown');";
if (!content.includes("'DELETE', 'student'")) {
    content = content.replace(delStudTarget, delStudRepl);
}

// handleFormSubmit (update and create)
const upStudTarget = "const saved = await api.upsertStudent(studentData);\n        setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));";
const upStudRepl = "const saved = await api.upsertStudent(studentData);\n        setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));\n        await api.logAction('UPDATE', 'student', saved.fullName, loggedInUser?.username || 'Unknown');";
if (!content.includes("'UPDATE', 'student'")) {
    content = content.replace(upStudTarget, upStudRepl);
}

const newStudTarget = "const saved = await api.upsertStudent(newStudent);\n        setStudents((prev) => [saved, ...prev]);";
const newStudRepl = "const saved = await api.upsertStudent(newStudent);\n        setStudents((prev) => [saved, ...prev]);\n        await api.logAction('CREATE', 'student', saved.fullName, loggedInUser?.username || 'Unknown');";
if (!content.includes("'CREATE', 'student'")) {
    content = content.replace(newStudTarget, newStudRepl);
}

// handleDeleteInterest
const delIntTarget = "await api.deleteInterest(interestId);\n        setInterests((prev) => prev.filter((i) => i.id !== interestId));";
const delIntRepl = "const interest = interests.find(i => i.id === interestId);\n        await api.deleteInterest(interestId);\n        setInterests((prev) => prev.filter((i) => i.id !== interestId));\n        if (interest) await api.logAction('DELETE', 'interest', `${interest.lastName} ${interest.firstName}`, loggedInUser?.username || 'Unknown');";
if (!content.includes("'DELETE', 'interest'")) {
    content = content.replace(delIntTarget, delIntRepl);
}

// handleInterestFormSubmit
const upIntTarget = "const saved = await api.upsertInterest(interestData);\n        setInterests((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));";
const upIntRepl = "const saved = await api.upsertInterest(interestData);\n        setInterests((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));\n        await api.logAction('UPDATE', 'interest', `${saved.lastName} ${saved.firstName}`, loggedInUser?.username || 'Unknown');";
if (!content.includes("'UPDATE', 'interest'")) {
    content = content.replace(upIntTarget, upIntRepl);
}

const newIntTarget = "const saved = await api.upsertInterest(newInterest);\n        setInterests((prev) => [saved, ...prev]);";
const newIntRepl = "const saved = await api.upsertInterest(newInterest);\n        setInterests((prev) => [saved, ...prev]);\n        await api.logAction('CREATE', 'interest', `${saved.lastName} ${saved.firstName}`, loggedInUser?.username || 'Unknown');";
if (!content.includes("'CREATE', 'interest'")) {
    content = content.replace(newIntTarget, newIntRepl);
}

// handleConvertInterest
const convertTarget = "const handleConvertInterest = (interest) => {\n    // Pre-fill student form";
const convertRepl = "const handleConvertInterest = (interest) => {\n    api.logAction('CONVERT', 'interest', `${interest.lastName} ${interest.firstName}`, loggedInUser?.username || 'Unknown', 'Μετατροπή σε σπουδαστή');\n    // Pre-fill student form";
if (!content.includes("'CONVERT', 'interest'")) {
    content = content.replace(convertTarget, convertRepl);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done modifying App.jsx');
