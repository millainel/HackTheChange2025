import React, { useEffect, useState } from 'react';
import './Homepage.css';
import Aurora from './Aurora';
import { useNavigate } from 'react-router-dom';
import POLogin from './POLogin';
import PersonLogin from './PersonLogin';
  

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
        <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
        />
      <div className="homepage-box">
        <h1>Welcome to MARS Distress Signaller</h1>
        <p>PO Login: Police Login
          <br />Personal Login: User Login
        </p>
          <button type="button" className="travel-button" onClick={() => navigate('/POLogin')}>
            PO Login
          </button>
          <button type="button" className="travel-button" onClick={() => navigate('/PersonalLogin')}>
            Personal Login
          </button>
      </div>
    </div>
  );
};

export default Homepage;
