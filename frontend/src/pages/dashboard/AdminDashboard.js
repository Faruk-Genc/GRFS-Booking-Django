import React, { useEffect, useState } from 'react';
import { getAllBookings, getRooms } from '../../services/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      // Filter out cancelled bookings
      const activeBookings = (response.data || []).filter(
        booking => booking.status.toLowerCase() !== 'cancelled'
      );
      setBookings(activeBookings);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const getFilteredBookings = () => {
    if (!selectedRoomId || viewMode === 'day') {
      return bookings;
    }
    return bookings.filter(booking => 
      booking.rooms.some(room => room.id === parseInt(selectedRoomId))
    );
  };

  const formatRoomName = (room) => {
    if (room.floor && room.floor.name) {
      return `${room.floor.name} - ${room.name}`;
    }
    return room.name;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatHour = (hour) => {
    if (hour === 24 || hour === 0) {
      return '12:00 AM';
    }
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getBookingsForDate = (date) => {
    const filteredBookings = getFilteredBookings();
    const dateStr = date.toISOString().split('T')[0];
    return filteredBookings.filter(booking => {
      const startDate = new Date(booking.start_datetime);
      const endDate = new Date(booking.end_datetime);
      const bookingStartStr = startDate.toISOString().split('T')[0];
      const bookingEndStr = endDate.toISOString().split('T')[0];
      return dateStr >= bookingStartStr && dateStr <= bookingEndStr;
    });
  };

  const getBookingsForTimeSlot = (date, hour) => {
    const filteredBookings = getFilteredBookings();
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    return filteredBookings.filter(booking => {
      const startDate = new Date(booking.start_datetime);
      const endDate = new Date(booking.end_datetime);
      
      // Check if the time slot overlaps with the booking
      // Overlap occurs when: slotStart < bookingEnd AND slotEnd > bookingStart
      return slotStart < endDate && slotEnd > startDate;
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate days for week view
  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day;
    weekStart.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generate days for month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="calendar-day-view">
        <div className="calendar-day-header">
          <h2>{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
        </div>
        <div className="calendar-hours">
          {hours.map(hour => {
            const hourBookings = getBookingsForTimeSlot(currentDate, hour);
            return (
              <div key={hour} className="calendar-hour-row">
                <div className="hour-label">{formatHour(hour)}</div>
                <div className="hour-content">
                  {hourBookings.map(booking => (
                    <div key={booking.id} className={`booking-event booking-${booking.status.toLowerCase()}`}>
                      <div className="booking-event-title">
                        {booking.rooms.map(r => r.name).join(', ')}
                      </div>
                      <div className="booking-event-details">
                        {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                      </div>
                      <div className="booking-event-user">
                        {booking.user.username}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="calendar-week-view">
        <div className="calendar-week-header">
          <div className="week-hour-label"></div>
          {weekDays.map((day, idx) => (
            <div key={idx} className="week-day-header">
              <div className="week-day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="week-day-number">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="calendar-week-body">
          {hours.map(hour => (
            <div key={hour} className="week-hour-row">
              <div className="week-hour-label">{formatHour(hour)}</div>
              {weekDays.map((day, dayIdx) => {
                const hourBookings = getBookingsForTimeSlot(day, hour);
                return (
                  <div key={dayIdx} className="week-hour-cell">
                    {hourBookings.map(booking => (
                      <div key={booking.id} className={`booking-event booking-${booking.status.toLowerCase()}`}>
                        <div className="booking-event-title">
                          {booking.rooms.map(r => r.name).join(', ')}
                        </div>
                        <div className="booking-event-time">
                          {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-month-view">
        <div className="calendar-month-header">
          {weekDays.map(day => (
            <div key={day} className="month-day-header">{day}</div>
          ))}
        </div>
        <div className="calendar-month-body">
          {monthDays.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="month-day-cell empty"></div>;
            }
            const dayBookings = getBookingsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={idx} className={`month-day-cell ${isToday ? 'today' : ''}`}>
                <div className="month-day-number">{day.getDate()}</div>
                <div className="month-day-bookings">
                  {dayBookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className={`booking-event-small booking-${booking.status.toLowerCase()}`}>
                      <span className="booking-time-small">
                        {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                      </span>
                      <span className="booking-room-small">
                        {booking.rooms.map(r => r.name).join(', ')}
                      </span>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="booking-more">+{dayBookings.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading bookings...</div>;
  }

  if (error) {
    return <div className="admin-dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Booking Calendar</h1>
        <div className="calendar-navigation">
          <button onClick={() => navigateDate(-1)} className="nav-btn">Previous</button>
          <button onClick={goToToday} className="nav-btn today-btn">Today</button>
          <button onClick={() => navigateDate(1)} className="nav-btn">Next</button>
          <div className="current-date-display">
            {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {viewMode === 'week' && (
              <>
                {getWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {getWeekDays()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </>
            )}
            {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          {(viewMode === 'week' || viewMode === 'month') && (
            <div className="room-filter">
              <label htmlFor="room-select">Filter by Room:</label>
              <select
                id="room-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="room-select"
              >
                <option value="">All Rooms</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {formatRoomName(room)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="header-top">
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('day');
                setSelectedRoomId(''); // Clear room filter for day view
              }}
            >
              Day
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>

      <div className="booking-legend">
        <div className="legend-item">
          <span className="legend-color booking-pending"></span>
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booking-approved"></span>
          <span>Approved</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
