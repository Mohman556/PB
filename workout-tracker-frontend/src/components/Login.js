import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../actions/authActions';
import { Navigate, Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import './assets/css/Log-Reg.css'

const Login = () => {

  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { username, password } = formData;
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Clear errors when user types
  useEffect(() => {
    dispatch(clearAuthError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = e => {
    if (error) {
      dispatch(clearAuthError());
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    dispatch(loginUser(username, password));
  };

  // Helper function to render error messages properly
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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-container"> 

      <div className='form-container'>
        <form className='forms' onSubmit={onSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={username} onChange={onChange} required/>
            {handleErrorDisplay(error, 'username')}
            {formErrors.username && <div className="field-error">{formErrors.username}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={password} onChange={onChange} required/>
            {handleErrorDisplay(error, 'password')}
            {formErrors.password && <div className="field-error">{formErrors.password}</div>}
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="form-footer">
            <p><Link to="/register" >Don't have an account? Sign up</Link></p>
          </div>  
        </form>

      </div>

      
      <div className="separator">
        <span>OR</span>
      </div>
      
      <div className="google-login-container">
        <GoogleLoginButton />
      </div>
      {error && !handleErrorDisplay(error, 'username') && 
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

export default Login;