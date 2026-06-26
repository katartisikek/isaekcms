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
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    return data || [];
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
    return data || [];
  },
  async upsertTask(task) {
    const { data, error } = await supabase.from('tasks').upsert([task]).select();
    if (error) throw error;
    return data[0];
  },
  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // Contacts
  async fetchContacts() {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) throw error;
    return data || [];
  },
  async upsertContact(contact) {
    const { data, error } = await supabase.from('contacts').upsert([contact]).select();
    if (error) throw error;
    return data[0];
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
    const { data, error } = await supabase.from('teacher_reports').upsert([report]).select();
    if (error) throw error;
    return data[0];
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
  }
};
