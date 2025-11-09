import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonLogin.css';
import Aurora from './Aurora';
import CustomerFillable from './CustomerFillable';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

        // Mock signup - in a real app, you'd send data to backend
        localStorage.setItem('isSignedUp', 'true');
        localStorage.setItem('username', username);

        navigate('/CustomerFillable');
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
                            className="input-field"
                        />
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
