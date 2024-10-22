import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [balance, setBalance] = useState({});
  const [applications, setApplications] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigate hook for navigation

  // Define API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://leavemanagement-qaub.onrender.com' 
    : 'http://localhost:10000';

  useEffect(() => {
    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details.');
      }
    };

    // Fetch leave balance
    const fetchBalance = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/balance`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBalance(response.data);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to load leave balance.');
      }
    };

    // Fetch leave applications
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        setError('Failed to load leave applications.');
      }
    };

    // Call the fetch functions
    fetchUserDetails();
    fetchBalance();
    fetchApplications();
  }, []); // Empty dependency array to run only on component mount

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/login'); // Redirect to login page
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

      {/* Dashboard Content */}
      <header>
        <h1>Welcome, {username}!</h1>
      </header>

      {/* Display error message if there is one */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Leave Balance</h2>
      <p>Casual Leave: {balance.casualLeaveBalance || 0}</p>
      <p>Medical Leave: {balance.medicalLeaveBalance || 0}</p>

      <h2>Leave Applications</h2>
      <ul>
        {applications.length > 0 ? (
          applications.map(app => (
            <li key={app._id}>
              {app.leaveType} from {new Date(app.startDate).toDateString()} to {new Date(app.endDate).toDateString()} - Status: {app.status}
            </li>
          ))
        ) : (
          <li>No leave applications found.</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
