import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/registrations/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveStudent = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/admin/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Student approved!');
      fetchPendingRegistrations();
    } catch (err) {
      console.error('Error approving student:', err);
      alert('Error approving student');
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Registrations ({registrations.length})
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Send Messages
          </button>
          <button
            className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            Upload Certificates
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="tab-content">
            <h2>Pending Student Registrations</h2>
            {loading ? (
              <p>Loading...</p>
            ) : registrations.length === 0 ? (
              <p>No pending registrations</p>
            ) : (
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Parent Email</th>
                    <th>Phone</th>
                    <th>Applied At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id}>
                      <td>{reg.student_name}</td>
                      <td>{reg.email}</td>
                      <td>{reg.phone}</td>
                      <td>{new Date(reg.applied_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="approve-btn"
                          onClick={() => approveStudent(reg.student_id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="tab-content">
            <h2>Send Bulk Messages</h2>
            <p>Feature coming soon...</p>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="tab-content">
            <h2>Upload Certificates</h2>
            <p>Feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
