import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://leavemanagement-qaub.onrender.com' : 'http://localhost:10000';

      const response = await axios.post(`${API_BASE_URL}/api/register`, { username, email, password, confirmPassword });
      setMessage(response.data.message);

      // Redirect to login page after successful registration
      if (response.status === 201) {
        navigate('/login'); // Navigate to login page
      }
    } catch (error) {
      // Check if error has a response and a data message
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred during registration");
      }
    }
  };

  return (
    <div className="container">
      <header className="app-header">
          <h1>Leave Management System</h1>
        </header>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <p style={{ color: 'red' }}>{message}</p>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Register;
