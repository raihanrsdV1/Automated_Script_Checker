import React, { useState, useEffect } from 'react';
import '../../../styles/RegForm.css';
import google from "../../../assets/google-icon.svg"
import fb from "../../../assets/facebook-icon.svg"
import { Eye, EyeOff, Mail} from 'lucide-react';
// import GoogleLogin from "react-google-login";
import { useNavigate } from 'react-router-dom';

// import {googleAuth, login} from "../../../action/auth";
import {showToast2} from "../../../App.jsx" ;
import { login as apiLogin } from "../../../api/auth.js";


const LoginForm = ({ onSubmit }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
}, []);


const loginClick = async () => {
  if (!email || !password) {
    showToast2("Please enter valid login and password", "error");
    return;
  }
  try {
    const { token, user_id, role } = await apiLogin({
      username: email,     // or req expects `username`
      password,
    });
    // store token however you prefer:
    localStorage.setItem("token", token);
    // maybe store user_id/role too…
    localStorage.setItem("user_id", user_id);
    localStorage.setItem("role", role);
    showToast2("Logged in!", "success");
    navigate("/user-dashboard");
  } catch (err) {
    showToast2(err.message, "error");
  }
};
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password });
    }
  };

    // const googleAuthComplete=res=>{
    //     //console.log(res)
    //     if(res.accessToken!=undefined) {
    //         googleAuth({access_token: res.accessToken}, dispatch,history,'login')
    //     }
    // }

  return (
    <div className="login-form">
      <div className="login-header">
        <h1>Hello Learner</h1>
        <p style={{width:"400px"}}>Let's login to your account and continue learning.</p>
      </div>

      <div className="social-buttons">
        {/* <GoogleLogin
          clientId="758809470086-3k19svqvd9nnkm89h8ck3ig6clj7qoq4.apps.googleusercontent.com"
          render={renderProps => (
            <button 
              onClick={renderProps.onClick} 
              disabled={renderProps.disabled} 
              className="social-button google"
            >
              <img src={google} alt="Google" className="social-icon" />
              <span>Sign in with Google</span>
            </button>
          )}
          onSuccess={googleAuthComplete}
          onFailure={googleAuthComplete}
          cookiePolicy={'single_host_origin'}
        /> */}
        <button className="social-button google">
          <img src={google} alt="Facebook" className="social-icon" />
          <span>Sign in with Google</span>
        </button>
        <button className="social-button facebook">
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
              showPassword?<Eye onClick={() => setShowPassword(!showPassword)} className='field-icon clickable' color="#aaaaaa" />:
                <EyeOff onClick={() => setShowPassword(!showPassword)} className='field-icon clickable' color="#aaaaaa" />
            }
          </div>
        </div>

        <button type="button" className="forgot-password" onClick={()=>navigate("/auth/forgot")}>
          Forgot Password?
        </button>
        
        <button type="submit" className="sign-in-button" onClick={loginClick}>
          Sign In
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
