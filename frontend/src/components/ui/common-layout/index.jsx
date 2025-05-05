import React, { useState, useEffect } from 'react';
import PrimaryNav from '../navbar';
import { getCurrentUser } from '../../../api/auth';

const CommonLayout = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    email: "Loading..."
  });

  useEffect(() => {
    // Fetch user profile information when the component mounts
    const fetchUserProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUserProfile({
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email || userData.username
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Keep the default loading state or set a fallback
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Primary Navigation */}
      <div style={{ width: '100%', height: '60px' }}>
        <PrimaryNav profile={userProfile} />
      </div>
      
      {children}
    </div>
  );
};

export default CommonLayout;