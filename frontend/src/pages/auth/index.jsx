import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import '../../styles/generic.css';
import '../../styles/auth.css';

import HeaderSection from '../../components/auth-component/header-section';
import IllustrationSection from '../../components/auth-component/illustration-section';
import LoginForm from '../../components/auth-component/login-form';
import RegForm from '../../components/auth-component/reg-form';

const Auth = () => {
  return (
    <div className="main-layout">
      <div className="left-section">
        <HeaderSection />
        <IllustrationSection />
      </div>
      <div className="right-section">
        <Routes>
          {/* these paths are relative to the parent /auth/* route */}
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegForm />} />

          {/* redirect /auth → /auth/login */}
          <Route index element={<Navigate to="login" replace />} />

          {/* catch-all under /auth/* */}
          <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Auth;
