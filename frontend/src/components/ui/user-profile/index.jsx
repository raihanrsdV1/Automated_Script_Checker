import React from 'react';
import { Button, Dropdown, Menu, Space, Switch, Typography } from 'antd';
import { LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import './style.css';

const { Text } = Typography;

const UserProfile = ({ name, email, avatarUrl, role, onRoleToggle }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  const handleRoleToggle = () => {
    const newRole = role === 'teacher' ? 'student' : 'teacher';
    if (onRoleToggle) {
      onRoleToggle(newRole);
    } else {
      // For demo purposes, just store the role in localStorage
      localStorage.setItem('userRole', newRole);
      window.location.reload();
    }
  };

  const menu = (
    <Menu className="profile-dropdown-menu">
      <div className="profile-header">
        <div className="avatar-container">
          <img 
            src={avatarUrl || 'https://via.placeholder.com/100'} 
            alt={name}
            className="profile-avatar" 
          />
        </div>
        <div className="profile-info">
          <Text strong>{name}</Text>
          <Text type="secondary">{email}</Text>
          <Text type="secondary">{role === 'teacher' ? 'Teacher' : 'Student'}</Text>
        </div>
      </div>
      
      <Menu.Divider />
      
      <Menu.Item key="profile" icon={<UserOutlined />}>
        My Profile
      </Menu.Item>
      
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Account Settings
      </Menu.Item>
      
      <Menu.Divider />
      
      <div className="role-toggle">
        <span>Switch to {role === 'teacher' ? 'Student' : 'Teacher'} View</span>
        <Switch 
          checked={role === 'teacher'} 
          onChange={handleRoleToggle}
          className="role-switch" 
        />
      </div>
      
      <Menu.Divider />
      
      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />} 
        danger 
        onClick={handleLogout}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown 
      overlay={menu} 
      trigger={['click']} 
      placement="bottomRight"
      arrow
      overlayClassName="profile-dropdown"
    >
      {/* This div is what gets clicked to open the dropdown */}
      <div className="profile-trigger">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="avatar-img" />
        ) : (
          <div className="avatar-placeholder">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </Dropdown>
  );
};

export default UserProfile;

