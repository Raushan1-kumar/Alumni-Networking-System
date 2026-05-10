import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Auth from './Auth';
import Home from './Home';
import Directory from './Directory';
import Jobs from './Jobs';
import Events from './Events';
import Donations from './Donations';
import Stories from './Stories';
import Surveys from './Surveys';
import Profile from './Profile';
import Admin from './Admin';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="page-wrapper">
        <Routes>
          <Route path="/auth" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/auth" />} />
          <Route path="/directory" element={user ? <Directory /> : <Navigate to="/auth" />} />
          <Route path="/jobs" element={user ? <Jobs user={user} /> : <Navigate to="/auth" />} />
          <Route path="/events" element={user ? <Events user={user} /> : <Navigate to="/auth" />} />
          <Route path="/donations" element={user ? <Donations user={user} /> : <Navigate to="/auth" />} />
          <Route path="/stories" element={user ? <Stories user={user} /> : <Navigate to="/auth" />} />
          <Route path="/surveys" element={user ? <Surveys user={user} /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/auth" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin user={user} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
