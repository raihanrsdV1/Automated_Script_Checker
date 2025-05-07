import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import CommonLayout from './components/ui/common-layout';
import UserDashboard from './pages/user-dashboard';
import QuestionRubricSetup from './pages/question-rubric-setup';
import AdminDashboard from './pages/admin/SubjectManagement'; 
import Auth from './pages/auth/index.jsx';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import { isAuthenticated, getCurrentUser } from './api/auth';
import StudentDashboard from './pages/student/dashboard';
import TeacherDashboard from './pages/teacher/dashboard';
import TestsList from './pages/student/tests';
import SubmissionsList from './pages/student/submissions';
import RecheckerModule from './pages/student/rechecker';
import ReportsModule from './pages/teacher/reports';
import FinanceEvaluation from './pages/finance';

// Toast utility functions
export const showToast = (message, type) => {
  console.log(message, type);
  if (type === "success") toast.success(message, {});
  else if (type === "error") toast.error(message, {});
  else {
    toast.dark(message, {});
  }
};

// Export showToast2 as an alias of showToast to fix import errors
export const showToast2 = showToast;

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!isAuthenticated()) {
          setLoading(false);
          return;
        }
        
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error getting user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    // Redirect to login page, but save the intended destination
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // If there are allowed roles specified and the user's role is not in the list, redirect to dashboard
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public route component that redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  
  if (isAuth) {
    // Redirect authenticated users away from login/register pages
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Role-based dashboard component that renders the appropriate dashboard based on user role
const RoleBasedDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getUserRole = async () => {
      try {
        // First check if a role is stored in localStorage (for demo purposes)
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from the API
        const userData = await getCurrentUser();
        setUserRole(userData.role || 'student');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('student'); // Default to student if error
      } finally {
        setLoading(false);
      }
    };
    
    getUserRole();
  }, []);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Render the appropriate dashboard based on role
  return userRole === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
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
        
        {/* Dashboard - Role-based rendering */}
        <Route path="/dashboard" element={<ProtectedRoute><CommonLayout><RoleBasedDashboard /></CommonLayout></ProtectedRoute>} />
        
        {/* Student Routes */}
        <Route path="/tests" element={<ProtectedRoute><CommonLayout><TestsList /></CommonLayout></ProtectedRoute>} />
        <Route path="/submissions" element={<ProtectedRoute><CommonLayout><SubmissionsList /></CommonLayout></ProtectedRoute>} />
        <Route path="/rechecker" element={<ProtectedRoute><CommonLayout><RecheckerModule /></CommonLayout></ProtectedRoute>} />
        
        {/* Teacher Routes */}
        <Route path="/question-rubric-setup" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><CommonLayout><QuestionRubricSetup /></CommonLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><CommonLayout><ReportsModule /></CommonLayout></ProtectedRoute>} />
        
        {/* Finance Routes */}
        <Route path="/finance" element={<ProtectedRoute allowedRoles={['student']}><CommonLayout><FinanceEvaluation /></CommonLayout></ProtectedRoute>} />
        
        {/* Legacy Routes - will redirect to new structure */}
        <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/submission" element={<Navigate to="/submissions" replace />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><CommonLayout><AdminDashboard /></CommonLayout></ProtectedRoute>} />
        
        {/* Default route - redirect to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={isAuthenticated() ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/auth/login" replace />
        } />
        
        {/* Catch-all route for any unmatched paths - redirect to login or dashboard */}
        <Route path="*" element={isAuthenticated() ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/auth/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
