const fs = require('fs');
let content = fs.readFileSync('src/services/api.js', 'utf8');

const fetchContactsRegex = /async fetchContacts\(\) \{\s+const \{ data, error \} = await supabase\.from\('contacts'\)\.select\('\*'\);\s+if \(error\) throw error;\s+return data \|\| \[\];\s+\},/;

const fetchContactsReplacement = `async fetchContacts() {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) throw error;
    return (data || []).map(c => {
      let assignments = [];
      try {
        if (c.department && c.department.startsWith('[')) {
          assignments = JSON.parse(c.department);
        } else if (c.department) {
          // Fallback for old data where department was just a string
          assignments = [{ specialtyId: c.department, courseId: '' }];
        }
      } catch (e) {
        // Fallback
        assignments = [{ specialtyId: c.department, courseId: '' }];
      }
      return {
        ...c,
        category: c.role || 'Προμηθευτής',
        assignments
      };
    });
  },`;

content = content.replace(fetchContactsRegex, fetchContactsReplacement);

const upsertContactRegex = /async upsertContact\(contact\) \{\s+const \{ data, error \} = await supabase\.from\('contacts'\)\.upsert\(\[contact\]\)\.select\(\);\s+if \(error\) throw error;\s+return data\[0\];\s+\},/;

const upsertContactReplacement = `async upsertContact(contact) {
    const dbContact = {
      ...contact,
      role: contact.category,
      department: contact.assignments ? JSON.stringify(contact.assignments) : (contact.specialtyId || '')
    };
    // Don't send custom UI fields to DB if they don't exist in schema (prevent errors)
    delete dbContact.category;
    delete dbContact.assignments;
    delete dbContact.specialtyId;

    const { data, error } = await supabase.from('contacts').upsert([dbContact]).select();
    if (error) throw error;

    let assignments = [];
    try {
      if (data[0].department && data[0].department.startsWith('[')) {
        assignments = JSON.parse(data[0].department);
      } else if (data[0].department) {
        assignments = [{ specialtyId: data[0].department, courseId: '' }];
      }
    } catch (e) {
      assignments = [];
    }

    return {
      ...data[0],
      category: data[0].role || 'Προμηθευτής',
      assignments
    };
  },`;

content = content.replace(upsertContactRegex, upsertContactReplacement);

fs.writeFileSync('src/services/api.js', content, 'utf8');
console.log('api.js patched successfully!');
