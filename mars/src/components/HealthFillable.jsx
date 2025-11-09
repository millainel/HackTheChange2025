import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerFillable.css';
import Aurora from './Aurora';

const HealthFillable = () => {
    const [formData, setFormData] = useState({
        healthIssue: '',
        bloodtype: '',
        allergies: '',
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.healthIssue && formData.bloodtype && formData.allergies) {
            navigate('/MapPage');
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
                    <button type="submit" className="submit-button">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HealthFillable;
