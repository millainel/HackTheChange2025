import React, { useState, useEffect } from 'react';
import './CustomerFillable.css';
import { useNavigate } from 'react-router-dom';
import Aurora from './Aurora';

const PersonalPage = () => {
  const navigate = useNavigate();
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

  const customers = [
    {
      id: 1,
      username: 'john',
      fname: 'John',
      lname: 'Doe',
      gender: 'Male',
      birth_date: '1990-05-15',
      email: 'john.doe@example.com',
      address: '123 Main St',
      phone: '403-555-1234',
      emergencyContactName: 'Jane Doe',
      emergencyContactNumber: '403-555-5678',
      healthIssue: 'Asthma',
      bloodtype: 'A+',
      allergies: 'Peanuts',
    },
    {
      id: 2,
      username: 'emily',
      fname: 'Emily',
      lname: 'Smith',
      gender: 'Female',
      birth_date: '1987-10-23',
      email: 'emily.smith@example.com',
      address: '456 Elm Ave',
      phone: '403-555-9876',
      emergencyContactName: 'Adam Smith',
      emergencyContactNumber: '403-555-4321',
      healthIssue: 'Diabetes',
      bloodtype: 'O-',
      allergies: 'Penicillin',
    },
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const match = customers.find(c => c.username === storedUser.username);
    if (match) {
      setCustomer(match);
      setHealthData({
        healthIssue: match.healthIssue,
        bloodtype: match.bloodtype,
        allergies: match.allergies,
      });
      setPersonalData({
        fname: match.fname,
        lname: match.lname,
        gender: match.gender,
        birth_date: match.birth_date,
        email: match.email,
        address: match.address,
        phone: match.phone,
        emergencyContactName: match.emergencyContactName,
        emergencyContactNumber: match.emergencyContactNumber,
      });
    } else {
      alert('User not found');
      navigate('/login');
    }
  }, [navigate]);

  if (!customer) return null;

  const handleHealthChange = (e) => {
    const { name, value } = e.target;
    setHealthData(prev => ({ ...prev, [name]: value }));
  };
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({ ...prev, [name]: value }));
  };

  const saveHealthInfo = () => {
    setCustomer(prev => ({ ...prev, ...healthData }));
    setIsEditingHealth(false);
    alert('Health info updated!');
  };
  const savePersonalInfo = () => {
    setCustomer(prev => ({ ...prev, ...personalData }));
    setIsEditingPersonal(false);
    alert('Personal info updated!');
  };

    return (
    <div className="customer-fillable-container">
      <Aurora colorStops={['#3A29FF', '#FF94B4', '#FF3232']} blend={0.5} amplitude={1.0} speed={0.5} />

      <div className="customer-fillable-box">
        <h1>{showHealth ? 'Health Information' : 'Personal Information'}</h1>

        {/* Toggle button */}
        <button className="submit-button" onClick={() => setShowHealth(!showHealth)}>
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
                  <button className="submit-button" onClick={savePersonalInfo}>Save</button>
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
                  <button className="submit-button" onClick={() => setIsEditingPersonal(true)}>Edit</button>
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
                  <button className="submit-button" onClick={saveHealthInfo}>Save</button>
                </div>
              ) : (
                <div>
                  <p><strong>Health Issue:</strong> {customer.healthIssue}</p>
                  <p><strong>Blood Type:</strong> {customer.bloodtype}</p>
                  <p><strong>Allergies:</strong> {customer.allergies}</p>
                  <button className="submit-button" onClick={() => setIsEditingHealth(true)}>Edit</button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="submit-button" onClick={() => {
          localStorage.removeItem('loggedInUser');
          navigate('/login');
        }}>Log Out</button>
      </div>
    </div>
  );
};

export default PersonalPage;
