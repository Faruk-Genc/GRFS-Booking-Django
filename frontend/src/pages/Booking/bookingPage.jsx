import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getAvailableRooms,
  getCampBookingWarnings,
  getFloors,
  getRooms,
  getUser,
} from '../../services/api';
import '../../styles/BookingPage.css';

const getLocalDateValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFloorPriority = (floorName = '') => {
  const name = floorName.toLowerCase();
  if (name.includes('upstairs') || name.includes('second') || name === 'floor 2') return 0;
  if (name.includes('downstairs') || name.includes('first') || name.includes('ground')) return 1;
  return 2;
};

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [floors, setFloors] = useState([]);
  const [fetchedRooms, setFetchedRooms] = useState({}); // Cache rooms for each floor
  const [activeFloors, setActiveFloors] = useState({}); // Track active floors
  const [selectedRooms, setSelectedRooms] = useState([]); // Track selected rooms
  const [selectedFloors, setSelectedFloors] = useState([]); // Track selected floors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [campWarnings, setCampWarnings] = useState([]);
  const [bookingMode, setBookingMode] = useState(
    searchParams.get('mode') === 'time' ? 'time' : 'rooms',
  );
  const [timeDate, setTimeDate] = useState(searchParams.get('date') || '');
  const [timeStart, setTimeStart] = useState(searchParams.get('start') || '');
  const [timeEnd, setTimeEnd] = useState(searchParams.get('end') || '');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [timeSelectedRooms, setTimeSelectedRooms] = useState([]);
  const [timeSearchLoading, setTimeSearchLoading] = useState(false);
  const [timeSearchComplete, setTimeSearchComplete] = useState(false);
  const [timeSearchError, setTimeSearchError] = useState(null);
  const today = getLocalDateValue();

  useEffect(() => {
    // Fetch user data to check role (optional - user may not be logged in)
    const fetchUserData = async () => {
      try {
        const response = await getUser();
        setUser(response.data);
      } catch (err) {
        // User not logged in - this is fine, they can still browse rooms
        setUser(null);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCampWarnings = async () => {
      try {
        const response = await getCampBookingWarnings();
        setCampWarnings(response.data);
      } catch (err) {
        console.error('Failed to fetch camp booking warnings:', err);
      }
    };

    fetchCampWarnings();
  }, []);

  useEffect(() => {
    // Fetch floors data from your API
    const fetchFloorsData = async () => {
      try {
        setLoading(true);
        const response = await getFloors();
        setFloors(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch floors');
      } finally {
        setLoading(false);
      }
    };
    fetchFloorsData();
  }, []);

  const fetchRooms = async (floorId) => {
    // If rooms are already fetched for this floor, no need to fetch again
    if (fetchedRooms[floorId]) return fetchedRooms[floorId];

    try {
      const response = await getRooms(floorId);
      const rooms = response.data;
      setFetchedRooms((prevRooms) => ({
        ...prevRooms,
        [floorId]: rooms, // Cache rooms for the selected floor
      }));
      return rooms;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch rooms');
      return null;
    }
  };

  const toggleFloor = (floorId) => {
    // Toggle the active floor state, allow multiple floors to stay open
    setActiveFloors((prev) => ({
      ...prev,
      [floorId]: !prev[floorId], // Toggle the current floor's active state
    }));

    // Fetch rooms only when the floor is opened
    if (!fetchedRooms[floorId]) {
      fetchRooms(floorId);
    }
  };

  const handleRoomSelection = (roomId) => {
    // Handle room selection (clicking anywhere on the room item)
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms((prev) => prev.filter((id) => id !== roomId));
    } else {
      setSelectedRooms((prev) => [...prev, roomId]);
    }
  };

  const handleFloorBooking = async (floorId) => {
    // Ensure rooms are fetched before trying to select them
    let rooms = fetchedRooms[floorId];
    
    if (!rooms || !Array.isArray(rooms)) {
      // Fetch rooms for this floor first if not already fetched
      rooms = await fetchRooms(floorId);
    }
    
    // Only proceed if we have valid rooms
    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      const roomsForFloor = rooms.map((room) => room.id);
      setSelectedRooms((prev) => [...prev, ...roomsForFloor]);
      setSelectedFloors((prev) => [...prev, floorId]);
    } else {
      setError('Unable to fetch rooms for this floor. Please try again.');
    }
  };

  const handleSubmit = () => {
    // Navigate to the booking form with the selected rooms or floors
    if (selectedRooms.length > 0 || selectedFloors.length > 0) {
      navigate(`/booking-form?rooms=${selectedRooms.join(',')}&floors=${selectedFloors.join(',')}`);
    } else {
      alert('Please select at least one room or book a floor!');
    }
  };

  const formatHour = (hour) => {
    if (hour === 24) return '11:59 PM';
    if (hour === 0) return '12:00 AM';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const resetTimeResults = () => {
    setAvailableRooms([]);
    setTimeSelectedRooms([]);
    setTimeSearchComplete(false);
    setTimeSearchError(null);
  };

  const handleBookingModeChange = (mode) => {
    setBookingMode(mode);
    setError(null);
  };

  const handleTimeDateChange = (e) => {
    setTimeDate(e.target.value);
    resetTimeResults();
  };

  const handleTimeStartChange = (e) => {
    const nextStart = e.target.value;
    setTimeStart(nextStart);
    if (timeEnd && parseInt(timeEnd) <= parseInt(nextStart)) {
      setTimeEnd('');
    }
    resetTimeResults();
  };

  const handleTimeEndChange = (e) => {
    setTimeEnd(e.target.value);
    resetTimeResults();
  };

  const handleFindAvailableRooms = async (e) => {
    e.preventDefault();
    if (!timeDate || !timeStart || !timeEnd) return;

    setTimeSearchLoading(true);
    setTimeSearchError(null);
    setTimeSearchComplete(false);
    setTimeSelectedRooms([]);

    try {
      const response = await getAvailableRooms(timeDate, timeStart, timeEnd);
      setAvailableRooms(response.data.available_rooms || []);
      setTimeSearchComplete(true);
    } catch (err) {
      setAvailableRooms([]);
      setTimeSearchError(
        err.response?.data?.detail || 'Failed to find available rooms.',
      );
    } finally {
      setTimeSearchLoading(false);
    }
  };

  const handleTimeRoomSelection = (roomId) => {
    setTimeSelectedRooms((current) => (
      current.includes(roomId)
        ? current.filter((id) => id !== roomId)
        : [...current, roomId]
    ));
  };

  const handleReviewTimeBooking = () => {
    if (timeSelectedRooms.length === 0) return;

    const params = new URLSearchParams({
      rooms: timeSelectedRooms.join(','),
      date: timeDate,
      start: timeStart,
      end: timeEnd,
      source: 'time',
    });
    navigate(`/booking-form?${params.toString()}`);
  };

  const timeStartOptions = Array.from({ length: 16 }, (_, index) => index + 8);
  const timeEndOptions = timeStart
    ? Array.from(
        { length: Math.min(24, parseInt(timeStart) + 8) - parseInt(timeStart) },
        (_, index) => parseInt(timeStart) + index + 1,
      )
    : [];

  const roomsByFloor = availableRooms.reduce((groups, room) => {
    const floorName = room.floor?.name || 'Other';
    if (!groups[floorName]) groups[floorName] = [];
    groups[floorName].push(room);
    return groups;
  }, {});
  const sortedFloors = [...floors].sort((a, b) => (
    getFloorPriority(a.name) - getFloorPriority(b.name)
      || a.name.localeCompare(b.name)
  ));
  const sortedRoomGroups = Object.entries(roomsByFloor).sort(
    ([floorNameA], [floorNameB]) => (
      getFloorPriority(floorNameA) - getFloorPriority(floorNameB)
        || floorNameA.localeCompare(floorNameB)
    ),
  );

  const handleCampBooking = async (floorId) => {
    // Check if user has permission to book camps
    if (!user || !['mentor', 'coordinator', 'admin'].includes(user.role)) {
      alert('Only mentors, coordinators, and admins can book camps.');
      return;
    }

    // Ensure rooms are fetched before trying to select them
    let rooms = fetchedRooms[floorId];
    
    if (!rooms || !Array.isArray(rooms)) {
      // Fetch rooms for this floor first if not already fetched
      rooms = await fetchRooms(floorId);
    }
    
    // Only proceed if we have valid rooms
    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      const roomsForFloor = rooms.map((room) => room.id);
      // Navigate directly to booking form with camp type and all downstairs rooms
      navigate(`/booking-form?rooms=${roomsForFloor.join(',')}&type=camp`);
    } else {
      setError('Unable to fetch rooms for this floor. Please try again.');
    }
  };

  // Helper function to check if a floor is downstairs
  const isDownstairsFloor = (floor) => {
    const name = floor.name.toLowerCase();
    return name.includes('downstairs') || name.includes('first') || name.includes('ground') || name === '1' || name === 'floor 1';
  };

  const formatCampDateTime = (dateTime) => new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime));

  // Helper function to get static image path for a room
  // Images should be placed in frontend/public/rooms/ directory
  // Supported formats: jpg, jpeg, png, webp
  // In production, images are served from /static/rooms/ via Django/WhiteNoise
  const getRoomImage = (room) => {
    const roomId = room.id;
    // Use /static/rooms/ for production (Django serves static files from /static/)
    // In development, Vite serves from /rooms/ directly
    const basePath = import.meta.env.DEV ? '/rooms' : '/static/rooms';
    return `${basePath}/room-${roomId}.jpeg`;
  };

  // Helper function to handle image loading errors and try alternative extensions
  const handleImageError = (e, roomId) => {
    const target = e.target;
    const currentSrc = target.src;
    
    // Extract the base path and try different extensions
    const extensions = ['jpeg', 'jpg', 'png', 'webp'];
    const basePath = import.meta.env.DEV ? '/rooms' : '/static/rooms';
    
    // Find which extension we're currently trying
    let currentExt = 'jpeg';
    for (const ext of extensions) {
      if (currentSrc.includes(`.${ext}`)) {
        currentExt = ext;
        break;
      }
    }
    
    // Try next extension
    const currentIndex = extensions.indexOf(currentExt);
    if (currentIndex < extensions.length - 1) {
      const nextExt = extensions[currentIndex + 1];
      target.src = `${basePath}/room-${roomId}.${nextExt}`;
    } else {
      // All extensions tried, use placeholder
      const placeholderPath = import.meta.env.DEV ? '/rooms' : '/static/rooms';
      target.src = `${placeholderPath}/placeholder.jpg`;
      target.onerror = null; // Prevent infinite loop
    }
  };

  return (
    <div className="container">
      <h2>Building Rooms</h2>

      {campWarnings.length > 0 && (
        <div className="camp-warning-list" aria-live="polite">
          {campWarnings.map((camp) => (
            <div className="camp-warning" key={camp.id}>
              <strong>Camp booking notice:</strong>{' '}
              {camp.gender === 'Male' ? 'Boys' : 'Girls'} camp starts DOWNSTAIRS {formatCampDateTime(camp.start_datetime)} and ends{' '}
              {formatCampDateTime(camp.end_datetime)}.
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div className="loading-message">Loading floors...</div>}

      <div className="booking-mode-switch" aria-label="Choose how to start your booking">
        <button
          type="button"
          className={bookingMode === 'rooms' ? 'active' : ''}
          aria-pressed={bookingMode === 'rooms'}
          onClick={() => handleBookingModeChange('rooms')}
        >
          Choose Rooms First
        </button>
        <button
          type="button"
          className={bookingMode === 'time' ? 'active' : ''}
          aria-pressed={bookingMode === 'time'}
          onClick={() => handleBookingModeChange('time')}
        >
          Choose Time First
        </button>
      </div>

      {bookingMode === 'rooms' ? (
        <>
          <div className="accordion">
            {sortedFloors.map((floor) => (
              <div key={floor.id} className="floor">
                <div
                  className="floor-header"
                  onClick={() => toggleFloor(floor.id)}
                >
                  <div className="floor-header-text">
                    <h3>{floor.name}</h3>
                  </div>
                  <div className="floor-header-right">
                    {isDownstairsFloor(floor) && user && ['mentor', 'coordinator', 'admin'].includes(user.role) && (
                      <button
                        className="book-camp-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCampBooking(floor.id);
                        }}
                      >
                        Book for Camp
                      </button>
                    )}
                    <div className={`dropdown-arrow ${activeFloors[floor.id] ? 'open' : ''}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {activeFloors[floor.id] && (
                  <div className="floor-content">
                    <ul>
                      {fetchedRooms[floor.id] && fetchedRooms[floor.id].length > 0 ? (
                        fetchedRooms[floor.id].map((room) => (
                          <li key={room.id} className="room-item" onClick={() => handleRoomSelection(room.id)}>
                            <div className="room-content">
                              <img
                                src={getRoomImage(room)}
                                alt={room.name}
                                className="room-image"
                                onError={(e) => handleImageError(e, room.id)}
                                loading="lazy"
                              />
                              <span className="room-name">{room.name}</span>
                            </div>
                            <input
                              type="checkbox"
                              id={`room-${room.id}`}
                              onChange={() => handleRoomSelection(room.id)}
                              onClick={(e) => e.stopPropagation()}
                              checked={selectedRooms.includes(room.id)}
                            />
                          </li>
                        ))
                      ) : (
                        <li>No rooms available</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="booking-form-btn"
            disabled={selectedRooms.length === 0 && selectedFloors.length === 0}
          >
            Go to Booking Form
          </button>
        </>
      ) : (
        <section className="time-first-booking">
          <form className="time-search-form" onSubmit={handleFindAvailableRooms}>
            <div className="time-search-field">
              <label htmlFor="timeBookingDate">Date</label>
              <input
                id="timeBookingDate"
                type="date"
                min={today}
                value={timeDate}
                onChange={handleTimeDateChange}
                required
              />
            </div>
            <div className="time-search-field">
              <label htmlFor="timeBookingStart">Start Time</label>
              <select
                id="timeBookingStart"
                value={timeStart}
                onChange={handleTimeStartChange}
                required
              >
                <option value="">Select</option>
                {timeStartOptions.map((hour) => (
                  <option key={hour} value={hour}>{formatHour(hour)}</option>
                ))}
              </select>
            </div>
            <div className="time-search-field">
              <label htmlFor="timeBookingEnd">End Time</label>
              <select
                id="timeBookingEnd"
                value={timeEnd}
                onChange={handleTimeEndChange}
                disabled={!timeStart}
                required
              >
                <option value="">Select</option>
                {timeEndOptions.map((hour) => (
                  <option key={hour} value={hour}>{formatHour(hour)}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="find-rooms-btn"
              disabled={timeSearchLoading || !timeDate || !timeStart || !timeEnd}
            >
              {timeSearchLoading ? 'Checking...' : 'Show Available Rooms'}
            </button>
          </form>

          {timeSearchError && (
            <div className="error-message">
              <strong>Error:</strong> {timeSearchError}
            </div>
          )}

          {timeSearchComplete && availableRooms.length === 0 && (
            <div className="time-empty-state">
              No rooms are available for the entire selected time.
            </div>
          )}

          {availableRooms.length > 0 && (
            <div className="available-room-results">
              <div className="available-room-heading">
                <h3>Available Rooms</h3>
                <span>{timeSelectedRooms.length} selected</span>
              </div>

              {sortedRoomGroups.map(([floorName, rooms]) => (
                <div className="available-floor-group" key={floorName}>
                  <h4>{floorName}</h4>
                  <div className="available-room-grid">
                    {rooms.map((room) => (
                      <label
                        key={room.id}
                        className={`available-room-option ${timeSelectedRooms.includes(room.id) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={timeSelectedRooms.includes(room.id)}
                          onChange={() => handleTimeRoomSelection(room.id)}
                        />
                        <img
                          src={getRoomImage(room)}
                          alt=""
                          className="available-room-image"
                          onError={(e) => handleImageError(e, room.id)}
                          loading="lazy"
                        />
                        <span>{room.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="time-selection-actions">
                <div>
                  <strong>{timeDate}</strong>
                  <span>{formatHour(parseInt(timeStart))} to {formatHour(parseInt(timeEnd))}</span>
                </div>
                <button
                  type="button"
                  className="booking-form-btn"
                  disabled={timeSelectedRooms.length === 0}
                  onClick={handleReviewTimeBooking}
                >
                  Review and Confirm
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default BookingPage;
