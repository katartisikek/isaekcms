import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { el } from 'date-fns/locale/el';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';

const locales = {
  'el': el,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function ScheduleCalendar({ 
  events, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent,
  specialties 
}) {
  
  // Custom event styling based on the event's color
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color || '#3b82f6',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  const getSpecialtyName = (id) => {
    const spec = specialties.find(s => s.id === id);
    return spec ? spec.title : '';
  };

  // Custom event component to show more info
  const EventComponent = ({ event }) => (
    <div style={{ fontSize: '0.75rem', padding: '2px', lineHeight: '1.2' }}>
      <strong>{event.title}</strong>
      {event.room && <div style={{ fontSize: '0.65rem' }}>{event.room}</div>}
      {event.specialtyId && (
        <div style={{ fontSize: '0.65rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getSpecialtyName(event.specialtyId)}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Πρόγραμμα Μαθημάτων</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Διαχείριση εβδομαδιαίου/μηνιαίου ημερολογίου</p>
        </div>
        <button className="btn-sys primary" onClick={() => onAddEvent(null)}>
          <Plus size={16} />
          <span>Νέο Μάθημα</span>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: '600px' }}>
        <Calendar
          localizer={localizer}
          culture="el"
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={(event) => onEditEvent(event)}
          onSelectSlot={(slotInfo) => {
            // When user clicks on an empty slot in day/week view
            const newEventData = {
              start: slotInfo.start,
              end: slotInfo.end,
            };
            onAddEvent(newEventData);
          }}
          selectable={true}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          messages={{
            allDay: 'Ολοήμερο',
            previous: 'Προηγούμενο',
            next: 'Επόμενο',
            today: 'Σήμερα',
            month: 'Μήνας',
            week: 'Εβδομάδα',
            day: 'Ημέρα',
            agenda: 'Ατζέντα',
            date: 'Ημερομηνία',
            time: 'Ώρα',
            event: 'Συμβάν',
            noEventsInRange: 'Δεν υπάρχουν μαθήματα σε αυτό το διάστημα.'
          }}
        />
      </div>
    </div>
  );
}
