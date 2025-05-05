import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, House, Puzzle, ChartNoAxesCombined, Video, NotebookText, ChevronDown, FileCode2 } from 'lucide-react';
import '../../../styles/navbar.css';
import UserProfile from "../user-profile";
import brain from "../../../assets/logo.png";
import profile_new from "../../../assets/profile_new.svg";


const getActiveMenuItem = (pathname) => {
  if (pathname.includes('/user-dashboard')) return 'Dashboard';
  if (pathname.includes('/submission')) return 'Submission';
  if (pathname.includes('/student-reports')) return 'Reports';
  if (pathname.includes('/question-rubric-setup')) return 'Rubrics';
  if (pathname.includes('/result-generator')) return 'Result';
  if (pathname.includes('/test')) return 'Test';
  return 'None';
};

const getMenuIcon = (text) => {
  switch (text) {
    case 'Dashboard':
      return <House size={20} color="#bbbbbb" />;
    case 'Rubrics':
      return <Puzzle size={20} color="#bbbbbb" />;
    case 'Result':
      return <ChartNoAxesCombined size={20} color="#bbbbbb" />;
    case 'Submission':
      return <Video size={20} color="#bbbbbb" />;
    case 'Reports':
      return <NotebookText size={20} color="#bbbbbb" />;
    case 'Test':
      return <FileCode2 size={20} color="#bbbbbb" />;
    default:
      return null;
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

  const menuItems = [
    { text: "Dashboard", link: "/user-dashboard" },
    { text: "Submission", link: "/submission" },
    { text: "Test", link: "/test" },
    { text: "Reports", link: "/student-reports" },
    { text: "Rubrics", link: "/question-rubric-setup" },
    { text: "Result", link: "/result-generator" },
  ];

  const handleMenuClick = (link) => {
    navigate(link);
  };

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

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
            <span className="user-name">{profile ? profile.name : ""}</span>
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
            name={profile ? profile.name : "Elizabeth Olsen"}
            email={profile?.email || "elizabetholsen@gmail.com"}
            avatarUrl={profile ? profile.image : profile_new}
          />
        </div>
      )}
    </div>
  );
};

export default PrimaryNav;
