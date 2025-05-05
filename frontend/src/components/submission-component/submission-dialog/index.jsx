/* SubmissionDialog.jsx */
import React, { useState } from 'react';
import '../../../styles/submissions.css';

export default function SubmissionDialog({ data, onClose }) {
  const [files, setFiles] = useState([]);

  const handleFile = e => setFiles([...files, ...e.target.files]);
  const handleSubmitAll = () => {
    // TODO: connect to backend
    console.log('Submitting all files', files);
    onClose();
  };

  return (
    <div className="sp-backdrop">
      <div className="sp-dialog">
        <button className="sp-close" onClick={onClose}>×</button>
        <h2>{data.testName}</h2>
        <p>Please upload PDFs for each question. Then you may also upload a single combined PDF.</p>
        <div className="sp-questions-list">
          {[1,2,3].map(qId => (
            <div key={qId} className="sp-question-item">
              <strong>Question {qId}</strong>
              <input type="file" accept="application/pdf" onChange={handleFile} />
            </div>
          ))}
        </div>
        <div className="sp-combined-upload">
          <label>Combined PDF (with 1-page gaps):</label>
          <input type="file" accept="application/pdf" onChange={handleFile} />
        </div>
        <button className="btn btn-green" onClick={handleSubmitAll}>Submit All</button>
      </div>
    </div>
  );
}