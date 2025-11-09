import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerFillable.css';
import Aurora from './Aurora';

const CustomerFillable = () => {
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        gender: '',
        email: '',
        address: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactNumber: '',

    });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.fname && formData.lname && formData.email && formData.address && formData.phone && formData.gender && formData.emergencyContactName && formData.emergencyContactNumber) {
            navigate('/CustomerFillable');
        } else {
            setError('Please fill in all fields');
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
                <h1>Customer Information</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="fname"
                            placeholder="First Name"
                            value={formData.fname}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="lname"
                            placeholder="Last Name"
                            value={formData.lname}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="Rather Not Say">Rather Not Say</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="emergencyContactName"
                            placeholder="Emergency Contact Name"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="emergencyContactNumber"
                            placeholder="Emergency Contact Number"
                            value={formData.emergencyContactNumber}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="button" className="submit-button" onClick={() => navigate('/HealthFillable')}>
                        To Health Information
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomerFillable;