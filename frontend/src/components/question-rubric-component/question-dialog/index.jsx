/* QuestionDialog.jsx */
import React from 'react';
import { X } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';
import '../../../styles/QuestionRubric.css';

export default function QuestionDialog({ data, onClose, onEdit }) {
  // Extract subject name
  const subjectName = data.subject_name || data.subject || 'Unknown Subject';
  
  return (
    <div className="qr-dialog-backdrop" onClick={onClose}>
      <div className="qr-dialog" onClick={e => e.stopPropagation()}>
        <button className="qr-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="qr-dialog-content">
          <div className="dialog-header">
            <div className="subject-badge">{subjectName}</div>
            {data.marks && <div className="marks-badge">Marks: {data.marks}</div>}
          </div>
          <h2 className="question-title">Question</h2>
          
          <div className="qr-dialog-question">
            <MathJax>{data.question_text}</MathJax>
          </div>
          
          {data.question_rubric && (
            <>
              <h3 className="rubric-title">Grading Rubric</h3>
              <div className="qr-dialog-rubric">
                <ReactMarkdown>{data.question_rubric}</ReactMarkdown>
              </div>
            </>
          )}
          
          {onEdit && (
            <div className="qr-dialog-actions">
              <button className="btn btn-blue" onClick={() => onEdit(data)}>
                Edit Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}