import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CommonLayout from './components/ui/common-layout';
import Login from './pages/login';
import Register from './pages/register';
import UserDashboard from './pages/user-dashboard';
import Submission from './pages/submission';
import QuestionRubricSetup from './pages/question-rubric-setup';
import Auth from './pages/auth/index.jsx';
import { ToastContainer, toast } from "react-toastify";
import Test from './pages/test/index.jsx'; // Import the Test component
import './App.css';

var showToast;
var setLoading;
const showToast2 = (message, type) => {
  console.log(message, type);
  if (type === "success") toast.success(message, {});
  else if (type === "error") toast.error(message, {});
  else {
    toast.dark(message, {});
  }
};

function App() {
  const profile = {
    name: "Raihan Rashid",
    email: "raihanrsd@gmail.com"
  };

  const token = localStorage.getItem("token");
  const auth = true;

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

      <div className="min-h-screen flex flex-col">
        {auth ? (
          <CommonLayout profile={profile}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/submission" element={<Submission />} />
              <Route path="/question-rubric-setup" element={<QuestionRubricSetup />} />
              <Route path="/student-reports" element={<Test />} />
              <Route path="/test" element={<Test />} />
              <Route path="/result-generator" element={<Test />} />
              <Route path="/" element={<Login />} />
            </Routes>
          </CommonLayout>
        ) : (
          <Routes>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/auth/*" element={<Auth />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
export { showToast, showToast2, setLoading };
