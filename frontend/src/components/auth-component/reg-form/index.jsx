import React, { useState,useEffect } from 'react';
import '../../../styles/LoginForm.css';
import google from "../../../assets/google-icon.svg"
import fb from "../../../assets/facebook-icon.svg"
import { Eye, EyeOff, Mail} from 'lucide-react';
// import {register} from "../../../action/auth";
import {showToast2} from "../../../App";
// import {googleAuth} from "../../../action/auth";
import { register as apiRegister } from "../../../api/auth"; 

// import GoogleLogin from "react-google-login";
import { useNavigate } from 'react-router-dom';

const RegForm = () => {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole]         = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
}, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password });
    }
  };
//    const googleAuthComplete=res=>{
//       //console.log(res)
//       if(res.accessToken!=undefined) {
//           googleAuth({access_token: res.accessToken}, dispatch,history,'signup')
//       }
//   }
  

  const regClick=async()=>{

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email.length===0 || password.length===0 || password2.length===0)
      showToast('Please fill up the fields properly...')
    else if(!emailRegex.test(email)) {
      showToast('Please enter a valid email address')
    }
    else{
      if(password!==password2)
        showToast('Please re-enter the password correctly')
      else{
        // register({
      
        //   email:email,
        //   password:password
        // },dispatch,history,onRegisterSuccess)

        // register logic here

        // build payload with dummy data
    const payload = {
        first_name: `User${Math.floor(Math.random()*1000)}`,
        last_name:  `Demo${Math.floor(Math.random()*1000)}`,
        date_of_birth: "2000-01-01",
        username:   `user_${Date.now()}`,
        email,
        phone:      "",
        password,
        role,
      };
  
      try {
        const { message } = await apiRegister(payload);
        showToast2(message, "success");
        navigate("/auth/login");
      } catch (err) {
        showToast2(err.message, "error");
      }
        
      }
    }
}
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
              <span>Sign up with Google</span>
            </button>
          )}
          onSuccess={googleAuthComplete}
          onFailure={googleAuthComplete}
          cookiePolicy={'single_host_origin'}
        /> */}
         <button className="social-button google">
          <img src={google} alt="Google" className="social-icon" />
          <span>Sign up with Google</span>
        </button>
        <button className="social-button facebook">
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
        <div className="input-group">
          <label htmlFor="Confirm_password">Confirm Password</label>
          <div className="input-field">
            <input
              id="re-password"
              type={showPassword2 ? "text" : "password"}
              placeholder="*************"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
            {
              showPassword2?<Eye onClick={() => setShowPassword2(!showPassword2)} className='field-icon clickable' color="#aaaaaa" />:
                <EyeOff onClick={() => setShowPassword2(!showPassword2)} className='field-icon clickable' color="#aaaaaa" />
            }
            
          </div>
        </div>

        <div className="input-group">
          <label>Role</label>
          <div className="input-field">
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
        </div>

        <button type="submit" className="sign-in-button" onClick={regClick}>
          Sign Up
        </button>
      </form>

      <div className="signup-section">
        <p>Already Have an Account?</p>
        <button className="sign-up-button" onClick={()=>navigate("/auth/login")}>Sign In</button>
      </div>
    </div>
  );
};

RegForm.defaultProps = {
  onSubmit: () => {},
  initialEmail: '',
  initialPassword: '',
  allowSocialLogin: true,
  allowPasswordReset: true,
  allowSignUp: true
};

export default RegForm;
