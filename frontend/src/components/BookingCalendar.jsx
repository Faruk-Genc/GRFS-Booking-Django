import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

// Display venue wall-clock dates consistently, regardless of the admin's timezone.
const venueDateTime = value => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
};

const compactTime = (value, isEnd = false) => {
  const hour = Number(value.slice(11, 13));
  const minute = value.slice(14, 16);
  if (isEnd && hour === 23 && minute === '59') return '12';
  return `${hour % 12 || 12}${minute === '00' ? '' : `:${minute}`}${hour < 12 ? 'am' : 'pm'}`;
};

const groupedRooms = rooms => {
  const floors = new Map();
  rooms.forEach(room => {
    const floor = room.floor?.name || 'Rooms';
    if (!floors.has(floor)) floors.set(floor, []);
    floors.get(floor).push(room.name);
  });
  return [...floors].map(([floor, names]) => `${floor}: ${names.join(', ')}`).join(' - ');
};

export default function BookingCalendar({ bookings, currentDate, viewMode, selectedRoomId, onBookingClick }) {
  const ref = useRef(null);
  const view = { month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay' }[viewMode];
  useEffect(() => {
    const api = ref.current?.getApi();
    if (api) api.changeView(view, currentDate);
  }, [view, currentDate]);

  const events = bookings.filter(b => b.status !== 'Cancelled' &&
    (!selectedRoomId || b.rooms.some(r => r.id === Number(selectedRoomId))))
    .map(booking => {
      const camp = booking.booking_type === 'camp';
      const start = venueDateTime(booking.start_datetime);
      const end = venueDateTime(booking.end_datetime);
      let displayEnd = end;
      if (camp) {
        const next = new Date(`${end.slice(0, 10)}T00:00:00Z`);
        if (end.slice(11) !== '00:00:00') next.setUTCDate(next.getUTCDate() + 1);
        displayEnd = next.toISOString().slice(0, 10);
      }
      const color = booking.status === 'Pending' ? '#ff9800'
        : camp && booking.user.gender === 'male' ? '#2196f3'
        : camp && booking.user.gender === 'female' ? '#e91e63' : '#4caf50';
      const location = groupedRooms(booking.rooms);
      const name = [booking.user.first_name, booking.user.last_name].filter(Boolean).join(' ') || booking.user.username;
      return {
        id: String(booking.id), start: camp ? start.slice(0, 10) : start,
        end: displayEnd, allDay: camp,
        title: camp ? `Camp Booking - Downstairs - ${name}` : `${location} - ${name}`,
        backgroundColor: color, borderColor: color, textColor: '#172033',
        classNames: [camp ? 'venue-camp-event' : 'venue-room-event'],
        extendedProps: { booking, timeLabel: `${compactTime(start)}-${compactTime(end, true)}`,
          range: `${start.replace('T', ' ')} → ${end.replace('T', ' ')}` },
      };
    });
  return <div className="venue-calendar">
    <p className="venue-calendar-help">Camps span their full dates. Click any booking for exact times and approval controls. All times are Toronto time.</p>
    <FullCalendar ref={ref} plugins={[dayGridPlugin, timeGridPlugin]}
      initialView={view} initialDate={currentDate} headerToolbar={false}
      timeZone="UTC" events={events} height="auto" dayMaxEvents={4}
      allDayText="Camps" slotDuration="01:00:00" scrollTime="08:00:00"
      eventDisplay="block" displayEventEnd={true} nowIndicator={true}
      eventOrder="-duration,start,title" eventMinHeight={24}
      eventContent={info => <div className="venue-event-content">
        {!info.event.allDay && <strong className="venue-event-time">{info.event.extendedProps.timeLabel}</strong>}
        <span className="venue-event-label">{info.event.title}</span>
      </div>}
      eventClick={info => onBookingClick(info.event.extendedProps.booking)}
      eventDidMount={info => {
        info.el.title = `${info.event.title}\n${info.event.extendedProps.range}\n${info.event.extendedProps.booking.status}`;
      }}
    />
  </div>;
}
