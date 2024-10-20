import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ApplyLeave from './components/ApplyLeave';
import AdminPanel from './components/AdminPanel';
import About from './components/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/about" element={<About/>} />
      </Routes>
    </Router>
  );
}

export default App;
