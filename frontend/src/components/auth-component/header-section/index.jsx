import React from 'react';
import '../../../styles/HeaderSection.css';
import logo from "../../../assets/logo.png"
const HeaderSection = () => {
  return (
    <div className="header-section">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="brand-container">
          <span className='brand-writing'>AutoTest</span>
        </div>
      </div>
      
      <div className="content-container">
        <h1 className="title">
          { "Journey to Efficiency Starts here"}
        </h1>
      </div>
    </div>
  );
};

HeaderSection.defaultProps = {
  title: "Your Journey to Greatness Starts here",
  description: ""
};

export default HeaderSection;

