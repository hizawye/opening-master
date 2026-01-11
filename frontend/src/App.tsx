import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Dashboard from './components/Dashboard';
import RepertoireEditor from './components/repertoire/RepertoireEditor';
import PracticeSetup from './components/practice/PracticeSetup';
import PracticeSession from './components/practice/PracticeSession';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { MobileNav } from './components/layout/MobileNav';

function App() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-indigo-500/30"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repertoire/:id"
          element={
            <ProtectedRoute>
              <RepertoireEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <PracticeSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:sessionId"
          element={
            <ProtectedRoute>
              <PracticeSession />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Mobile navigation - only shown when logged in */}
      {user && <MobileNav />}
    </>
  );
}

export default App;
