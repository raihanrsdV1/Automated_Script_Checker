import React from 'react';
import { MathJax } from 'better-react-mathjax';
import '../../../styles/QuestionRubric.css';

export default function QuestionCard({ data, onClick }) {
  // Use the subject_name from the data that now comes from our backend
  const subjectName = data.subject_name || 'Unknown Subject';
  
  // Calculate total marks by summing all rubric items
  const totalMarks = data.total_marks || 
    (data.rubrics && data.rubrics.length > 0 
      ? data.rubrics.reduce((sum, r) => sum + parseFloat(r.marks || 0), 0)
      : 0);
  
  // Count the number of rubric items
  const rubricCount = data.rubrics?.length || 0;
  
  return (
    <div className="qr-card" onClick={() => onClick(data)}>
      <div className="qr-subject">{subjectName}</div>
      <div className="qr-question truncate-text">
        <MathJax>{data.question_text}</MathJax>
      </div>
      <div className="qr-marks">
        Total Marks: {totalMarks} | Rubric Items: {rubricCount}
      </div>
    </div>
  );
}