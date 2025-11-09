import React from 'react';
import Homepage from './components/Homepage';
import POLogin from './components/POLogin';
import PersonalLogin from './components/PersonLogin';
import CustomerFillable from './components/CustomerFillable';
import HealthFillable from './components/HealthFillable';
import MapPage from './components/MapPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/POLogin" element={<POLogin />} />
        <Route path="/PersonalLogin" element={<PersonalLogin />} />
        <Route path="/CustomerFillable" element={<CustomerFillable />} />
        <Route path="/HealthFillable" element={<HealthFillable />} />
        <Route path="/MapPage" element={<MapPage />} />
      </Routes>
    </Router>
    );
}

export default App;
