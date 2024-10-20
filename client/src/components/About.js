import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate(); // useNavigate hook for navigation

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
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

      <h1>About Us</h1>
      <p>
        Welcome to our application! We provide a streamlined and efficient way to manage and apply for leave.
        Our goal is to simplify the leave application process and provide a user-friendly experience for both employees and administrators.
      </p>
      <p>
        If you have any questions or feedback, please feel free to reach out to us at <a href="mailto:support@example.com">support@example.com</a>.
      </p>
      <p>
        Thank you for using our application!
      </p>
    </div>
  );
};

export default About;
