import React, { useState } from 'react';
import { registerUser } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password length
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Set username to the email value
    const dataWithUsername = { ...formData, username: formData.email };

    try {
      await registerUser(dataWithUsername);
      setMessage('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Show user-friendly error message
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.email?.[0] ||
                          err.response?.data?.password?.[0] ||
                          'Error during registration. Please try again.';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="first_name" 
          placeholder="First Name" 
          onChange={handleChange} 
          required 
          maxLength={50}
        />
        <input 
          name="last_name" 
          placeholder="Last Name" 
          onChange={handleChange} 
          required 
          maxLength={50}
        />
        <input 
          type="email"
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
          maxLength={100}
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password (min 8 characters)" 
          onChange={handleChange} 
          required 
          minLength={8}
        />
        <button type="submit">Register</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      <p className="auth-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;

