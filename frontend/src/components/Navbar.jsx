import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">Exam System</Link>
        <div>
          {/* TODO: Add dynamic links based on auth state */}
          <Link to="/login" className="mr-4">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/user-dashboard" className="ml-4">User Dashboard</Link>
          <Link to="/rechecker-dashboard" className="ml-4">Rechecker Dashboard</Link>
          <Link to="/question-rubric-setup" className="ml-4">Question Setup</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;