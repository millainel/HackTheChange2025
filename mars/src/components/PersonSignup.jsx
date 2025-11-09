import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonLogin.css';
import Aurora from './Aurora';
import CustomerFillable from './CustomerFillable';
import { useSignupFlow } from '../SignupFlowContext';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameStatus, setUsernameStatus] = useState(null); // null | "checking" | "available" | "taken"
    const { setCreds } = useSignupFlow(); 
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const checkUsername = async () => {
        if (!username) return;
        setUsernameStatus('checking');
        try {
          const res = await fetch('http://localhost:5001/check_username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          const data = await res.json();
          setUsernameStatus(data.exists ? 'taken' : 'available');
        } catch {
          setUsernameStatus(null);
        }
      };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password || !confirmPassword) {
            setError('Please fill out all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (usernameStatus === 'taken') {
            setError('Username already taken');
            return;
          }

        // Mock signup - in a real app, you'd send data to backend
       setCreds({ username, password });
    navigate('/CustomerFillable'); // next page
  };
    
    return (
        <div className="login-container">
            <Aurora
                colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                blend={0.5}
                amplitude={1.0}
                speed={0.5}
            />
            <div className="login-box">
                <h1>Create Your MARS Account</h1>
                <h2>Sign up to continue filling your information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                                onBlur={checkUsername} // 🔥 Trigger backend check when user leaves the field
                                className="input-field"
                                />
                                {/* 👇 Display username check status */}
                                {usernameStatus === 'checking' && <p>Checking username...</p>}
                                {usernameStatus === 'taken' && (
                                <p className="error-message">Username already taken</p>
                                )}
                                {usernameStatus === 'available' && (
                                <p style={{ color: 'green' }}>Username available</p>
                                )}
                        </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">
                        Sign Up
                    </button>
                </form>
                <p className="redirect-text">
                    Already have an account?{' '}
                    <span
                        className="link"
                        onClick={() => navigate('/Login')}
                    >
                        Log In
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
