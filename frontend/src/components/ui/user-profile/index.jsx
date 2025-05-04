import React from 'react';
import '../../../styles/UserProfile.css';
import { LogOut } from 'lucide-react';
import profile from "../../../assets/profile.png";

const UserProfile = ({ 
  name ,
  email ,
  avatarUrl ,
 
}) => {


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
      
      <button className="logout-button" onClick={()=> {
        // Handle logout logic here
      }}>
        <LogOut color="#777777" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default UserProfile;

