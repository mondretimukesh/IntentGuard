import { Routes, Route, Navigate } from 'react-router-dom';
import { ApiProvider } from './context/ApiContext';
import { ScanProvider } from './context/ScanContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  LandingPage,
  UploadPage,
  AnalysisProgressPage,
  DashboardPage,
  HistoryPage,
  SettingsPage,
  RecommendationsPage,
  LoginPage,
  RegisterPage,
  AdminPage,
} from './pages';

export default function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <ScanProvider>
          <Routes>
            {/* Public & Auth routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected User / Analyst Workspace routes (Requires Sign Up / Sign In) */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <AnalysisProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage />
                </ProtectedRoute>
              }
            />

            {/* System Administrator Portal route (Requires Sign Up / Sign In) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ScanProvider>
      </ApiProvider>
    </AuthProvider>
  );
}
