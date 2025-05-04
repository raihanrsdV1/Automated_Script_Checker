import React from 'react';
import '../../../styles/IllustrationSection.styles.css';
import login from "../../../assets/login.svg"

const IllustrationSection = ({altText,description}) => {
  return (
    <div className="illustration-section">
      <div className="description" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
          {description}
        </div>
      <div className="illustration-container">
      
        <img 
          src={login} 
          alt={altText}
          className="main-illustration"
        />
        
         
      </div>
    
    </div>
  );
};

IllustrationSection.defaultProps = {
   altText: 'Main Illustration',
  description: ''
};

export default IllustrationSection;

