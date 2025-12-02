import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../services/api';
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        setUser(response.data);
      } catch (err) {
        // User not logged in or token expired
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <img 
            src="/grfs-logo.png" 
            alt="Grand River Friendship Society" 
            className="navbar-logo"
          />
          <span className="navbar-brand-text">GRFS Booking</span>
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/bookingpage" className="navbar-link">Book Room</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link">Admin</Link>
              )}
              <div className="navbar-user">
                <span className="navbar-username">{user.first_name} {user.last_name}</span>
                <button onClick={handleLogout} className="navbar-logout">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

