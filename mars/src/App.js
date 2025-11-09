import React from 'react';
import Homepage from './components/Homepage';
import POLogin from './components/POLogin';
import PersonalLogin from './components/PersonLogin';
import CustomerFillable from './components/CustomerFillable';
import HealthFillable from './components/HealthFillable';
import POViewPage from './components/POViewPage';
import MapPage from './components/POViewMap';
import PersonalSignup from './components/PersonSignup';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/POLogin" element={<POLogin />} />
        <Route path="/PersonalLogin" element={<PersonalLogin />} />
        <Route path="/PersonalSignup" element={<PersonalSignup />} />
        <Route path="/CustomerFillable" element={<CustomerFillable />} />
        <Route path="/HealthFillable" element={<HealthFillable />} />
        <Route path="/MapPage" element={<MapPage />} />
        <Route path="/POViewPage" element={<POViewPage />} />
      </Routes>
    </Router>
    );
}

// TODO: change all MapPage references to POViewMap

export default App;
