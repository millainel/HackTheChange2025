import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TestFeed from "./components/TestFeed";
<<<<<<< Updated upstream
import Login from "./components/Login";
import MapPage from "./components/MapPage";
=======
import Login from "./components/POLogin";
>>>>>>> Stashed changes

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
