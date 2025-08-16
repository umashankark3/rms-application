import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import ResumesPage from './pages/ResumesPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import UsersPage from './pages/UsersPage';
import SharedResumePage from './pages/SharedResumePage';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider>
      <div className="App">
        {user && <Navbar />}
        
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/s/:token" element={<SharedResumePage />} />
            
            {/* Auth routes */}
            {!user ? (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                {/* Protected routes */}
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/resumes" element={<ResumesPage />} />
                <Route path="/resumes/:id" element={<ResumeDetailPage />} />
                
                {/* Admin only routes */}
                {user.role === 'admin' && (
                  <Route path="/users" element={<UsersPage />} />
                )}
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/resumes" replace />} />
                <Route path="/login" element={<Navigate to="/resumes" replace />} />
                <Route path="*" element={<Navigate to="/resumes" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;