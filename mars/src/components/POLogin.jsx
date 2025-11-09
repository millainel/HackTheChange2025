import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './POLogin.css';
import Aurora from './Aurora';

const POLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [busy, setBusy]           = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      setBusy(true);
      const res = await fetch('http://localhost:5001/POLogin', {   // 👈 endpoint matches your Flask route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        // Store minimal login state; avoid storing raw password
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('poUsername', username);
        navigate('/POViewPage');
      } else {
        // Map backend messages (400/401/404/500)
        setError(data?.message || `Login failed (HTTP ${res.status})`);
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} blend={0.5} amplitude={1.0} speed={0.5}/>
      <div className="login-box">
        <h2>Welcome to MARS, Officer</h2>
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
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={busy}>
            {busy ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default POLogin;
