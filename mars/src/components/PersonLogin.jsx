import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonLogin.css';
import Aurora from './Aurora';

const PersonLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const submittingRef = useRef(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (submittingRef.current) return;
    submittingRef.current = true;

    setError('');
    if (!username || !password) {
      setError('Please enter username and password');
      submittingRef.current = false;
      return;
    }

    try {
      setBusy(true);
      const res = await fetch('http://localhost:5001/PersonalLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      if (res.status === 200 && data?.success) {
        // Store minimal info
        localStorage.setItem('loggedInUser', JSON.stringify({ username: username.trim() }));
        // 👇 route to the same place as POLogin
        navigate('/PersonalPage');
      } else if (res.status === 404) {
        setError(data?.message || 'User not found.');
      } else if (res.status === 401) {
        setError(data?.message || 'Incorrect password.');
      } else if (res.status === 400) {
        setError(data?.message || 'Missing username or password.');
      } else {
        setError(data?.message || `Login failed (HTTP ${res.status})`);
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
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
        <h1>Welcome to MARS, User</h1>
        <h2>Please log in to continue</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              autoComplete="username"
              inputMode="text"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-message" aria-live="polite">{error}</p>}
          <button type="submit" className="login-button" disabled={busy}>
            {busy ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonLogin;
