import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerFillable.css';
import Aurora from './Aurora';
import { useSignupFlow } from '../SignupFlowContext'; 

const HealthFillable = () => {
  const navigate = useNavigate();
  const { creds, profile, resetAll } = useSignupFlow();

  const [formData, setFormData] = useState({
    healthIssue: '',
    bloodtype: '',
    allergies: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // must come from previous steps
  useEffect(() => {
    if (!creds.username || !creds.password || !profile.fname) {
      navigate('/PersonalSignup');
    }
  }, [creds, profile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // validate this page
    if (!formData.healthIssue || !formData.bloodtype || !formData.allergies) {
      setError('Please fill in all fields');
      return;
    }

    // validate required fields expected by Flask
    const required = [
      profile.fname, profile.lname, profile.gender, profile.address,
      creds.username, creds.password, formData.bloodtype, profile.device_id,
    ];
    if (required.some((v) => !v || (typeof v === 'string' && !v.trim()))) {
      setError('Missing required info from previous steps. Please complete all fields.');
      return;
    }

    // build payload to match Flask keys
    const payload = {
      // personal/profile
      fname: profile.fname,
      lname: profile.lname,
      gender: profile.gender,
      birth_date: profile.birth_date || null,
      email: profile.email || null,
      address: profile.address,
      phone: profile.phone || null,
      emergency_contact_name: profile.emergency_contact_name || null,
      emergency_contact_phone: profile.emergency_contact_phone || null,
      device_id: profile.device_id,

      // creds
      username: creds.username,
      password: creds.password,

      // health (map UI names -> backend keys)
      medical_note: formData.healthIssue,
      blood_type: formData.bloodtype,
      allergy_note: formData.allergies,
    };

    try {
      setBusy(true);
      const res = await fetch('http://localhost:5001/CustomerFillable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include', // only if you’re setting cookies/sessions in Flask
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || `Signup failed (HTTP ${res.status})`);
        return;
      }

      // success: clear sensitive data & go to map
      resetAll();
      navigate('/MapPage');
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="customer-fillable-container">
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className="customer-fillable-box">
        <h1>Health Information</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="healthIssue"
              placeholder="Health Issue"
              value={formData.healthIssue}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <select
              name="bloodtype"
              value={formData.bloodtype}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="allergies"
              placeholder="Allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HealthFillable;
