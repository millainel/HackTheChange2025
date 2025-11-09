import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerFillable.css';
import Aurora from './Aurora';
import { useSignupFlow } from '../SignupFlowContext';

const CustomerFillable = () => {
  const { creds, profile, setProfile } = useSignupFlow();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!creds.username || !creds.password) navigate('/Signup');
  }, [creds, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const next = (e) => {
    e.preventDefault();
    // optional: validate required fields here
    navigate('/HealthFillable');
  };

  return (
    <div className="customer-fillable-container">
      <Aurora
        colorStops={['#3A29FF', '#FF94B4', '#FF3232']}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className="customer-fillable-box">
        <h1>Your Information</h1>
        <form onSubmit={next}>
          <div className="form-group">
            <input
              name="fname"
              placeholder="First name"
              value={profile.fname}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="lname"
              placeholder="Last name"
              value={profile.lname}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="gender"
              placeholder="Gender"
              value={profile.gender}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="date"
              name="birth_date"
              value={profile.birth_date}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={profile.email}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="address"
              placeholder="Address"
              value={profile.address}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="phone"
              placeholder="Phone"
              value={profile.phone}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="emergency_contact_name"
              placeholder="Emergency Contact Name"
              value={profile.emergency_contact_name}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="emergency_contact_phone"
              placeholder="Emergency Contact Phone"
              value={profile.emergency_contact_phone}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              name="device_id"
              placeholder="Device ID"
              value={profile.device_id}
              onChange={onChange}
              className="input-field"
            />
          </div>

          <button type="submit" className="submit-button">
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerFillable;
