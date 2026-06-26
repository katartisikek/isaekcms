const fs = require('fs');
let content = fs.readFileSync('src/mockData.js', 'utf8');

// Extract INITIAL_STUDENTS array string
const studentsMatch = content.match(/export const INITIAL_STUDENTS = (\[[\s\S]*?\]);\n/);
if (studentsMatch) {
    let studentsStr = studentsMatch[1];
    let students = eval(studentsStr);
    
    // Fix names and sort
    students = students.map(s => {
        if (s.fullName) {
            const parts = s.fullName.trim().split(/\s+/);
            if (parts.length >= 2) {
                const last = parts.pop();
                const first = parts.join(' ');
                s.fullName = last + ' ' + first;
            }
        }
        return s;
    });
    
    students.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'el'));
    
    const newStudentsStr = JSON.stringify(students, null, 2);
    content = content.replace(studentsMatch[1], newStudentsStr);
}

const contactsMatch = content.match(/export const INITIAL_CONTACTS = (\[[\s\S]*?\]);\n/);
if (contactsMatch) {
    let contactsStr = contactsMatch[1];
    let contacts = eval(contactsStr);
    
    contacts = contacts.map(c => {
        if (c.fullName) {
            const parts = c.fullName.trim().split(/\s+/);
            if (parts.length >= 2) {
                const last = parts.pop();
                const first = parts.join(' ');
                c.fullName = last + ' ' + first;
            }
        }
        return c;
    });
    
    contacts.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'el'));
    
    const newContactsStr = JSON.stringify(contacts, null, 2);
    content = content.replace(contactsMatch[1], newContactsStr);
}

fs.writeFileSync('src/mockData.js', content);
console.log('mockData.js updated');
