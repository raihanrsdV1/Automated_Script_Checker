import React from 'react';
import { MathJax } from 'better-react-mathjax';
import '../../../styles/QuestionRubric.css';

export default function QuestionCard({ data, onClick }) {
  // Use the subject_name from the data that now comes from our backend
  const subjectName = data.subject_name || 'Unknown Subject';
  
  return (
    <div className="qr-card" onClick={() => onClick(data)}>
      <div className="qr-subject">{subjectName}</div>
      <div className="qr-question truncate-text">
        <MathJax>{data.question_text}</MathJax>
      </div>
      <div className="qr-marks">Marks: {data.marks}</div>
    </div>
  );
}