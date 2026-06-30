const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /const \[\s*s, sp, t, c, crs, e, a, g, tr, sec\s*\] = await Promise\.all\(\[\s*api\.fetchStudents\(\), api\.fetchSpecialties\(\), api\.fetchTasks\(\),\s*api\.fetchContacts\(\), api\.fetchCourses\(\), api\.fetchEvents\(\),\s*api\.fetchAbsences\(\), api\.fetchGrades\(\), api\.fetchTeacherReports\(\),\s*api\.fetchSections\(\), api\.fetchInterests\(\)\s*\]\);\s*setStudents\(s\);\s*setSpecialties\(sp\);\s*setTasks\(t\);\s*setContacts\(c\);\s*setCourses\(crs\);\s*setEvents\(e\.map\(ev => \(\{\s*\.\.\.ev,\s*start: ev\.start_time \? new Date\(ev\.start_time\) : new Date\(\),\s*end: ev\.end_time \? new Date\(ev\.end_time\) : new Date\(\)\s*\}\)\)\);\s*setAbsences\(a\);\s*setGrades\(g\);\s*setTeacherReports\(tr\);\s*setSections\(sec\);\s*setInterests\(int\);/g;


const fixedPart = `const [
          s, sp, t, c, crs, e, a, g, tr, sec, ints
        ] = await Promise.all([
          api.fetchStudents(), api.fetchSpecialties(), api.fetchTasks(),
          api.fetchContacts(), api.fetchCourses(), api.fetchEvents(),
          api.fetchAbsences(), api.fetchGrades(), api.fetchTeacherReports(),
          api.fetchSections(), api.fetchInterests()
        ]);
        
        setStudents(s);
        setSpecialties(sp);
        setTasks(t);
        setContacts(c);
        setCourses(crs);
        setEvents(e.map(ev => ({
          ...ev,
          start: ev.start_time ? new Date(ev.start_time) : new Date(),
          end: ev.end_time ? new Date(ev.end_time) : new Date()
        })));
        setAbsences(a);
        setGrades(g);
        setTeacherReports(tr);
        setSections(sec);
        setInterests(ints);`;

if (regex.test(content)) {
    content = content.replace(regex, fixedPart);
    fs.writeFileSync('src/App.jsx', content, 'utf8');
    console.log('Fixed successfully with regex');
} else {
    console.log('Could not find the broken part even with regex.');
}
