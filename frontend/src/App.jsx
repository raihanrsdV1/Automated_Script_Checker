import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import CommonLayout from './components/ui/common-layout';
import UserDashboard from './pages/user-dashboard';
import Submission from './pages/submission';
import QuestionRubricSetup from './pages/question-rubric-setup';
import AdminDashboard from './pages/admin/SubjectManagement'; 
import Auth from './pages/auth/index.jsx';
import { ToastContainer, toast } from "react-toastify";
import Test from './pages/test/index.jsx';
import './App.css';
import { isAuthenticated } from './api/auth';

// Toast utility functions
export const showToast2 = (message, type) => {
  console.log(message, type);
  if (type === "success") toast.success(message, {});
  else if (type === "error") toast.error(message, {});
  else {
    toast.dark(message, {});
  }
};

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const location = useLocation();
  
  if (!isAuth) {
    // Redirect to login page, but save the intended destination
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Public route component that redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  
  if (isAuth) {
    // Redirect authenticated users away from login/register pages
    return <Navigate to="/user-dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage events (for logout across tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    });
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Public Routes (accessible to everyone) */}
        <Route path="/auth/*" element={<PublicRoute><Auth /></PublicRoute>} />
        
        {/* Protected Routes (require authentication) */}
        <Route path="/user-dashboard" element={<ProtectedRoute><CommonLayout><UserDashboard /></CommonLayout></ProtectedRoute>} />
        <Route path="/submission" element={<ProtectedRoute><CommonLayout><Submission /></CommonLayout></ProtectedRoute>} />
        <Route path="/question-rubric-setup" element={<ProtectedRoute><CommonLayout><QuestionRubricSetup /></CommonLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><CommonLayout><AdminDashboard /></CommonLayout></ProtectedRoute>} />
        <Route path="/student-reports" element={<ProtectedRoute><CommonLayout><Test /></CommonLayout></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><CommonLayout><Test /></CommonLayout></ProtectedRoute>} />
        <Route path="/result-generator" element={<ProtectedRoute><CommonLayout><Test /></CommonLayout></ProtectedRoute>} />
        
        {/* Default route - redirect to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={isAuthenticated() ? 
          <Navigate to="/user-dashboard" replace /> : 
          <Navigate to="/auth/login" replace />
        } />
        
        {/* Catch-all route for any unmatched paths - redirect to login or dashboard */}
        <Route path="*" element={isAuthenticated() ? 
          <Navigate to="/user-dashboard" replace /> : 
          <Navigate to="/auth/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
