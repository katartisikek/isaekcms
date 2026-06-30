const fs = require('fs');

// --- 1. PATCH TEACHER DIRECTORY ---
let tContent = fs.readFileSync('src/components/TeacherDirectory.jsx', 'utf8');

// Rename component
tContent = tContent.replace('export default function ContactDirectory', 'export default function TeacherDirectory');

// Change Title
tContent = tContent.replace('Τηλεφωνικός Κατάλογος & Στοιχεία Επικοινωνίας', 'Κατάλογος Καθηγητών & Αναθέσεις');

// Remove CATEGORIES
tContent = tContent.replace(/const CATEGORIES = \[\s*'Όλοι',\s*'Εκπαιδευτής',\s*'Προμηθευτής',\s*'Συνεργάτης',\s*'Άλλο'\s*\];/g, '');

// Remove category state
tContent = tContent.replace("const [selectedCategory, setSelectedCategory] = useState('Όλοι');", "");

// Update filteredContacts logic
const filterRegex = /const filtered = contacts\.filter\(contact => \{[\s\S]*?return matchesSearch && matchesCategory;\s*\}\);/g;
const newFilter = `const filtered = contacts.filter(contact => {
      const q = searchQuery.toLowerCase();
      return (
        contact.name?.toLowerCase().includes(q) ||
        contact.phone?.toLowerCase().includes(q) ||
        contact.email?.toLowerCase().includes(q) ||
        contact.description?.toLowerCase().includes(q) ||
        contact.category?.toLowerCase().includes(q)
      );
    });`;
tContent = tContent.replace(filterRegex, newFilter);

// Remove category pills UI
const pillsRegex = /\{\/\* Category Pills Tabs \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*\{\/\* 3\. Cards Grid Layout \*\/\}/g;
tContent = tContent.replace(pillsRegex, '</div>\n\n      {/* 3. Cards Grid Layout */}');

fs.writeFileSync('src/components/TeacherDirectory.jsx', tContent, 'utf8');


// --- 2. PATCH CONTACT DIRECTORY ---
let cContent = fs.readFileSync('src/components/ContactDirectory.jsx', 'utf8');

// Remove 'Εκπαιδευτής' from CATEGORIES
cContent = cContent.replace(
  "const CATEGORIES = [\n  'Όλοι',\n  'Εκπαιδευτής',\n  'Προμηθευτής',\n  'Συνεργάτης',\n  'Άλλο'\n];",
  "const CATEGORIES = [\n  'Όλοι',\n  'Προμηθευτής',\n  'Συνεργάτης',\n  'Άλλο'\n];"
);

// Remove assignments rendering block from ContactDirectory
const assignmentsRegex = /\{contact\.assignments && contact\.assignments\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/;
cContent = cContent.replace(assignmentsRegex, `{contact.specialtyId && (
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                        {specialties.find(s => s.id === contact.specialtyId)?.title || 'Άγνωστη Ειδικότητα'}
                      </span>
                    )}`);

fs.writeFileSync('src/components/ContactDirectory.jsx', cContent, 'utf8');

console.log('Directories patched successfully!');
