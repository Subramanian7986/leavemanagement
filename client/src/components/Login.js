import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://leavemanagement-qaub.onrender.com' : 'http://localhost:10000';
      const response = await axios.post(`${API_BASE_URL}/api/login`, {  email, password });
      const { token, role } = response.data;

      // Store the token and role in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Navigate based on the user's role
      if (role === 'admin') {
        navigate('/admin'); // Redirect to the admin panel
      } else {
        navigate('/dashboard'); // Redirect to the user dashboard
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred during login.');
      }
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
          <h1>Leave Management System</h1>
        </header>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default Login;
