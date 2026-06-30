const fs = require('fs');
const path = require('path');

// 1. Patch ScheduleCalendar.jsx
const calPath = path.join(__dirname, 'src', 'components', 'ScheduleCalendar.jsx');
let calContent = fs.readFileSync(calPath, 'utf8');

if (!calContent.includes('withDragAndDrop')) {
    calContent = calContent.replace(
        "import { Calendar, dateFnsLocalizer } from 'react-big-calendar';",
        "import { Calendar, dateFnsLocalizer } from 'react-big-calendar';\nimport withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';\nimport 'react-big-calendar/lib/addons/dragAndDrop/styles.css';"
    );
    calContent = calContent.replace(
        "const localizer = dateFnsLocalizer({",
        "const DnDCalendar = withDragAndDrop(Calendar);\n\nconst localizer = dateFnsLocalizer({"
    );
    calContent = calContent.replace(
        "  onDeleteEvent,\n  specialties \n}) {",
        "  onDeleteEvent,\n  specialties,\n  onEventDrop,\n  onEventResize\n}) {"
    );
    calContent = calContent.replace(
        "<Calendar\n          localizer={localizer}",
        "<DnDCalendar\n          localizer={localizer}\n          onEventDrop={onEventDrop}\n          onEventResize={onEventResize}\n          resizable={true}"
    );
    calContent = calContent.replace(
        "          noEventsInRange: 'Δεν υπάρχουν μαθήματα σε αυτό το διάστημα.'\n          }}\n        />",
        "          noEventsInRange: 'Δεν υπάρχουν μαθήματα σε αυτό το διάστημα.'\n          }}\n        />" // actually I replaced <Calendar with <DnDCalendar, so it should close properly with />
    );
    fs.writeFileSync(calPath, calContent, 'utf8');
}

// 2. Patch App.jsx
const appPath = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appPath, 'utf8');

const handlers = `
  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString()
      };
      // prevent mutating original event fields directly for the API call if they shouldn't go to DB
      const { start: _start, end: _end, ...dbEvent } = updatedEvent;
      
      const saved = await api.upsertEvent(dbEvent);
      setEvents((prev) => prev.map((e) => (e.id === saved.id ? {
        ...saved,
        start: saved.start_time ? new Date(saved.start_time) : new Date(),
        end: saved.end_time ? new Date(saved.end_time) : new Date()
      } : e)));
      await api.logAction('UPDATE', 'event', saved.title, loggedInUser?.username || 'Unknown', 'Drag and drop μετακίνηση');
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString()
      };
      const { start: _start, end: _end, ...dbEvent } = updatedEvent;
      
      const saved = await api.upsertEvent(dbEvent);
      setEvents((prev) => prev.map((e) => (e.id === saved.id ? {
        ...saved,
        start: saved.start_time ? new Date(saved.start_time) : new Date(),
        end: saved.end_time ? new Date(saved.end_time) : new Date()
      } : e)));
      await api.logAction('UPDATE', 'event', saved.title, loggedInUser?.username || 'Unknown', 'Αλλαγή διάρκειας');
    } catch (e) {
      window.alert('Σφάλμα: ' + e.message);
    }
  };

  // Helper menu links action`;

if (!appContent.includes('handleEventDrop')) {
    appContent = appContent.replace('  // Helper menu links action', handlers);
    appContent = appContent.replace(
        '<ScheduleCalendar\n                events={events}\n                specialties={specialties}\n                onAddEvent={handleAddEventClick}\n                onEditEvent={handleEditEventClick}\n                onDeleteEvent={handleDeleteEvent}\n              />',
        '<ScheduleCalendar\n                events={events}\n                specialties={specialties}\n                onAddEvent={handleAddEventClick}\n                onEditEvent={handleEditEventClick}\n                onDeleteEvent={handleDeleteEvent}\n                onEventDrop={handleEventDrop}\n                onEventResize={handleEventResize}\n              />'
    );
    fs.writeFileSync(appPath, appContent, 'utf8');
}

console.log('Calendar DnD patch applied successfully.');
