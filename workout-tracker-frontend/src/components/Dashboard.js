import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <p>Welcome {user?.username || 'User'}!</p>
      <p>This is a placeholder dashboard that will be expanded in another branch.</p>
      <div className="dashboard-links">
        <Link to="/profile">View Profile</Link>
      </div>
    </div>
  );
};

export default Dashboard;
