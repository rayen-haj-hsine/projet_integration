
import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetail'; // ✅ Corrected
import Reservations from './pages/Reservation'; // ✅ Corrected
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ChangePassword from './pages/ChangePassword';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import PublishTrip from './pages/PublishTrip';
import './index.css';

import MyTrips from './pages/MyTrips';
import TripReservations from './pages/TripReservations';
import AdminDashboard from './pages/AdminDashboard';
import PassengerList from './pages/PassengerList';
import DriverList from './pages/DriverList';
import Home from './pages/Home';
import TripHistory from './pages/TripHistory';




type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => { }
});

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const token = localStorage.getItem('token');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        {/* Background decorative elements */}
        <div className="background-effects">
          <div className="blob-2"></div>
          <div className="blob-3"></div>
          <div className="road-marker-right"></div>
          {/* Stars twinkling in the sky */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                top: `${Math.random() * 50}%`, // Only in top half (sky)
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>

        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route
            path="/my-trips"
            element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-trips/:tripId/reservations"
            element={
              <ProtectedRoute>
                <TripReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <Reservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <TripHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <ChatList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publish-trip"
            element={
              <ProtectedRoute>
                <PublishTrip />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/passengers"
            element={
              <AdminRoute>
                <PassengerList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <AdminRoute>
                <DriverList />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
