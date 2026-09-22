import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getUser, logoutUser } from '../services/api';
import '../styles/Navbar.css';
import grfsLogo from '../assets/grfs-logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await getUser();
      setUser(response.data);
    } catch (err) {
      // User not logged in or token expired
      setUser(null);
    }
  };

  useEffect(() => {
    // Fetch user data when route changes or component mounts
    fetchUser();
  }, [location.pathname]); // Re-fetch when route changes (e.g., after login)

  const handleLogout = async () => {
    await logoutUser().catch(() => {});
    setUser(null); // Clear user state immediately
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          
          <img className="grfs-brand-logo" src={grfsLogo} alt="Grand River Friendship Society" width="144" height="80" />
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <NavLink to="/dashboard" className="navbar-link">My Bookings</NavLink>
              <NavLink to="/bookingpage" className="navbar-link">Book Rooms</NavLink>
              {user && user.role === 'admin' && (
                <NavLink to="/admin" className="navbar-link">Admin</NavLink>
              )}
              <div className="navbar-user">
                <span className="navbar-username">{user.first_name} {user.last_name}</span>
                <button onClick={handleLogout} className="navbar-logout">Logout</button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/bookingpage" className="navbar-link">Explore spaces</NavLink>
              <NavLink to="/login" className="navbar-link">Sign in</NavLink>
              <NavLink to="/register" className="navbar-link nav-signup">Create account</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

