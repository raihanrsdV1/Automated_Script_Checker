/* QuestionDialog.jsx */
import React from 'react';
import { X } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';
import '../../../styles/QuestionRubric.css';

export default function QuestionDialog({ data, onClose, onEdit }) {
  // Extract subject name
  const subjectName = data.subject_name || data.subject || 'Unknown Subject';
  
  // Calculate total marks
  const totalMarks = data.total_marks ||
    (data.rubrics && data.rubrics.length > 0 
      ? data.rubrics.reduce((sum, r) => sum + parseFloat(r.marks || 0), 0)
      : data.marks || 0);
  
  return (
    <div className="qr-dialog-backdrop" onClick={onClose}>
      <div className="qr-dialog" onClick={e => e.stopPropagation()}>
        <button className="qr-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="qr-dialog-content">
          <div className="dialog-header">
            <div className="subject-badge">{subjectName}</div>
            <div className="marks-badge">Total Marks: {totalMarks}</div>
          </div>
          <h2 className="question-title">Question</h2>
          
          <div className="qr-dialog-question">
            <MathJax>{data.question_text}</MathJax>
          </div>
          
          {/* Support for old schema with single rubric */}
          {data.question_rubric && (
            <>
              <h3 className="rubric-title">Grading Rubric</h3>
              <div className="qr-dialog-rubric">
                <ReactMarkdown>{data.question_rubric}</ReactMarkdown>
              </div>
            </>
          )}
          
          {/* Support for new schema with multiple rubrics */}
          {data.rubrics && data.rubrics.length > 0 && (
            <>
              <h3 className="rubric-title">Grading Rubrics</h3>
              {data.rubrics.map((rubric, index) => (
                <div key={index} className="qr-dialog-rubric-item">
                  <div className="rubric-item-header">
                    <h4>Rubric Item #{rubric.serial_number}</h4>
                    <span className="rubric-marks">Marks: {rubric.marks}</span>
                  </div>
                  <div className="qr-dialog-rubric">
                    <ReactMarkdown>{rubric.rubric_text}</ReactMarkdown>
                  </div>
                </div>
              ))}
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