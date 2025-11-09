import React, { useState, useEffect, useMemo } from 'react';
import './CustomerFillable.css';
import { useNavigate } from 'react-router-dom';
import Aurora from './Aurora';

const PersonalPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [customer, setCustomer] = useState(null);

  const [showHealth, setShowHealth] = useState(false);

  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthData, setHealthData] = useState({
    healthIssue: '',
    bloodtype: '',
    allergies: '',
  });

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState({
    fname: '',
    lname: '',
    gender: '',
    birth_date: '',
    email: '',
    address: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
  });

  // Grab the username once
  const storedUsername = useMemo(() => {
    try {
      const storedRaw = localStorage.getItem('loggedInUser');
      const parsed = storedRaw ? JSON.parse(storedRaw) : null;
      return parsed?.username || null;
    } catch {
      return null;
    }
  }, []);

  // Normalize backend person -> UI model
  const normalizePerson = (p) => ({
    id: p.person_id,
    username: p.username || '',
    fname: p.fname || '',
    lname: p.lname || '',
    gender: p.gender || '',
    birth_date: p.birth_date || '',
    email: p.email || '',
    address: p.address || '',
    phone: p.phone || '',
    emergencyContactName: p.emergency_contact_name || '',
    emergencyContactNumber: p.emergency_contact_phone || '',
    healthIssue: p.medical_note || '',
    bloodtype: p.blood_type || '',
    allergies: p.allergy_note || p.allergy_notes || '',
  });

  // Load profile on mount
  useEffect(() => {
    if (!storedUsername) {
      navigate('/login');
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('http://localhost:5001/PersonByUsername', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: storedUsername }),
          signal: controller.signal,
        });

        let data = {};
        try { data = await res.json(); } catch {}

        if (res.status === 200 && data?.success && data?.person) {
          const normalized = normalizePerson(data.person);
          setCustomer(normalized);
          setHealthData({
            healthIssue: normalized.healthIssue,
            bloodtype: normalized.bloodtype,
            allergies: normalized.allergies,
          });
          setPersonalData({
            fname: normalized.fname,
            lname: normalized.lname,
            gender: normalized.gender,
            birth_date: normalized.birth_date,
            email: normalized.email,
            address: normalized.address,
            phone: normalized.phone,
            emergencyContactName: normalized.emergencyContactName,
            emergencyContactNumber: normalized.emergencyContactNumber,
          });
        } else if (res.status === 404) {
          setError(data?.message || 'User not found.');
          navigate('/login');
        } else {
          setError(data?.message || `Failed to load user (HTTP ${res.status})`);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError('Network/server error while loading profile.');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [navigate, storedUsername]);

  if (loading) {
    return (
      <div className="customer-fillable-container">
        <Aurora colorStops={['#3A29FF', '#FF94B4', '#FF3232']} blend={0.5} amplitude={1.0} speed={0.5} />
        <div className="customer-fillable-box"><h3>Loading…</h3></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-fillable-container">
        <Aurora colorStops={['#3A29FF', '#FF94B4', '#FF3232']} blend={0.5} amplitude={1.0} speed={0.5} />
        <div className="customer-fillable-box"><p className="error-message">{error}</p></div>
      </div>
    );
  }

  if (!customer) return null;

  const handleHealthChange = (e) => {
    const { name, value } = e.target;
    setHealthData(prev => ({ ...prev, [name]: value }));
  };
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({ ...prev, [name]: value }));
  };

  // ------- Save (persist to DB) -------
  const savePersonalInfo = async () => {
    if (!storedUsername) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5001/PersonUpdate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: storedUsername,
          fields: {
            fname: personalData.fname,
            lname: personalData.lname,
            gender: personalData.gender,
            birth_date: personalData.birth_date,
            email: personalData.email,
            address: personalData.address,
            phone: personalData.phone,
            emergency_contact_name: personalData.emergencyContactName,
            emergency_contact_phone: personalData.emergencyContactNumber,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 200 && data?.success && data?.person) {
        const normalized = normalizePerson(data.person);
        setCustomer(normalized);
        setIsEditingPersonal(false);
        alert('Personal info updated!');
      } else {
        alert(data?.message || `Update failed (HTTP ${res.status})`);
      }
    } catch {
      alert('Network/server error while updating.');
    } finally {
      setSaving(false);
    }
  };

  const saveHealthInfo = async () => {
    if (!storedUsername) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5001/PersonUpdate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: storedUsername,
          fields: {
            medical_note: healthData.healthIssue,
            blood_type: healthData.bloodtype,
            allergy_note: healthData.allergies, // mapped to allergy_notes on backend
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 200 && data?.success && data?.person) {
        const normalized = normalizePerson(data.person);
        setCustomer(normalized);
        setIsEditingHealth(false);
        alert('Health info updated!');
      } else {
        alert(data?.message || `Update failed (HTTP ${res.status})`);
      }
    } catch {
      alert('Network/server error while updating.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="customer-fillable-container">
      <Aurora colorStops={['#3A29FF', '#FF94B4', '#FF3232']} blend={0.5} amplitude={1.0} speed={0.5} />

      <div className="customer-fillable-box">
        <h1>{showHealth ? 'Health Information' : 'Personal Information'}</h1>

        <button
          className="submit-button"
          onClick={() => setShowHealth(!showHealth)}
          disabled={saving}
        >
          {showHealth ? 'Show Personal Info' : 'Show Health Info'}
        </button>

        <div className="customer-card glass-card">
          {!showHealth ? (
            <div className="personal-info">
              {isEditingPersonal ? (
                <div>
                  <div className="form-group">
                    <input type="text" name="fname" value={personalData.fname} onChange={handlePersonalChange} className="input-field" placeholder="First Name"/>
                  </div>
                  <div className="form-group">
                    <input type="text" name="lname" value={personalData.lname} onChange={handlePersonalChange} className="input-field" placeholder="Last Name"/>
                  </div>
                  <div className="form-group">
                    <select name="gender" value={personalData.gender} onChange={handlePersonalChange} className="input-field">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Rather Not Say">Rather Not Say</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="date" name="birth_date" value={personalData.birth_date} onChange={handlePersonalChange} className="input-field"/>
                  </div>
                  <div className="form-group">
                    <input type="email" name="email" value={personalData.email} onChange={handlePersonalChange} className="input-field" placeholder="Email"/>
                  </div>
                  <div className="form-group">
                    <input type="text" name="address" value={personalData.address} onChange={handlePersonalChange} className="input-field" placeholder="Address"/>
                  </div>
                  <div className="form-group">
                    <input type="text" name="phone" value={personalData.phone} onChange={handlePersonalChange} className="input-field" placeholder="Phone"/>
                  </div>
                  <div className="form-group">
                    <input type="text" name="emergencyContactName" value={personalData.emergencyContactName} onChange={handlePersonalChange} className="input-field" placeholder="Emergency Contact Name"/>
                  </div>
                  <div className="form-group">
                    <input type="text" name="emergencyContactNumber" value={personalData.emergencyContactNumber} onChange={handlePersonalChange} className="input-field" placeholder="Emergency Contact Number"/>
                  </div>
                  <button className="submit-button" onClick={savePersonalInfo} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <div>
                  <h3>{customer.fname} {customer.lname}</h3>
                  <p><strong>Gender:</strong> {customer.gender}</p>
                  <p><strong>Birth Date:</strong> {customer.birth_date}</p>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Address:</strong> {customer.address}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>Emergency Contact:</strong> {customer.emergencyContactName} ({customer.emergencyContactNumber})</p>
                  <button className="submit-button" onClick={() => setIsEditingPersonal(true)} disabled={saving}>Edit</button>
                </div>
              )}
            </div>
          ) : (
            <div className="health-info">
              {isEditingHealth ? (
                <div>
                  <div className="form-group">
                    <input type="text" name="healthIssue" value={healthData.healthIssue} onChange={handleHealthChange} className="input-field" placeholder="Health Issue"/>
                  </div>
                  <div className="form-group">
                    <select name="bloodtype" value={healthData.bloodtype} onChange={handleHealthChange} className="input-field">
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
                    <input type="text" name="allergies" value={healthData.allergies} onChange={handleHealthChange} className="input-field" placeholder="Allergies"/>
                  </div>
                  <button className="submit-button" onClick={saveHealthInfo} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <div>
                  <p><strong>Health Issue:</strong> {customer.healthIssue}</p>
                  <p><strong>Blood Type:</strong> {customer.bloodtype}</p>
                  <p><strong>Allergies:</strong> {customer.allergies}</p>
                  <button className="submit-button" onClick={() => setIsEditingHealth(true)} disabled={saving}>Edit</button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="submit-button"
          onClick={() => {
            localStorage.removeItem('loggedInUser');
            navigate('/login');
          }}
          disabled={saving}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default PersonalPage;
