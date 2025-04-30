import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector(state => state.auth);

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        
        {/* Only show these fields if they exist */}
        {user.height && <p><strong>Height:</strong> {user.height} cm</p>}
        {user.weight && <p><strong>Weight:</strong> {user.weight} kg</p>}
        {user.fitness_goal && <p><strong>Fitness Goal:</strong> {user.fitness_goal}</p>}
        {user.date_of_birth && <p><strong>Date of Birth:</strong> {user.date_of_birth}</p>}
      </div>
      
      <div className="profile-links">
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
      
      <p className="profile-note">
        This is a placeholder profile page that will be expanded in another branch.
      </p>
    </div>
  );
};

export default Profile;