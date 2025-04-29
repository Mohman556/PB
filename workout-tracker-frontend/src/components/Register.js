import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, validateCredentials, resetAuth, clearAuthError } from '../actions/authActions';
import { Navigate, Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import './assets/css/Log-Reg.css'

// Password strength tester
const calculatePasswordStrength = (password) => {
  // No password
  if (!password) return { score: 0, feedback: '' };
  
  // Check length
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Check for mixed case
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  
  // Check for numbers
  if (/\d/.test(password)) score += 1;
  
  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Calculate feedback
  let feedback = '';
  if (score === 0) feedback = 'Very weak';
  else if (score === 1) feedback = 'Weak';
  else if (score === 2) feedback = 'Fair';
  else if (score === 3) feedback = 'Good';
  else if (score === 4) feedback = 'Strong';
  else feedback = 'Very strong';
  
  return { score, feedback };
};

const pass_requirements = [
  { test: (password) => password.length >= 8, message: 'At least 8 characters' },
  { test: (password) => /[a-z]/.test(password), message: 'At least one lowercase letter' },
  { test: (password) => /[A-Z]/.test(password), message: 'At least one uppercase letter' },
  { test: (password) => /\d/.test(password), message: 'At least one number' },
  { test: (password) => /[^A-Za-z0-9]/.test(password), message: 'At least one special character' }
];

const validatePassword = (password) => {
  const failedRequirements = pass_requirements.filter(req => !req.test(password));
  return {
    isValid: failedRequirements.length <= 1, 
    failedRequirements
  };
};

const Register = () => {
  // Track registration step: 'credentials' or 'profile'
  const [step, setStep] = useState('credentials');

  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    re_password: '',
    feet: '',
    inches: '',
    weight: '',
    fitness_goal: '',
    date_of_birth: ''
  });
  
  const { username, email, password, re_password, feet, inches, weight, fitness_goal, date_of_birth } = formData;
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Clear errors when user types
  useEffect(() => {
    dispatch(clearAuthError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(clearAuthError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  //Error Logging
  useEffect(() => {
    if (error) {
      console.log("Error state:", error);
      console.log("Error type:", typeof error);
      if (typeof error === 'object') {
        console.log("Error keys:", Object.keys(error));
      }
    }
  }, [error]);

  const onChange = e => {
    // Clear any errors when user starts typing
    if (error) {
      dispatch(clearAuthError());
    }
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null
      });
    }
    if (e.target.name === 'password' || e.target.name === 're_password') {
      setFormErrors({
        ...formErrors,
        passwordMatch: null
      });
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleErrorDisplay = (error, fieldName) => {
    // If error is null or undefined
    if (!error) return null;
    
    // If error is an object
    if (typeof error === 'object') {
      if (error[fieldName]) {
        return <div className="field-error">
          {typeof error[fieldName] === 'string' ? error[fieldName] : JSON.stringify(error[fieldName])}
        </div>;
      }
      return null;
    }
    
    // If error is a string that might be JSON
    if (typeof error === 'string') {
      try {
        // Try to parse it as JSON
        const errorObj = JSON.parse(error);
        if (errorObj && errorObj[fieldName]) {
          return <div className="field-error">{errorObj[fieldName]}</div>;
        }
      } catch (e) {
        // Not a JSON string, try to match the field name in the error string
        if (error.toLowerCase().includes(fieldName.toLowerCase())) {
          return <div className="field-error">{error}</div>;
        }
      }
    }
    
    return null;
  };

  // Validate the credentials form
  const validateForm = () => {
    const newErrors = {};
    
    // Check password match
    if (password !== re_password) {
      newErrors.passwordMatch = "Passwords do not match";
    }
    // Check password strength
    if (password) {
      const { isValid, failedRequirements } = validatePassword(password);
      if (!isValid) {
        newErrors.password = "Password doesn't meet requirements";
        newErrors.passwordRequirements = failedRequirements.map(req => req.message);
      }
    }
    
    // Set the errors and return whether form is valid
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    

  };

  // Handle first step submission with validation
  const onCredentialsSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; 
    }
    
    // Validate credentials using the action
    const credentialsValid = await dispatch(validateCredentials({
      username,
      email
    }));
    
    // Only proceed to next step if validation passed
    if (credentialsValid) {
      setStep('profile');
      dispatch(resetAuth());
    }
    // If validation failed, the error will be displayed via the error state
  };

  // Handle final submission
  const onProfileSubmit = e => {
    e.preventDefault();
    
    const height = feet && inches 
      ? (parseFloat(feet) * 30.48 + parseFloat(inches) * 2.54).toFixed(2) 
      : '';
    
    const submissionData = {
      ...formData,
      height: height || null,
    };
    
    delete submissionData.feet;
    delete submissionData.inches;
    
    dispatch(registerUser(submissionData));
  };

  // Reset the loading state when switching back to step 1
  const handleBackToCredentials = () => {
    
    dispatch(resetAuth());
    setStep('credentials');
  };

  // Password state
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  
  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: '' });
    }
  }, [password]);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="register-container">
      <h2>Register your account</h2>
      <div className='split-layout'>
        
        <div className='form-side'>
          <div className='form-container' style={{marginTop: '50px'}}>
          {step === 'credentials' ? (
            /* Step 1: Credentials Form */
            <form className='forms' onSubmit={onCredentialsSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" value={username} onChange={onChange} required />
                {handleErrorDisplay(error, 'username')}
                {formErrors.username && <div className="field-error">{formErrors.username}</div>}
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={email} onChange={onChange} required />
                {handleErrorDisplay(error, 'email')}
                {formErrors.email && <div className="field-error">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={password} onChange={onChange} required />
                {/* Password strength indicator */}
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className={`strength-bar-fill strength-${passwordStrength.score}`}
                        style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                      ></div>
                    </div>
                    <div className="strength-text">{passwordStrength.feedback}</div>
                  </div>
                )}
                {/* Password requirements */}
                {password && (
                  <div className="password-requirements">
                    <p style={{color: 'black'}}>Password requirements:</p>
                    <ul>
                      {pass_requirements.map((req, index) => (
                        <li key={index} className={req.test(password) ? 'requirement-met' : 'requirement-missing'}>
                          {req.test(password) ? '✓' : '○'} {req.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Error messages */}
                {formErrors.password && (
                  <div className="field-error">
                    {formErrors.password}
                    {formErrors.passwordRequirements && (
                      <ul className="password-error-list">
                        {formErrors.passwordRequirements.map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {handleErrorDisplay(error, 'password')}
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="re_password" value={re_password} onChange={onChange} required />
                {formErrors.passwordMatch && <div className="field-error">{formErrors.passwordMatch}</div>}
              </div>
              
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Validating...' : 'Continue'}
              </button>

              <div className="form-footer">
                <p > <Link to="/login" /*style={{fontWeight: "bold"}}*/>Already have an account? Login</Link></p>
              </div>      
            </form>
          ) : (
            /* Step 2: Profile Form */
            <form onSubmit={onProfileSubmit}>
              {error && !handleErrorDisplay(error, 'height') && 
                !handleErrorDisplay(error, 'weight') && 
                !handleErrorDisplay(error, 'goal') && 
                !handleErrorDisplay(error, 'DOB') && (
                  <div className="error-message">
                    {typeof error === 'string' ? (
                      (() => {
                        try {
                          const errorObj = JSON.parse(error);
                          return errorObj.message || errorObj.detail || error;
                        } catch (e) {
                          return error;
                        }
                      })()
                    ) : (
                      error.message || error.detail || JSON.stringify(error)
                    )}
                  </div>
                )
              }
              <div className="form-header">
                <h2>Complete Your Profile</h2>
              </div>
              <div className="form-group height-input">
                <label>Height</label>
                <div className="height-fields">
                  <div className="feet-field">
                    <input type="number" name="feet" value={feet} onChange={onChange} required min="0" max="10" placeholder="ft"/>
                    <span>ft</span>
                  </div>
                  <div className="inches-field">
                    <input type="number" name="inches" value={inches} onChange={onChange} required min="0" max="11" placeholder="in"/>
                    <span>in</span>
                  </div>
                </div>
                {handleErrorDisplay(error, 'height')}
                {formErrors.height && <div className="field-error">{formErrors.height}</div>}
              </div>
              
              <div className="form-group">
                <label>Weight (lbs)</label>
                <input type="number" name="weight" value={weight} onChange={onChange} required min="0" placeholder="lbs"/>
                {handleErrorDisplay(error, 'weight')}
                {formErrors.weight && <div className="field-error">{formErrors.weight}</div>}
              </div>
              
              <div className="form-group">
                <label>Fitness Goal</label>
                <input type="text" name="fitness_goal" value={fitness_goal} onChange={onChange} required/>
                {handleErrorDisplay(error, 'goal')}
                {formErrors.goal && <div className="field-error">{formErrors.goal}</div>}
              </div>
              
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" value={date_of_birth} onChange={onChange} required/>
                {handleErrorDisplay(error, 'DOB')}
                {formErrors.DOB && <div className="field-error">{formErrors.DOB}</div>}
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleBackToCredentials}>
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
        {step === 'credentials' && (
        <div className="google-side">
          <div className="google-container">
            <div className="google-content">
              <h3 style={{color:'black'}}>Quick Sign Up</h3>
              <p>Use your Google account for faster registration:</p>
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      )}
      
      </div>
      {error && !handleErrorDisplay(error, 'username') && 
        !handleErrorDisplay(error, 'email') && 
        !handleErrorDisplay(error, 'password') && (
          <div className='error-container'>
            <div className="error-message">
              {typeof error === 'string' ? (
                (() => {
                  try {
                    const errorObj = JSON.parse(error);
                    return errorObj.message || errorObj.detail || error;
                  } catch (e) {
                    return error;
                  }
                })()
              ) : (
                error.message || error.detail || JSON.stringify(error)
              )}
            </div>

          </div>
        )
      }
    </div>
  );
};

export default Register;