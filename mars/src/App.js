// import all top components
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';

// import logo from './logo.svg';
// import './App.css';

function App() {
  return (
    // TODO: add auth
    <BrowserRouter>
      <Routes>
        <Route path="/" element=
        {<Homepage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
