/* SubmissionCard.jsx */
import React from 'react';
import '../../../styles/submissions.css';

export default function SubmissionCard({ data, onClick }) {
  return (
    <div className="sp-card" onClick={onClick}>
      <div className="sp-name">{data.testName}</div>
      <div className="sp-date">{data.date}</div>
      <div className={`sp-status ${data.status==='Submitted'? 'done':'pending'}`}>{data.status}</div>
    </div>
  );
}
