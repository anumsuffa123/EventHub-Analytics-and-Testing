import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

/**
 * Inner shell — rendered inside AuthProvider so it can read the token from
 * AuthContext and pass it down to RegistrationProvider without prop-drilling
 * through every child component.
 */
const AppShell = () => {
  const { token } = useAuth();

  return (
    <RegistrationProvider token={token}>
      <BrowserRouter>
        <Navbar />
        <main className="content-container">
          <Suspense fallback={<div className="loading-state">Loading EventHub...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </RegistrationProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
