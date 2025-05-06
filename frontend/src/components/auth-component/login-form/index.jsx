import React, { useState, useEffect } from 'react';
import '../../../styles/RegForm.css';
import google from "../../../assets/google-icon.svg"
import fb from "../../../assets/facebook-icon.svg"
import { Eye, EyeOff, Mail} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from "../../../App.jsx";
import { login as apiLogin } from "../../../api/auth.js";

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loginClick = async () => {
    if (!email || !password) {
      showToast("Please enter valid email and password", "error");
      return;
    }
    
    try {
      setLoading(true);
      const { token, user_id, role } = await apiLogin({
        username: email,
        password,
      });
      
      // Store authentication data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("role", role);
      
      showToast("Successfully logged in!", "success");
      navigate("/user-dashboard");
    } catch (err) {
      showToast(err.message || "Login failed, please try again", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginClick();
  };

  return (
    <div className="login-form">
      <div className="login-header">
        <h1>Hello Learner</h1>
        <p style={{width:"400px"}}>Let's login to your account and continue learning.</p>
      </div>

      <div className="social-buttons">
        <button className="social-button google" disabled>
          <img src={google} alt="Google" className="social-icon" />
          <span>Sign in with Google</span>
        </button>
        <button className="social-button facebook" disabled>
          <img src={fb} alt="Facebook" className="social-icon" />
          <span>Sign in with Facebook</span>
        </button>
      </div>

      <div className="divider">
        <div className="line"></div>
        <span>or Sign In with email</span>
        <div className="line"></div>
      </div>

      <form onSubmit={handleSubmit} className="login-form-fields">
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

        <button type="button" className="forgot-password" onClick={()=>navigate("/auth/forgot")}>
          Forgot Password?
        </button>
        
        <button 
          type="submit" 
          className="sign-in-button" 
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="signup-section">
        <p>New Here?</p>
        <button className="sign-up-button" onClick={()=>navigate('/auth/register')}>Sign Up</button>
      </div>
    </div>
  );
};

LoginForm.defaultProps = {
  onSubmit: () => {},
  initialEmail: '',
  initialPassword: '',
  allowSocialLogin: true,
  allowPasswordReset: true,
  allowSignUp: true
};

export default LoginForm;
