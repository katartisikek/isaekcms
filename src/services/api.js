import { supabase } from '../supabaseClient';

export const api = {
  // Specialties
  async fetchSpecialties() {
    const { data, error } = await supabase.from('specialties').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertSpecialty(specialty) {
    const { data, error } = await supabase.from('specialties').upsert([specialty]).select();
    if (error) throw error;
    return data[0];
  },
  async deleteSpecialty(id) {
    const { error } = await supabase.from('specialties').delete().eq('id', id);
    if (error) throw error;
  },

  // Students
  async fetchStudents() {
    const { data, error } = await supabase.from('students').select(`
      id, "fullName", phone, email, "specialtyId", "sectionId", "mathitisAr", year, "totalDebt", "paidAmount", "hasInstallments", "numberOfInstallments", notes, status, amka, afm, "idNumber"
    `);
    if (error) throw error;
    return data || [];
  },
  async fetchStudentWithFiles(id) {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async upsertStudent(student) {
    const { data, error } = await supabase.from('students').upsert([student]).select();
    if (error) throw error;
    return data[0];
  },
  async deleteStudent(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  },

  // Sections
  async fetchSections() {
    const { data, error } = await supabase.from('sections').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertSection(section) {
    const { data, error } = await supabase.from('sections').upsert([section]).select();
    if (error) throw error;
    return data[0];
  },
  async deleteSection(id) {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) throw error;
  },

  // Courses (stored as JSON)
  async fetchCourses() {
    const { data, error } = await supabase.from('courses_data').select('*');
    if (error) throw error;
    const coursesObj = {};
    (data || []).forEach(row => {
      coursesObj[row.specialtyId] = row.data;
    });
    return coursesObj;
  },
  async upsertCoursesForSpecialty(specialtyId, courseData) {
    const { error } = await supabase.from('courses_data').upsert([{ specialtyId, data: courseData }]);
    if (error) throw error;
  },
  async deleteCoursesForSpecialty(specialtyId) {
    const { error } = await supabase.from('courses_data').delete().eq('specialtyId', specialtyId);
    if (error) throw error;
  },

  // Tasks
  async fetchTasks() {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    // Map DB's assignedTo to UI's assignee
    return (data || []).map(task => ({
      ...task,
      assignee: task.assignedTo || task.assignee
    }));
  },
  async upsertTask(task) {
    const dbTask = { ...task };
    // Map UI's assignee to DB's assignedTo
    if (dbTask.assignee !== undefined) {
      dbTask.assignedTo = dbTask.assignee;
      delete dbTask.assignee;
    }
    // Remove priority if it's not in DB schema to prevent crashes
    // If you added priority to DB, you can safely remove this delete statement
    delete dbTask.priority;

    const { data, error } = await supabase.from('tasks').upsert([dbTask]).select();
    if (error) throw error;
    
    const savedTask = data[0];
    return {
      ...savedTask,
      assignee: savedTask.assignedTo || savedTask.assignee,
      priority: task.priority // Preserve it in UI state
    };
  },
  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // Contacts
  async fetchContacts() {
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
  },
  async upsertContact(contact) {
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
  },
  async deleteContact(id) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
  },

  // Grades
  async fetchGrades() {
    const { data, error } = await supabase.from('grades').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertGrades(gradesArray) {
    if (!gradesArray || gradesArray.length === 0) return [];
    const { data, error } = await supabase.from('grades').upsert(gradesArray).select();
    if (error) throw error;
    return data;
  },

  // Absences
  async fetchAbsences() {
    const { data, error } = await supabase.from('absences').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertAbsences(absencesArray) {
    if (!absencesArray || absencesArray.length === 0) return [];
    const { data, error } = await supabase.from('absences').upsert(absencesArray).select();
    if (error) throw error;
    return data;
  },

  // Teacher Reports
  async fetchTeacherReports() {
    const { data, error } = await supabase.from('teacher_reports').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertTeacherReport(report) {
    const reportData = { ...report };
    delete reportData.absences;
    const { data, error } = await supabase.from('teacher_reports').upsert([reportData]).select();
    if (error) throw error;
    return { ...data[0], absences: report.absences };
  },

  // Events
  async fetchEvents() {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertEvent(event) {
    const { data, error } = await supabase.from('events').upsert([event]).select();
    if (error) throw error;
    return data[0];
  },
  async deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },

  // Interests
  async fetchInterests() {
    const { data, error } = await supabase.from('interests').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async upsertInterest(interest) {
    const { data, error } = await supabase.from('interests').upsert([interest]).select();
    if (error) throw error;
    return data[0];
  },
  async deleteInterest(id) {
    const { error } = await supabase.from('interests').delete().eq('id', id);
    if (error) throw error;
  },

  // Audit Log
  async fetchAuditLog() {
    const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('fetchAuditLog error:', error);
      return []; // Return empty array instead of throwing to prevent breaking UI if table doesn't exist yet
    }
    return data || [];
  },
  async logAction(action, entity, entityName, userName, details = '') {
    const { error } = await supabase.from('audit_log').insert([{
      action,
      entity,
      entity_name: entityName,
      user_name: userName,
      details
    }]);
    if (error) {
      console.error('logAction error:', error);
    }
  },

  // Payment Records
  async fetchPaymentRecords(studentId = null) {
    let query = supabase.from('payment_records').select('*').order('paymentDate', { ascending: false });
    if (studentId) {
      query = query.eq('studentId', studentId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('fetchPaymentRecords error:', error);
      return [];
    }
    return data || [];
  },
  async upsertPaymentRecord(record) {
    const { data, error } = await supabase.from('payment_records').upsert([record]).select();
    if (error) throw error;
    return data[0];
  },
  async deletePaymentRecord(id) {
    const { error } = await supabase.from('payment_records').delete().eq('id', id);
    if (error) throw error;
  },
};

