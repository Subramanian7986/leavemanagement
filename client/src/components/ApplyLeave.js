import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // useNavigate hook for navigation

  // Define API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://leavemanagement-qaub.onrender.com' 
    : 'http://localhost:10000';

  const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      alert('The end date cannot be before the start date. Please correct it.');
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate dates before making the API request
    if (!validateDateRange(startDate, endDate)) {
      return; // Exit the function if dates are invalid
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/leaves/apply`, // Use the API base URL
        { leaveType, startDate, endDate, reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      // After successful application, navigate to the dashboard
      navigate('/dashboard');  // Correct usage of navigate in React Router v6
    } catch (error) {
      // Set the error message if the server responds with an error message
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred while applying for leave.');
      }
      console.error('Error applying leave:', error);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Leave Management System</h1>
      </header>
      {/* Navigation Bar */}
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Home</Link>
          </li>
          <li>
            <Link to="/apply-leave">Apply Leave</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      <h1>Apply for Leave</h1>
      <form onSubmit={handleSubmit}>
        {/* Display the error message if it exists */}
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <label>Leave Type:</label>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
          <option value="casual">Casual Leave</option>
          <option value="medical">Medical Leave</option>
        </select>

        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />

        <label>Reason:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for leave"
          required
        ></textarea>

        <button type="submit">Apply</button>
      </form>
    </div>
  );
};

export default ApplyLeave;
