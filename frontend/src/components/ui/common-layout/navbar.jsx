import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, House, Puzzle, ChartNoAxesCombined, Video, NotebookText, ChevronDown, FileCode2, ClipboardCheck, BookOpen } from 'lucide-react';
import './style.css';
import UserProfile from "../user-profile";
import brain from "../../../assets/logo.png";
import profile_new from "../../../assets/profile_new.svg";

const getActiveMenuItem = (pathname) => {
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/tests')) return 'Tests';
  if (pathname.includes('/submissions')) return 'Submissions';
  if (pathname.includes('/rechecker')) return 'Rechecker';
  if (pathname.includes('/question-rubric-setup')) return 'Tests Manager';
  if (pathname.includes('/reports')) return 'Reports';
  return 'None';
};

const getMenuIcon = (text) => {
  switch (text) {
    case 'Dashboard':
      return <House size={20} color="#bbbbbb" />;
    case 'Tests Manager':
      return <Puzzle size={20} color="#bbbbbb" />;
    case 'Tests':
      return <BookOpen size={20} color="#bbbbbb" />;
    case 'Reports':
      return <ChartNoAxesCombined size={20} color="#bbbbbb" />;
    case 'Submissions':
      return <Video size={20} color="#bbbbbb" />;
    case 'Rechecker':
      return <ClipboardCheck size={20} color="#bbbbbb" />;
    default:
      return <NotebookText size={20} color="#bbbbbb" />;
  }
};

const MenuItem = ({ text, active, onClick }) => {
  return (
    <div onClick={onClick} className={active ? "menu-item-div active" : "menu-item-div"}>
      {getMenuIcon(text)}
      <span>{text}</span>
    </div>
  );
};

const PrimaryNav = ({ profile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeMenuItem = getActiveMenuItem(location.pathname);
  const [userRole, setUserRole] = useState('student');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  useEffect(() => {
    // Check if the role is stored in localStorage (for demo purposes)
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    } else {
      // Otherwise use the profile role or default to student
      setUserRole(profile?.role || 'student');
    }
  }, [profile]);

  // Define menu items based on user role
  const studentMenuItems = [
    { text: "Dashboard", link: "/dashboard" },
    { text: "Tests", link: "/tests" },
    { text: "Submissions", link: "/submissions" },
    { text: "Rechecker", link: "/rechecker" },
  ];

  const teacherMenuItems = [
    { text: "Dashboard", link: "/dashboard" },
    { text: "Tests Manager", link: "/question-rubric-setup" },
    { text: "Reports", link: "/reports" },
  ];

  // Select appropriate menu items based on role
  const menuItems = userRole === 'teacher' ? teacherMenuItems : studentMenuItems;

  const handleMenuClick = (link) => {
    navigate(link);
  };

  const handleRoleToggle = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    
    // Navigate to the appropriate dashboard based on the new role
    navigate('/dashboard');
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="main-container">
        {/* Logo Section */}
        <div className="logo-container">
          <img src={brain} alt="Logo" className="brain-logo" />
          <span className="brainlytic">AutoTest</span>
        </div>

        {/* Menu Items */}
        <div className="menu-item-container">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              text={item.text}
              active={activeMenuItem === item.text}
              onClick={() => handleMenuClick(item.link)}
            />
          ))}
        </div>

        {/* Right Section */}
        <div className="right-section-div">
          {/* Notification Bell */}
          <div className="notification-div">
            <div className="notification-inner-div" />
            <Bell size={20} color="#ffffff" />
          </div>

          {/* User Profile */}
          <div className="user-profile-div" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img className="user-profile-pic" src={profile ? profile.image : profile_new} alt="Profile" />
            <span className="user-name">{profile ? profile.name : "User"}</span>
            <span className="user-role">{userRole === 'teacher' ? 'Teacher' : 'Student'}</span>
            <ChevronDown 
              absoluteStrokeWidth
              size={18}
              strokeWidth={2.25}
              color={'#777777'}
              style={{
                transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease"
              }}
            />
          </div>
        </div>
      </div>

      {isProfileOpen && (
        <div style={{ position: "absolute", right: "12px", top: "60px", zIndex: "1000" }}>
          <UserProfile
            name={profile ? profile.name : "User"}
            email={profile?.email || "user@example.com"}
            avatarUrl={profile ? profile.image : profile_new}
            role={userRole}
            onRoleToggle={handleRoleToggle}
          />
        </div>
      )}
    </div>
  );
};

export default PrimaryNav;