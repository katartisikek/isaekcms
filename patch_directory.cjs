const fs = require('fs');

let content = fs.readFileSync('src/components/ContactDirectory.jsx', 'utf8');

// 1. Add courses to props
content = content.replace(
  "contacts = [], specialties = [], onAddContactClick,",
  "contacts = [], specialties = [], courses = {}, onAddContactClick,"
);

// 2. Replace the specialtyId block with assignments block
const specialtyBlockRegex = /\{contact\.specialtyId && \([\s\S]*?<\/span>\s*\)\}/;
const assignmentsBlock = `{contact.assignments && contact.assignments.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {contact.assignments.map((assignment, idx) => {
                          const spec = specialties.find(s => s.id === assignment.specialtyId);
                          let courseTitle = '';
                          if (assignment.courseId && courses[assignment.specialtyId]) {
                            const course = courses[assignment.specialtyId].find(c => c.id === assignment.courseId);
                            if (course) courseTitle = course.title;
                          }
                          
                          if (!spec) return null;
                          return (
                            <div key={idx} style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              background: '#f1f5f9', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '4px', 
                              padding: '2px 6px',
                              fontSize: '11px',
                              color: '#334155'
                            }}>
                              <span style={{ fontWeight: '600' }}>{spec.title}</span>
                              {courseTitle && (
                                <>
                                  <span style={{ color: '#94a3b8' }}>›</span>
                                  <span>{courseTitle}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}`;

content = content.replace(specialtyBlockRegex, assignmentsBlock);

fs.writeFileSync('src/components/ContactDirectory.jsx', content, 'utf8');
console.log('ContactDirectory.jsx patched successfully!');
