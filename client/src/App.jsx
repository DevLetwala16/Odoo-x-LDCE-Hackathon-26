import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { TripProvider } from './context/TripContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import CreateTripPage from './pages/CreateTripPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import MyTripsPage from './pages/MyTripsPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import CalendarPage from './pages/CalendarPage';
import CommunityPage from './pages/CommunityPage';
import AdminPanelPage from './pages/AdminPanelPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-primary)' }}>Loading GlobeTrotter...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'var(--color-bg-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
            <Route path="/trips/new" element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />
            <Route path="/trips/:id/edit" element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/trips/:id" element={<ProtectedRoute><ItineraryViewPage /></ProtectedRoute>} />
            <Route path="/trips/:id/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            
            {/* Admin / Personal Analytics Dashboard (Accessible to ALL authenticated users) */}
            <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
