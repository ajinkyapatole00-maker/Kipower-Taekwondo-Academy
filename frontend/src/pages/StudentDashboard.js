import React from 'react';
import './StudentDashboard.css';

function StudentDashboard({ user, onLogout }) {
  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Welcome {user.name}!</h2>
        <p>Your registration is pending admin approval.</p>
        <p>You will be notified once approved.</p>

        <div className="coming-soon">
          <h3>Coming Soon</h3>
          <ul>
            <li>Student Profile</li>
            <li>Belt Exam Form</li>
            <li>Tournament Form</li>
            <li>Document Upload</li>
            <li>Certificates View</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
