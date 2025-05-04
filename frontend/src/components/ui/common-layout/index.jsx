import React from 'react';
import PrimaryNav from '../navbar';

const CommonLayout = ({ children, profile }) => {
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Primary Navigation */}
      <div style={{ width: '100%', height: '60px' }}>
        <PrimaryNav profile={profile}  />
      </div>
      
      {children}
    </div>
  );
};

export default CommonLayout;