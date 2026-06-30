const fs = require('fs');

let content = fs.readFileSync('src/components/ContactFormModal.jsx', 'utf8');

// 1. Add courses to props
content = content.replace(
  "contact = null, specialties = []",
  "contact = null, specialties = [], courses = {}"
);

// 2. Update initial state and useEffect to handle assignments
const initRegex = /const \[formData, setFormData\] = useState\(\{[\s\S]*?specialtyId: ''\s*\}\);/;
const initReplace = `const [formData, setFormData] = useState({
    name: '',
    category: 'Προμηθευτής',
    phone: '',
    email: '',
    description: '',
    assignments: []
  });`;
content = content.replace(initRegex, initReplace);

const effectRegex = /setFormData\(\{[\s\S]*?specialtyId: contact\.specialtyId \|\| ''\s*\}\);\s*\} else \{\s*setFormData\(\{[\s\S]*?specialtyId: ''\s*\}\);/;
const effectReplace = `setFormData({
        id: contact.id,
        name: contact.name || '',
        category: contact.category || 'Προμηθευτής',
        phone: contact.phone || '',
        email: contact.email || '',
        description: contact.description || '',
        assignments: contact.assignments || []
      });
    } else {
      setFormData({
        name: '',
        category: 'Προμηθευτής',
        phone: '',
        email: '',
        description: '',
        assignments: []
      });`;
content = content.replace(effectRegex, effectReplace);

// 3. Add handleAddAssignment, handleRemoveAssignment, handleAssignmentChange functions
const validateFuncIndex = content.indexOf('const validate = () => {');
const handlersCode = `  const handleAddAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { specialtyId: '', courseId: '' }]
    }));
  };

  const handleRemoveAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index)
    }));
  };

  const handleAssignmentChange = (index, field, value) => {
    setFormData(prev => {
      const newAssignments = [...prev.assignments];
      newAssignments[index] = { ...newAssignments[index], [field]: value };
      // if specialty changes, reset course
      if (field === 'specialtyId') {
        newAssignments[index].courseId = '';
      }
      return { ...prev, assignments: newAssignments };
    });
  };

  `;
content = content.substring(0, validateFuncIndex) + handlersCode + content.substring(validateFuncIndex);

// 4. Import Plus, Trash2, BookOpen
content = content.replace(
  "import { X, PhoneCall } from 'lucide-react';",
  "import { X, PhoneCall, Plus, Trash2, BookOpen } from 'lucide-react';"
);

// 5. Replace the rendering of the category section and assignments
const renderRegex = /\{formData\.category === 'Εκπαιδευτής' && \([\s\S]*?<\/div>\s*\)\}/;
const renderReplace = `{formData.category === 'Εκπαιδευτής' && (
            <div className="sys-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="sys-label" style={{ margin: 0, color: '#0f172a' }}>
                  <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/>
                  Αναθέσεις Μαθημάτων
                </label>
                <button type="button" onClick={handleAddAssignment} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  <Plus size={12} /> Προσθήκη
                </button>
              </div>

              {formData.assignments.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '8px 0' }}>
                  Δεν υπάρχουν αναθέσεις ακόμα.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.assignments.map((assignment, idx) => {
                    // Filter courses based on specialty
                    const specialtyCourses = courses[assignment.specialtyId] || [];
                    
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select
                            className="sys-input"
                            value={assignment.specialtyId}
                            onChange={(e) => handleAssignmentChange(idx, 'specialtyId', e.target.value)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            <option value="">-- Επιλογή Ειδικότητας --</option>
                            {specialties.map((s) => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                          
                          <select
                            className="sys-input"
                            value={assignment.courseId}
                            onChange={(e) => handleAssignmentChange(idx, 'courseId', e.target.value)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                            disabled={!assignment.specialtyId}
                          >
                            <option value="">-- Επιλογή Μαθήματος --</option>
                            {specialtyCourses.map((c) => (
                              <option key={c.id} value={c.id}>{c.title} (Εξ. {c.semester})</option>
                            ))}
                          </select>
                        </div>
                        <button type="button" onClick={() => handleRemoveAssignment(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Διαγραφή ανάθεσης">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}`;
content = content.replace(renderRegex, renderReplace);

fs.writeFileSync('src/components/ContactFormModal.jsx', content, 'utf8');
console.log('ContactFormModal.jsx patched successfully!');
