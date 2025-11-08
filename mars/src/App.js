import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TestFeed from "./components/TestFeed";
import Login from "./components/Login";

function App() {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'false';

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/Homepage" /> : <Login />} 
        />
        <Route 
          path="/homepage" 
          element={isAuthenticated ? <TestFeed /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
