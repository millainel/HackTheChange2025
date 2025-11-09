import React from 'react';
import Homepage from './components/Homepage';
import POLogin from './components/POLogin';
import PersonalLogin from './components/PersonLogin';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/POLogin" element={<POLogin />} />
        <Route path="/PersonalLogin" element={<PersonalLogin />} />
      </Routes>
    </Router>
    );
}

export default App;
