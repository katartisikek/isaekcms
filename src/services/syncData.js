import { api } from './api';

export const syncLocalDataToCloud = async () => {
  try {
    const students = JSON.parse(localStorage.getItem('isaek_students') || '[]');
    const specialties = JSON.parse(localStorage.getItem('isaek_specialties') || '[]');
    const tasks = JSON.parse(localStorage.getItem('isaek_tasks') || '[]');
    const contacts = JSON.parse(localStorage.getItem('isaek_contacts') || '[]');
    const grades = JSON.parse(localStorage.getItem('isaek_grades') || '[]');
    const sections = JSON.parse(localStorage.getItem('isaek_sections') || '[]');
    const events = JSON.parse(localStorage.getItem('isaek_events') || '[]');
    const absences = JSON.parse(localStorage.getItem('isaek_absences') || '[]');
    const teacherReports = JSON.parse(localStorage.getItem('isaek_teacher_reports') || '[]');
    const courses = JSON.parse(localStorage.getItem('isaek_courses') || '{}');

    // 1. Sync Specialties
    for (const spec of specialties) {
      await api.upsertSpecialty(spec);
    }
    
    // 2. Sync Sections
    for (const sec of sections) {
      await api.upsertSection(sec);
    }

    // 3. Sync Courses
    for (const [specId, data] of Object.entries(courses)) {
      await api.upsertCoursesForSpecialty(specId, data);
    }

    // 4. Sync Students
    for (const stud of students) {
      await api.upsertStudent(stud);
    }

    // 5. Sync Tasks
    for (const task of tasks) {
      // Fix date format if it was saved as Date string
      if (task.dueDate && typeof task.dueDate === 'string') {
        task.dueDate = new Date(task.dueDate).toISOString();
      }
      await api.upsertTask(task);
    }

    // 6. Sync Contacts
    for (const contact of contacts) {
      await api.upsertContact(contact);
    }

    // 7. Sync Events
    for (const event of events) {
      if (event.start) event.start_time = new Date(event.start).toISOString();
      if (event.end) event.end_time = new Date(event.end).toISOString();
      delete event.start;
      delete event.end;
      await api.upsertEvent(event);
    }

    // 8. Sync Grades
    if (grades.length > 0) {
      await api.upsertGrades(grades);
    }

    // 9. Sync Absences
    if (absences.length > 0) {
      await api.upsertAbsences(absences);
    }

    // 10. Sync Teacher Reports
    for (const report of teacherReports) {
      await api.upsertTeacherReport(report);
    }

    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};
