import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../actions/authActions';
import { getUserSuccess } from '../store/authSlice'; 
import { Link } from 'react-router-dom';
import tmp from './assets/media/CrSiete.gif';
import './assets/css/Profile.css';

const Profile = () => {
  // Use refs to track component mount state and prevent infinite updates
  const isMounted = useRef(false);
  const isInitialized = useRef(false);
  
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [fatPercentage, setFatPercentage] = useState(20); // Default fat percentage

  // Initial edited data state - empty until user data is properly loaded
  const [editedData, setEditedData] = useState({
    username: '',
    email: '',
    height: '',
    weight: '',
    initial_weight: '',
    fitness_goal: '',
    date_of_birth: '',
    fat_percentage: ''
  });

  // Helper functions for data processing
  const ensureNumeric = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const saveProfileToLocalStorage = (profileData) => {
    try {
      const dataToSave = {
        height: ensureNumeric(profileData.height),
        weight: ensureNumeric(profileData.weight),
        fitness_goal: ensureNumeric(profileData.fitness_goal),
        initial_weight: ensureNumeric(profileData.initial_weight),
        fat_percentage: ensureNumeric(profileData.fat_percentage) || fatPercentage,
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

  // Initialize form data from user data - ONLY ONCE when component mounts or when user changes
  useEffect(() => {
    // Skip if no user data or already initialized this session
    if (!user) return;
    
    // If we need to initialize or reinitialize due to user change
    if (!isInitialized.current) {
      console.log('Initializing profile data from user');
      
      const hasValidNumericData = 
        typeof user.height === 'number' && !isNaN(user.height) && 
        typeof user.weight === 'number' && !isNaN(user.weight) && 
        typeof user.fitness_goal === 'number' && !isNaN(user.fitness_goal);
      
      let userData;
      
      if (!hasValidNumericData) {
        console.log('Redux data has invalid numeric values, trying to restore from backup...');
        
        // Try to load backup data
        const backupData = loadProfileFromLocalStorage();
        if (backupData) {
          console.log('Using backup data from localStorage');
          
          // Only use the backup for the form state, don't update Redux here
          userData = {
            username: user.username || '',
            email: user.email || '',
            height: backupData.height,
            weight: backupData.weight,
            initial_weight: backupData.initial_weight,
            fitness_goal: backupData.fitness_goal,
            date_of_birth: user.date_of_birth || '',
            fat_percentage: backupData.fat_percentage || fatPercentage
          };
          
          // Only update Redux if not already mounted (first load)
          if (!isMounted.current) {
            const restoredUser = {
              ...user,
              height: backupData.height,
              weight: backupData.weight,
              fitness_goal: backupData.fitness_goal,
              initial_weight: backupData.initial_weight,
              fat_percentage: backupData.fat_percentage || fatPercentage
            };
            dispatch(getUserSuccess(restoredUser));
          }
        } else {
          // No backup, use whatever user data we have
          userData = {
            username: user.username || '',
            email: user.email || '',
            height: ensureNumeric(user.height),
            weight: ensureNumeric(user.weight),
            initial_weight: ensureNumeric(user.initial_weight || user.weight),
            fitness_goal: ensureNumeric(user.fitness_goal),
            date_of_birth: user.date_of_birth || '',
            fat_percentage: ensureNumeric(user.fat_percentage) || fatPercentage
          };
        }
      } else {
        // User data looks valid, use it directly
        userData = {
          username: user.username || '',
          email: user.email || '',
          height: user.height,
          weight: user.weight,
          initial_weight: user.initial_weight || user.weight,
          fitness_goal: user.fitness_goal,
          date_of_birth: user.date_of_birth || '',
          fat_percentage: user.fat_percentage || fatPercentage
        };
      }
      
      // Update form state with clean data
      setEditedData(userData);
      isInitialized.current = true;
    }
    
    // Set mounted ref to true
    isMounted.current = true;
    
    // Cleanup function
    return () => {
      // Reset initialization flag when component unmounts
      if (!isMounted.current) {
        isInitialized.current = false;
      }
    };
  }, [user, dispatch, fatPercentage]);

  // Display helpers
  const safeDisplayValue = (value, defaultValue = '0.0') => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) return defaultValue;
    return parseFloat(value).toFixed(1);
  };

  const safeDisplayWeight = (weight) => {
    if (weight === null || weight === undefined || isNaN(parseFloat(weight))) return '0.0';
    const numericWeight = parseFloat(weight);
    
    if (isMetric) {
      return numericWeight.toFixed(1); 
    } else {
      return (numericWeight * 2.20462).toFixed(1);
    }
  };

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

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Parse numeric fields
    if (['height', 'weight', 'fitness_goal', 'initial_weight', 'fat_percentage'].includes(name)) {
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

  const getImperialHeightForEdit = () => {
    if (!editedData.height) return { feet: '', inches: '' };
    const totalInches = editedData.height / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet: feet || '', inches: inches || '' };
  };
  
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

  // Form submission
  const handleSave = async () => {
    try {
      setIsUpdating(true);
      setError(null);
  
      console.log('Save triggered. Current editedData:', editedData);
      
      // Prepare data with explicit type conversions and NaN checks
      const updatedData = {
        username: editedData.username,
        // Convert all numeric fields with explicit parsing and NaN checks
        height: !isNaN(parseFloat(editedData.height)) ? parseFloat(editedData.height) : user.height || 0,
        weight: !isNaN(parseFloat(editedData.weight)) ? parseFloat(editedData.weight) : user.weight || 0,
        fitness_goal: !isNaN(parseFloat(editedData.fitness_goal)) ? parseFloat(editedData.fitness_goal) : user.fitness_goal || 0,
        date_of_birth: editedData.date_of_birth,
        fat_percentage: !isNaN(parseFloat(editedData.fat_percentage)) ? parseFloat(editedData.fat_percentage) : fatPercentage
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
      
      // Call API to update user profile
      await dispatch(updateUserProfile(updatedData));

      // Save backup to localStorage
      saveProfileToLocalStorage(updatedData);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    
    // Reset to current user data
    if (user) {
      setEditedData({
        username: user.username || '',
        email: user.email || '',
        height: ensureNumeric(user.height),
        weight: ensureNumeric(user.weight),
        initial_weight: ensureNumeric(user.initial_weight || user.weight),
        fitness_goal: ensureNumeric(user.fitness_goal),
        date_of_birth: user.date_of_birth || '',
        fat_percentage: ensureNumeric(user.fat_percentage) || fatPercentage
      });
    }
  };

  // Calculated values 
  const calculateBMI = () => {
    if (!user) return '0.0';
    const weight = ensureNumeric(user.weight);
    const height = ensureNumeric(user.height);
    
    if (!weight || !height || height <= 0) return '0.0';
    
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (bmi < 18.5) return { label: "Underweight", color: "#3498db" };
    if (bmi < 25) return { label: "Healthy Weight", color: "#2ecc71" };
    if (bmi < 30) return { label: "Overweight", color: "#f39c12" };
    if (bmi < 40) return { label: "Obesity", color: "#e74c3c" };
    return { label: "Extreme Obesity", color: "#991b1b" };
  };

  const calculateProgress = () => {
    if (!user) return '0.0';
    const currentWeight = ensureNumeric(user.weight);
    const targetWeight = ensureNumeric(user.fitness_goal);
    const initialWeight = ensureNumeric(user.initial_weight || user.weight);
    
    if (!currentWeight || !targetWeight || !initialWeight) {
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

  const calculateWeightChange = () => {
    if (!user) return { value: '0.0', isGain: false };
    
    const currentWeight = ensureNumeric(user.weight);
    const initialWeight = ensureNumeric(user.initial_weight || user.weight);
    
    if (!currentWeight || !initialWeight) return { value: '0.0', isGain: false };
    
    const rawWeightChange = currentWeight - initialWeight;
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

  // Weight change calculation
  const weightChange = calculateWeightChange();
  const weightChangeText = weightChange.isGain
    ? `Progress to date: ↑ ${Math.abs(weightChange.value)} ${isMetric ? 'kg' : 'lbs'}`
    : `Progress to date: ↓ ${Math.abs(weightChange.value)} ${isMetric ? 'kg' : 'lbs'}`;

  // Determine if in cutting or bulking phase
  const isCutting = user && ensureNumeric(user.fitness_goal) < ensureNumeric(user.initial_weight || user.weight);
  
  // Calculate age from date of birth
  const getAge = () => {
    if (!user || !user.date_of_birth) return '';
    const dob = new Date(user.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Get days since joining
  const joinDate = "2025-01-10"; // Placeholder - replace with actual join date when available
  const daysSinceJoining = () => {
    const join = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - join);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Mock achievements - replace with actual achievements when implemented
  const achievements = [
    { id: 1, title: "First Step", description: "Created your profile", completed: true, icon: "🏆" },
    { id: 2, title: "Getting Started", description: "Lost first 5kg", completed: user && ensureNumeric(user.initial_weight) - ensureNumeric(user.weight) >= 5, icon: "🔻" },
    { id: 3, title: "Halfway There", description: "Reached 50% of your goal", completed: parseFloat(calculateProgress()) >= 50, icon: "🚀" },
    { id: 4, title: "Almost There", description: "Reached 75% of your goal", completed: parseFloat(calculateProgress()) >= 75, icon: "🌟" },
    { id: 5, title: "Goal Reached!", description: "Reached 75% of your goal", completed: parseFloat(calculateProgress()) >= 75, icon: "🏁" }
  ];

  // Loading state
  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  const bmiCategory = getBMICategory();

  return (
    <div className="profile-container">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      
      <div className="unit-toggle flex justify-center mb-6">
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

      {error && <div className="error-message mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - User info */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-center mb-4">
              <img 
                src={tmp} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
              />
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">{user.username}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Height: </span>
                <span className="font-medium">
                  &nbsp;{safeDisplayHeight(user.height)} {isMetric ? 'cm' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age: </span>
                <span className="font-medium">&nbsp;{getAge()} years old</span>
              </div>
            </div>
            
            {/* Quick Actions Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <span className="text-2xl mb-1">⚖️</span>
                  <span className="text-sm font-medium">Log Weight</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <span className="text-2xl mb-1">💪</span>
                  <span className="text-sm font-medium">New Workout</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <span className="text-2xl mb-1">📊</span>
                  <span className="text-sm font-medium">View Stats</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <span className="text-2xl mb-1">🎯</span>
                  <span className="text-sm font-medium">Set Goals</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right columns */}
        <div className="md:col-span-2">
          {/* Fitness Goal Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-1">Fitness Goal</h3>
            <p className="text-gray-600 text-sm mb-4">Track your weight progress</p>
            
            {isEditing ? (
              <div className="space-y-4 mb-4">
                <div className="form-group">
                  <label className="block mb-1 font-medium">Current Weight:</label>
                  <input 
                    type="number" 
                    name="weight" 
                    value={getEditDisplayWeight()} 
                    onChange={handleInputChange} 
                    className="edit-input w-full" 
                    placeholder={isMetric ? "Weight in kg" : "Weight in lbs"}
                  />
                </div>
                <div className="form-group">
                  <label className="block mb-1 font-medium">Initial Weight:</label>
                  <input 
                    type="number" 
                    name="initial_weight" 
                    value={getEditInitialWeight()} 
                    onChange={handleInputChange} 
                    className="edit-input w-full" 
                    placeholder={isMetric ? "Initial weight in kg" : "Initial weight in lbs"} 
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="block mb-1 font-medium">Target Weight:</label>
                  <input 
                    type="number" 
                    name="fitness_goal" 
                    value={getEditDisplayGoal()} 
                    onChange={handleInputChange} 
                    className="edit-input w-full" 
                    placeholder={isMetric ? "Target weight in kg" : "Target weight in lbs"} 
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="block mb-1 font-medium">Body Fat Percentage:</label>
                  <input 
                    type="number" 
                    name="fat_percentage" 
                    value={editedData.fat_percentage} 
                    onChange={handleInputChange} 
                    className="edit-input w-full" 
                    placeholder="Body fat %" 
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label className="block mb-1 font-medium">Height:</label>
                  {isMetric ? (
                    <input 
                      type="number" 
                      name="height" 
                      value={editedData.height || ''} 
                      onChange={handleInputChange} 
                      className="edit-input w-full" 
                      placeholder="Height in cm"
                    />
                  ) : (
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <input 
                          type="number" 
                          value={getImperialHeightForEdit().feet} 
                          onChange={(e) => handleImperialHeightChange('feet', e.target.value)} 
                          className="edit-input w-full" 
                          placeholder="Feet" 
                          min="0" 
                          max="9"
                        />
                        <span className="text-xs">feet</span>
                      </div>
                      <div className="flex-1">
                        <input 
                          type="number" 
                          value={getImperialHeightForEdit().inches} 
                          onChange={(e) => handleImperialHeightChange('inches', e.target.value)} 
                          className="edit-input w-full" 
                          placeholder="Inches" 
                          min="0" 
                          max="11"
                        />
                        <span className="text-xs">inches</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="block mb-1 font-medium">Date of Birth:</label>
                  <input 
                    type="date" 
                    name="date_of_birth" 
                    value={editedData.date_of_birth} 
                    onChange={handleInputChange} 
                    className="edit-input w-full"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4" style={{marginBottom:'2em'}}>
                  <div className="text-center">
                    <span className="block text-sm text-gray-600">Starting: </span>
                    <span className="block text-xl font-bold">{safeDisplayWeight(user.initial_weight)} {isMetric ? 'kg' : 'lbs'}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm text-gray-600">Current: </span>
                    <span className="block text-xl font-bold text-blue-600">{safeDisplayWeight(user.weight)} {isMetric ? 'kg' : 'lbs'}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm text-gray-600">Goal: </span>
                    <span className="block text-xl font-bold text-green-600">{safeDisplayWeight(user.fitness_goal)} {isMetric ? 'kg' : 'lbs'}</span>
                  </div>
                </div>
                
                <div className="mb-2 flex justify-between items-center" style={{marginBottom:'1em'}}>
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {isCutting ? '🔻 Cutting Phase' : '📈 Bulking Phase'}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-medium text-center ">{calculateProgress()}% complete</span>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-300 h-2 rounded-full" 
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                
                <p className="text-center font-medium">{weightChangeText}</p>
              </>
            )}
          </div>
          
            {/* BMI Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-1">BMI Analysis</h3>
              <p className="text-gray-600 text-sm mb-4">Body Mass Index calculation</p>
              
              <div className="flex justify-center mb-3">
                <span className="text-4xl font-bold">{calculateBMI()}</span>
              </div>
              <br></br>
              <div className="flex justify-center mb-3">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full" 
                  style={{ backgroundColor: `${bmiCategory.color}20`, color: bmiCategory.color }}>
                  {bmiCategory.label}
                </span>
              </div>
              
              <div className="relative pt-1 mb-4">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-700">
                      BMI Scale
                    </span>
                  </div>
                </div>
                <div className="flex h-2 mb-0 overflow-hidden bg-blue-200 rounded">
                  <div style={{ width: '20%' }} className="bg-blue-500 text-xs"></div>
                  <div style={{ width: '20%' }} className="bg-green-500"></div>
                  <div style={{ width: '20%' }} className="bg-yellow-500"></div>
                  <div style={{ width: '20%' }} className="bg-red-500"></div>
                  <div style={{ width: '20%' }} className="bg-red-800"></div>
                </div>
                <div className="flex h-2 mb-0 overflow-hidden bg-blue-200 rounded text-xs">
                  <div style={{ width: '20%' }}>0</div>
                  <div style={{ width: '20%' }}>18.5</div>
                  <div style={{ width: '20%' }}>25</div>
                  <div style={{ width: '20%' }}>30</div>
                  <div style={{ width: '20%' }}>40+</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                BMI is a simple measurement tool but doesn't account for muscle mass, bone structure, or fitness level. It's just one indicator and not the definitive measure of health.
              </p>
            </div>
            <br></br>
            {/* Achievements Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-1">Achievements</h3>
              <p className="text-gray-600 text-sm mb-4">Track your fitness milestones</p>
              
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center p-2 rounded-lg ${
                      achievement.completed 
                        ? 'bg-green-50' 
                        : 'bg-gray-100 opacity-60'
                    }`}
                  >
                    <div style={{marginRight:'1em',marginLeft:'1em'}} className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      achievement.completed 
                        ? 'bg-green-100' 
                        : 'bg-gray-200'
                    }`}>
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    <div style={{marginRight:'1em'}}>
                      {achievement.completed ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          <br></br>
          {/* Detailed Stats Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-1">Detailed Stats</h3>
            <p className="text-gray-600 text-sm mb-4">Your fitness journey in numbers</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg px-2">
                <p className="text-blue-700 text-sm font-medium">Weight Change Rate</p>
                <p className="text-xl font-bold">0.8 kg/week</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg px-2">
                <p className="text-green-700 text-sm font-medium">Workouts This Month</p>
                <p className="text-xl font-bold">12 sessions</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg px-2">
                <p className="text-purple-700 text-sm font-medium">Body Fat</p>
                <p className="text-xl font-bold">{user.fat_percentage || fatPercentage}%</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg px-2">
                <p className="text-yellow-700 text-sm font-medium">Goal ETA</p>
                <p className="text-xl font-bold">Aug 15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        {isEditing ? (
          <div className="flex justify-center space-x-4">
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
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile 🖊
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Profile;