import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<RegisterStudent />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : user.role === 'admin' ? (
          <>
            <Route path="/admin" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </>
        ) : (
          <>
            <Route path="/student" element={<StudentDashboard user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/student" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
