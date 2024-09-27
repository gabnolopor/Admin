// App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import './css/styles.css';
import { isAuthenticated } from './dataApi';

const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      // Comment3
      // Comment3
      navigate('/login');
    } else {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
