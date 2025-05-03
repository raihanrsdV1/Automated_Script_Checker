import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/login';
import Register from './pages/register';
import UserDashboard from './pages/user-dashboard';
import RecheckerDashboard from './pages/rechecker-dashboard';
import QuestionRubricSetup from './pages/question-rubric-setup';
import Test from './pages/test/index.jsx'; // Import the Test component
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/rechecker-dashboard" element={<RecheckerDashboard />} />
            <Route path="/question-rubric-setup" element={<QuestionRubricSetup />} />
            <Route path="/test" element={<Test />} /> {/* Add the test route */}
            <Route path="/" element={<Login />} /> {/* Default route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;