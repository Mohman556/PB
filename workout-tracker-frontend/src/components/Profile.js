import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../actions/authActions';
import { getUserSuccess } from '../store/authSlice'; // Make sure path is correct
import * as authService from '../services/authServices';
import { Link } from 'react-router-dom';
import tmp from './assets/media/CrSiete.gif';
import './assets/css/Profile.css';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const saveProfileToLocalStorage = (profileData) => {
    try {
      const dataToSave = {
        height: ensureNumeric(profileData.height),
        weight: ensureNumeric(profileData.weight),
        fitness_goal: ensureNumeric(profileData.fitness_goal),
        initial_weight: ensureNumeric(profileData.initial_weight),
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('workout_tracker_profile', JSON.stringify(dataToSave));
      console.log('Profile data backed up to localStorage:', dataToSave);
      return true;
    } catch (error) {
      console.error('Failed to backup profile to localStorage:', error);
      return false;
    }
  };
  const loadProfileFromLocalStorage = () => {
    try {
      const profileJson = localStorage.getItem('workout_tracker_profile');
      if (!profileJson) {
        console.log('No profile backup found in localStorage');
        return null;
      }
      
      const profileData = JSON.parse(profileJson);
      console.log('Loaded profile backup from localStorage:', profileData);
      return profileData;
    } catch (error) {
      console.error('Failed to load profile from localStorage:', error);
      return null;
    }
  };
  const ensureNumeric = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Basic safe display for any value
  const safeDisplayValue = (value, defaultValue = '0.0') => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) return defaultValue;
    return parseFloat(value).toFixed(1);
  };

  // Safe weight display with unit conversion
  const safeDisplayWeight = (weight) => {
    if (weight === null || weight === undefined || isNaN(parseFloat(weight))) return '0.0';
    const numericWeight = parseFloat(weight);
    
    if (isMetric) {
      return numericWeight.toFixed(1); 
    } else {
      return (numericWeight * 2.20462).toFixed(1);
    }
  };

  // Safe height display with unit conversion
  const safeDisplayHeight = (height) => {
    if (height === null || height === undefined || isNaN(parseFloat(height))) return isMetric ? '0.0' : '0\'0"';
    const numericHeight = parseFloat(height);
    
    if (isMetric) {
      return numericHeight.toFixed(1);
    } else {
      const totalInches = numericHeight / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
  };

  const [editedData, setEditedData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    height: user?.height || '',
    weight: user?.weight || '',
    initial_weight: user?.initial_weight || '',
    fitness_goal: user?.fitness_goal || '',
    date_of_birth: user?.date_of_birth || ''
  });

  useEffect(() => {
      if (user) {
        const hasValidNumericData = typeof user.height === 'number' && !isNaN(user.height) && typeof user.weight === 'number' && !isNaN(user.weight) && typeof user.fitness_goal === 'number' && !isNaN(user.fitness_goal);
        
        if (!hasValidNumericData) {
          console.log('Redux data has invalid numeric values, trying to restore from backup...');
          
          // Try to load backup data
          const backupData = loadProfileFromLocalStorage();
          if (backupData) {
            console.log('Using backup data from localStorage');
            
            // Merge backup data with user data
            const restoredUser = {
              ...user,
              height: backupData.height,
              weight: backupData.weight,
              fitness_goal: backupData.fitness_goal,
              initial_weight: backupData.initial_weight
            };
            
            // Update Redux
            dispatch(getUserSuccess(restoredUser));
            
            // Set edited data
            setEditedData({
              username: user.username,
              email: user.email,
              height: backupData.height,
              weight: backupData.weight,
              initial_weight: backupData.initial_weight,
              fitness_goal: backupData.fitness_goal,
              date_of_birth: user.date_of_birth
            });
            
            return; 
          }
        }
        
        // Standard data setup if everything is valid
        setEditedData({
          username: user.username,
          email: user.email,
          height: user.height,
          weight: user.weight,
          initial_weight: user.initial_weight,
          fitness_goal: user.fitness_goal,
          date_of_birth: user.date_of_birth
        });
      }
  }, [user]);

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Parse numeric fields
    if (['height', 'weight', 'fitness_goal', 'initial_weight'].includes(name)) {
      if (value === '') {
        processedValue = '';
      } else {
        let numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          // Only convert to metric for weight and fitness_goal when in imperial mode
          // Height is already handled by imperial height inputs
          if (name === 'weight' && !isMetric) {
            processedValue = numericValue / 2.20462;
          } else if (name === 'fitness_goal' && !isMetric) {
            processedValue = numericValue / 2.20462;
          } else if (name === 'initial_weight' && !isMetric) {
            processedValue = numericValue / 2.20462;
          } else if (name === 'height' && isMetric) {
            // Only accept height through normal input when in metric mode
            processedValue = numericValue;
          } else {
            // For metric mode, use the raw value
            processedValue = numericValue;
          }
        } else {
          processedValue = 0;
        }
      }
    }
    
    setEditedData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      setError(null);
  
      console.log('Save triggered. Current editedData:', editedData);
      
      // Prepare data with explicit type conversions and NaN checks
      const updatedData = {
        username: editedData.username,
        email: editedData.email,
        // Convert all numeric fields with explicit parsing and NaN checks
        height: !isNaN(parseFloat(editedData.height)) ? parseFloat(editedData.height) : user.height || 0,
        weight: !isNaN(parseFloat(editedData.weight)) ? parseFloat(editedData.weight) : user.weight || 0,
        fitness_goal: !isNaN(parseFloat(editedData.fitness_goal)) ? parseFloat(editedData.fitness_goal) : user.fitness_goal || 0,
        date_of_birth: editedData.date_of_birth
      };
      
      // Handle initial_weight specially to avoid null issues
      if (editedData.initial_weight !== null && editedData.initial_weight !== undefined && 
          !isNaN(parseFloat(editedData.initial_weight))) {
        updatedData.initial_weight = parseFloat(editedData.initial_weight);
      } else if (user.initial_weight) {
        // Keep existing initial_weight if available
        updatedData.initial_weight = parseFloat(user.initial_weight);
      } else {
        // Fallback to current weight if no initial weight
        updatedData.initial_weight = parseFloat(updatedData.weight);
      }
      
      console.log('Sending to API with explicit number conversion:', updatedData);
      console.log('Types check:');
      console.log('- height:', typeof updatedData.height, updatedData.height);
      console.log('- weight:', typeof updatedData.weight, updatedData.weight);
      console.log('- fitness_goal:', typeof updatedData.fitness_goal, updatedData.fitness_goal);
      console.log('- initial_weight:', typeof updatedData.initial_weight, updatedData.initial_weight);
  
      // Call API to update user profile using the new action
      await dispatch(updateUserProfile(updatedData));

      // Save backup to localStorage
      saveProfileToLocalStorage(updatedData);
      
      // We can check the updated Redux state using the same user object after a short delay
      setTimeout(() => {
        // By this time, Redux should have updated the user object
        // We can use the useSelector hook to get the updated value in a component effect
        console.log('After update, check Redux state manually in React DevTools');
      }, 500);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };


  const getImperialHeightForEdit = () => {
    if (!editedData.height) return { feet: '', inches: '' };
    const totalInches = editedData.height / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet: feet || '', inches: inches || '' };
  };
  
  // Handle imperial height input
  const handleImperialHeightChange = (type, value) => {
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    const currentHeight = getImperialHeightForEdit();
    
    let newFeet = currentHeight.feet;
    let newInches = currentHeight.inches;
    
    if (type === 'feet') {
      newFeet = numericValue;
    } else {
      newInches = numericValue;
    }
    
    // Convert back to cm for storage
    const totalInches = (newFeet * 12) + newInches;
    const heightInCM = totalInches * 2.54;
    
    setEditedData(prev => ({
      ...prev,
      height: heightInCM
    }));
  };

  const getEditInitialWeight = () => {
    if (!editedData.initial_weight || editedData.initial_weight === '') return '';
    if (isMetric) {
      return parseFloat(editedData.initial_weight).toFixed(1);
    } else {
      return parseFloat((editedData.initial_weight * 2.20462).toFixed(1));
    }
  };

  const getEditDisplayWeight = () => {
    if (!editedData.weight || editedData.weight === '') return '';
    if (isMetric) {
      return parseFloat(editedData.weight).toFixed(1);
    } else {
      return parseFloat((editedData.weight * 2.20462).toFixed(1));
    }
  };

  const getEditDisplayGoal = () => {
    if (!editedData.fitness_goal || editedData.fitness_goal === '') return '';
    if (isMetric) {
      return parseFloat(editedData.fitness_goal).toFixed(1);
    } else {
      return parseFloat((editedData.fitness_goal * 2.20462).toFixed(1));
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset
    setEditedData({
      username: user.username,
      email: user.email,
      height: user.height,
      weight: user.weight,
      initial_weight: user.initial_weight,
      fitness_goal: user.fitness_goal,
      date_of_birth: user.date_of_birth
    });
  };

  // Unit conversion helper functions
  const convertWeight = (weight) => {
    if (weight === null || weight === undefined || isNaN(parseFloat(weight))) return '0.0';
    return isMetric ? parseFloat(weight).toFixed(1) : (parseFloat(weight) * 2.20462).toFixed(1);
  };

  const convertHeight = (height) => {
    if (isMetric) return parseFloat(height).toFixed(1); // Fixed - added return statement
    const totalInches = height / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(user.weight);
    const height = parseFloat(user.height);
    
    if (isNaN(weight) || isNaN(height) || height <= 0) return '0.0';
    
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  // Calculate progress
  const calculateProgress = () => {
    const currentWeight = parseFloat(user.weight);
    const targetWeight = parseFloat(user.fitness_goal);
    const initialWeight = parseFloat(user.initial_weight || user.weight);
    
    if (isNaN(currentWeight) || isNaN(targetWeight) || isNaN(initialWeight)) {
      console.log('Progress calculation error - invalid values:',
        { currentWeight, targetWeight, initialWeight });
      return "0.0";
    }

    const isCutting = targetWeight < initialWeight;
    if (isCutting) {
      const totalWeightToLose = initialWeight - targetWeight;
      if (totalWeightToLose <= 0) return "0.0";
      
      const weightLost = Math.max(0, initialWeight - currentWeight);
      const progressPercentage = (weightLost / totalWeightToLose * 100);
      return Math.min(100, Math.max(0, progressPercentage)).toFixed(1);
    } else {
      const totalWeightToGain = targetWeight - initialWeight;
      if (totalWeightToGain <= 0) return "0.0";
      
      const weightGained = Math.max(0, currentWeight - initialWeight);
      const progressPercentage = (weightGained / totalWeightToGain * 100);
      return Math.min(100, Math.max(0, progressPercentage)).toFixed(1);
    }
  };

  const isCutting = parseFloat(user.fitness_goal) < parseFloat(user.initial_weight || user.weight);

  const calculateWeightChange = () => {
    const rawWeightChange = 
      parseFloat(user.weight || 0) - parseFloat(user.initial_weight || user.weight || 0);
    
    if (isNaN(rawWeightChange)) return { value: '0.0', isGain: false };

    const isGain = rawWeightChange >= 0;
    
    // Convert to proper units based on current unit system
    const absoluteChange = Math.abs(rawWeightChange);
    const formattedChange = isMetric 
      ? absoluteChange.toFixed(1)                    // Keep as kg for metric
      : (absoluteChange * 2.20462).toFixed(1);       // Convert to lbs for imperial
    
    return {
      value: formattedChange,
      isGain: isGain
    };
  };
  // Weight change from start - fixed calculation
  const weightChange = calculateWeightChange();

  const weightChangeText = weightChange.isGain
    ? `Progress to date: ↑ ${Math.abs(weightChange.value)} ${isMetric ? 'kg' : 'lbs'}`
    : `Progress to date: ↓ ${Math.abs(weightChange.value)} ${isMetric ? 'kg' : 'lbs'}`;

  // Add debug component
  const DebugDisplay = ({user}) => {
    // Skip in production
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    
    // Safely check if a value is a valid number
    const isValidNumber = (val) => {
      return val !== null && val !== undefined && !isNaN(parseFloat(val));
    };
    
    return (
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        color: 'black'
      }}>
        <h4>Debug Values (Dev Only)</h4>
        <div>
          <p><strong>Height:</strong> {user.height} ({typeof user.height})</p>
          <p><strong>Weight:</strong> {user.weight} ({typeof user.weight})</p>
          <p><strong>Initial Weight:</strong> {user.initial_weight} ({typeof user.initial_weight})</p>
          <p><strong>Fitness Goal:</strong> {user.fitness_goal} ({typeof user.fitness_goal})</p>
          <p><strong>Is data numeric?</strong> {
            isValidNumber(user.height) && 
            isValidNumber(user.weight) && 
            isValidNumber(user.fitness_goal) ? 
            '✅ Yes' : '❌ No'
          }</p>
        </div>
      </div>
    );
  };

  // Redux update test function
  const checkReduxUpdate = () => {
    try {
      // Get current user from Redux state
      const currentUser = {...user};
      console.log('Current user in Redux:', currentUser);
      
      // Create test data with explicit numeric types
      const testData = {
        ...currentUser,
        height: 180.5,
        weight: 75.2,
        fitness_goal: 70.0,
        initial_weight: 80.0
      };
      
      console.log('Dispatching test data to Redux:', testData);
      
      // Dispatch directly to Redux
      dispatch(getUserSuccess(testData));
      
      alert('Test data dispatched to Redux. Check console for details and refresh page to see if changes persist.');
    } catch (error) {
      console.error('Redux update check failed:', error);
      alert('Redux update test error: ' + error.message);
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      <div className="unit-toggle">
        <button 
          className={`unit-btn ${isMetric ? 'active' : ''}`}
          onClick={() => setIsMetric(true)}
        >
          Metric
        </button>
        <button 
          className={`unit-btn ${!isMetric ? 'active' : ''}`}
          onClick={() => setIsMetric(false)}
        >
          Imperial
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className='split-layout'>
        <div className="profile-info">
          <img id='tmp' alt='Temporary dp' className='display-pic' src={tmp} />
          <div className='info-txt'>
            {isEditing ? (
              <div>
                <input type="text" name="username" value={editedData.username} onChange={handleInputChange} className="edit-input" placeholder="Username"/>
                <input type="email" name="email" value={editedData.email} onChange={handleInputChange} className="edit-input" placeholder="Email"/>
              </div>
            ) : (
              <div>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            )}
          </div>
          <div className='profile-stats'>
          {isEditing ? (
            <>
              <div className="form-group">
                <label><strong>Height:</strong></label>
                {isMetric ? (
                  <input type="number" name="height" value={editedData.height || ''} onChange={handleInputChange} className="edit-input" placeholder="Height in cm"/>
                ) : (
                  <div className="imperial-height-input">
                    <input type="number" value={getImperialHeightForEdit().feet} onChange={(e) => handleImperialHeightChange('feet', e.target.value)} className="edit-input height-part" placeholder="Feet" min="0" max="9"/>
                    <span className="height-separator">'</span>
                    <input type="number" value={getImperialHeightForEdit().inches} onChange={(e) => handleImperialHeightChange('inches', e.target.value)} className="edit-input height-part" placeholder="Inches" min="0" max="11"/>
                    <span className="height-separator">"</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label><strong>Date of Birth:</strong></label>
                <input type="date" name="date_of_birth" value={editedData.date_of_birth} onChange={handleInputChange} className="edit-input"/>
              </div>
            </>
          ) : (
            <>
              <p><strong>Height:</strong> {safeDisplayHeight(user.height)} {isMetric ? 'cm' : ''}</p>          
              <p><strong>Date of Birth:</strong> {user.date_of_birth}</p>
            </>
          )}
        </div>
        </div>

        <div className='profile-goals'>
          <div className="goal-section">
            <h3>Fitness Goal</h3>
            {isEditing ? (
              <>
                <div className="form-group">
                  <label><strong>Weight:</strong></label>
                  <input type="number" name="weight" value={getEditDisplayWeight()} onChange={handleInputChange} className="edit-input" placeholder={isMetric ? "Weight in kg" : "Weight in lbs"}/>
                </div>
                <div className="form-group">
                  <label><strong>Initial Weight:</strong></label>
                  <input type="number" name="initial_weight" value={getEditInitialWeight()} onChange={handleInputChange} className="edit-input" placeholder={isMetric ? "Initial weight in kg" : "Initial weight in lbs"} step="0.1"/>
                </div>
                <div className="form-group">
                  <label><strong>Target Weight:</strong></label>
                  <input type="number" name="fitness_goal" value={getEditDisplayGoal()} onChange={handleInputChange} className="edit-input" placeholder={isMetric ? "Target weight in kg" : "Target weight in lbs"} step="0.1"/>
                </div>
              </>
            ) : (
              <>
                <p><strong>Current Weight:</strong> {safeDisplayWeight(user.weight)} {isMetric ? 'kg' : 'lbs'}</p>
                <p><strong>Initial Weight:</strong> {safeDisplayWeight(user.initial_weight)} {isMetric ? 'kg' : 'lbs'}</p>
                <p><strong>Target Weight:</strong> {safeDisplayWeight(user.fitness_goal)} {isMetric ? 'kg' : 'lbs'}</p>
              </>
            )}
                   
            {!isEditing && (
              <div className="progress-section">
              <h4 className="progress-phase">
                {isCutting ? '🔻 Cutting Phase' : '📈 Bulking Phase'}
              </h4>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              <p className="progress-text">{calculateProgress()}% towards goal</p>
              <p className="weight-change">
                {weightChangeText}
              </p>
            </div>
            )}
          </div>

          {!isEditing && (
            <div className="bmi-section">
              <h3>BMI (Body Mass Index)</h3>
              <div className="bmi-value">{calculateBMI()}</div>
              <p className="bmi-disclaimer">
                <strong>Note:</strong> BMI is a simple measurement tool but doesn't account for muscle mass, 
                bone structure, or fitness level. It's just one indicator and not the definitive measure of health.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='profile-edit'>
        {isEditing ? (
          <div>
            <button 
              className="edit-btn save"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              className="edit-btn cancel"
              onClick={handleCancel}
              disabled={isUpdating}
              style={{ marginLeft: '1rem' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-links">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      </div>
      
      {/* Debug tools - only shows in development mode */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="debug-section" style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #dee2e6' }}>
          <h4>Debug Tools</h4>
          <button
            onClick={checkReduxUpdate}
            style={{
              marginTop: '1rem',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Redux Update
          </button>
          
          <DebugDisplay user={user} />
        </div>
      )}
    </div>
  );
};

export default Profile;