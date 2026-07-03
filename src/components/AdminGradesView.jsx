import React, { useState, useMemo } from 'react';
import { BookOpen, FileText, Search, User, Filter } from 'lucide-react';

export default function AdminGradesView({ students, specialties, grades, courses }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get active specialties (those that have courses and students)
  const activeSpecialties = useMemo(() => {
    return specialties.filter(spec => 
      courses[spec.id] && Object.values(courses[spec.id]).some(sem => sem.length > 0)
    );
  }, [specialties, courses]);

  // Get courses for the selected specialty
  const availableCourses = useMemo(() => {
    if (!selectedSpecialty || !courses[selectedSpecialty]) return [];
    
    let allCourses = [];
    Object.keys(courses[selectedSpecialty]).forEach(key => {
      if (key !== 'title' && Array.isArray(courses[selectedSpecialty][key])) {
        allCourses = [...allCourses, ...courses[selectedSpecialty][key]];
      }
    });
    // Remove duplicates just in case
    return [...new Set(allCourses)].sort();
  }, [selectedSpecialty, courses]);

  // Filter students and their grades
  const displayData = useMemo(() => {
    let result = [];
    
    if (!selectedSpecialty || !selectedCourse) return result;

    // Get students in this specialty
    const specStudents = students.filter(s => s.specialtyId === selectedSpecialty);

    specStudents.forEach(student => {
      // Check if student matches search query
      if (searchQuery && !student.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      // Find grade for this student and course
      const studentGrade = grades.find(g => 
        g.studentId === student.id && 
        g.courseTitle === selectedCourse
      );

      result.push({
        student,
        progressGrade: studentGrade ? studentGrade.progressGrade : '-',
        finalGrade: studentGrade ? studentGrade.finalGrade : '-'
      });
    });

    // Sort alphabetically by student name
    return result.sort((a, b) => a.student.fullName.localeCompare(b.student.fullName));
  }, [students, grades, selectedSpecialty, selectedCourse, searchQuery]);

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '600px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={24} color="#3b82f6" />
          Βαθμολογίες Εκπαιδευτών
        </h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Επιλογή Ειδικότητας:
          </label>
          <select 
            className="sys-input" 
            value={selectedSpecialty} 
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              setSelectedCourse(''); // Reset course when specialty changes
            }}
            style={{ width: '100%', background: '#fff' }}
          >
            <option value="">-- Επιλέξτε Ειδικότητα --</option>
            {activeSpecialties.map(spec => (
              <option key={spec.id} value={spec.id}>{spec.title}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Επιλογή Μαθήματος:
          </label>
          <select 
            className="sys-input" 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedSpecialty}
            style={{ width: '100%', background: selectedSpecialty ? '#fff' : '#f1f5f9' }}
          >
            <option value="">-- Επιλέξτε Μάθημα --</option>
            {availableCourses.map((course, idx) => (
              <option key={idx} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Αναζήτηση Σπουδαστή:
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="sys-input" 
              placeholder="Ονοματεπώνυμο..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedCourse}
              style={{ width: '100%', paddingLeft: '32px', background: selectedCourse ? '#fff' : '#f1f5f9' }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Results Table */}
      {!selectedSpecialty || !selectedCourse ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Filter size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>Επιλέξτε Ειδικότητα και Μάθημα για να δείτε τις βαθμολογίες.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '28%' }}>Ονοματεπώνυμο Σπουδαστή</th>
                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '12%' }}>Α.Μ.</th>
                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '20%' }}>Εργασία 6μήνου (20%)</th>
                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '20%' }}>Τελική Εξέταση (80%)</th>
                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '20%', textAlign: 'center' }}>Τελικός Βαθμός</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Δεν βρέθηκαν σπουδαστές που να ταιριάζουν στα κριτήρια.
                  </td>
                </tr>
              ) : (
                displayData.map((row, idx) => {
                  let calcGrade = '-';
                  const pNum = parseFloat(row.progressGrade);
                  const fNum = parseFloat(row.finalGrade);
                  if (!isNaN(pNum) || !isNaN(fNum)) {
                     const pVal = isNaN(pNum) ? 0 : pNum;
                     const fVal = isNaN(fNum) ? 0 : fNum;
                     calcGrade = ((pVal * 0.2) + (fVal * 0.8)).toFixed(1);
                     if (calcGrade.endsWith('.0')) calcGrade = calcGrade.slice(0, -2);
                  }
                  const calcNum = parseFloat(calcGrade);

                  return (
                  <tr key={row.student.id} style={{ borderBottom: idx === displayData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                          {row.student.fullName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>{row.student.fullName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>
                      {row.student.am || '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        background: row.progressGrade === '-' ? '#f1f5f9' : (pNum >= 5 ? '#dcfce7' : '#fee2e2'),
                        color: row.progressGrade === '-' ? '#94a3b8' : (pNum >= 5 ? '#16a34a' : '#ef4444')
                      }}>
                        {row.progressGrade}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        background: row.finalGrade === '-' ? '#f1f5f9' : (fNum >= 5 ? '#dbeafe' : '#fee2e2'),
                        color: row.finalGrade === '-' ? '#94a3b8' : (fNum >= 5 ? '#2563eb' : '#ef4444')
                      }}>
                        {row.finalGrade}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '15px', 
                        fontWeight: '700',
                        background: calcGrade === '-' ? '#f1f5f9' : (calcNum >= 5 ? '#fef3c7' : '#fee2e2'),
                        color: calcGrade === '-' ? '#94a3b8' : (calcNum >= 5 ? '#d97706' : '#ef4444')
                      }}>
                        {calcGrade}
                      </span>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
