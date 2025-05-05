import React from 'react';
import '../../../styles/UserProfile.css';
import { LogOut } from 'lucide-react';
import profile from "../../../assets/profile.png";
import { logout } from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import { showToast2 } from "../../../App";

const UserProfile = ({ 
  name,
  email,
  avatarUrl,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout function to clear tokens and localStorage
      await logout();
      showToast2("Logged out successfully", "success");
      // Force page reload to update authentication state
      navigate("/auth/login");
      // This will trigger the auth check in App.jsx and redirect to login
    } catch (error) {
      showToast2("Error logging out", "error");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="user-info">
        <div className="avatar">
          <img src={profile} alt="User avatar" />
        </div>
        <div className="text-container">
          <div className="name">{name}</div>
          <div className="email">{email}</div>
        </div>
      </div>
      
      <button className="logout-button" onClick={handleLogout}>
        <LogOut color="#777777" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default UserProfile;

