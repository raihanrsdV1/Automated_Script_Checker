import React, { useState, useEffect } from 'react';
import '../../../styles/LoginForm.css';
import google from "../../../assets/google-icon.svg"
import fb from "../../../assets/facebook-icon.svg"
import { Eye, EyeOff, Mail} from 'lucide-react';
import { showToast } from "../../../App";
import { register as apiRegister } from "../../../api/auth"; 
import { useNavigate } from 'react-router-dom';

const RegForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    regClick();
  };

  const regClick = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Form validation
    if (!firstName || !lastName || !email || !password || !password2) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    if (password !== password2) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Create registration payload
      const payload = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: "2000-01-01", // Default date for now
        username: email, // Using email as username
        email,
        phone: "",
        password,
        role,
      };
    
      const { message } = await apiRegister(payload);
      showToast(message, "success");
      navigate("/auth/login");
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-header">
        <h1>Create Account</h1>
        <p style={{width:"400px"}}>Join us and start your learning journey today.</p>
      </div>

      <div className="social-buttons">
        <button className="social-button google" disabled>
          <img src={google} alt="Google" className="social-icon" />
          <span>Sign up with Google</span>
        </button>
        <button className="social-button facebook" disabled>
          <img src={fb} alt="Facebook" className="social-icon" />
          <span>Sign up with Facebook</span>
        </button>
      </div>

      <div className="divider">
        <div className="line"></div>
        <span>or Sign up with email</span>
        <div className="line"></div>
      </div>

      <form onSubmit={handleSubmit} className="login-form-fields">
        <div className="input-group">
          <label htmlFor="firstName">First Name</label>
          <div className="input-field">
            <input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="lastName">Last Name</label>
          <div className="input-field">
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
      
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-field">
            <input
              id="email"
              type="email"
              placeholder="ex: johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Mail absoluteStrokeWidth strokeWidth={2.25} className='field-icon' color="#aaaaaa" />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="*************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {
              showPassword ?
                <Eye onClick={() => setShowPassword(!showPassword)} className='field-icon clickable' color="#aaaaaa" /> :
                <EyeOff onClick={() => setShowPassword(!showPassword)} className='field-icon clickable' color="#aaaaaa" />
            }
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-field">
            <input
              id="confirmPassword"
              type={showPassword2 ? "text" : "password"}
              placeholder="*************"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
            {
              showPassword2 ?
                <Eye onClick={() => setShowPassword2(!showPassword2)} className='field-icon clickable' color="#aaaaaa" /> :
                <EyeOff onClick={() => setShowPassword2(!showPassword2)} className='field-icon clickable' color="#aaaaaa" />
            }
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="role">User Role</label>
          <div className="input-field">
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="sign-in-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="signup-section">
        <p>Already Have an Account?</p>
        <button className="sign-up-button" onClick={()=>navigate("/auth/login")}>Sign In</button>
      </div>
    </div>
  );
};

export default RegForm;
