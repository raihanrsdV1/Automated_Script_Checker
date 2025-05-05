import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { ArrowLeft, Edit, Plus, Trash } from 'lucide-react';
import '../../../styles/QuestionRubric.css';

export default function QuestionSetDetail({ 
  questionSet, 
  onBack, 
  onEdit, 
  onAddQuestion,
  onRemoveQuestion 
}) {
  const { id, name, description, subject_name, questions = [] } = questionSet;
  
  // Use subject_name with a fallback
  const displaySubjectName = subject_name || questionSet.subject || 'Unknown Subject';

  return (
    <div className="question-set-detail">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        
        <h2>{name}</h2>
        
        <div className="subject-badge">{displaySubjectName}</div>
      </div>

      <div className="detail-subheader">
        <p className="description">{description || 'No description provided'}</p>
        
        <div className="action-buttons">
          <button 
            className="btn btn-blue" 
            onClick={() => onEdit(id)}
            title="Edit question set details"
          >
            <Edit size={16} />
          </button>
          
          <button 
            className="btn btn-green" 
            onClick={() => onAddQuestion(id)}
            title="Add questions to set"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="questions-container">
        <h3>Questions in this Set ({questions.length})</h3>
        
        {questions.length === 0 ? (
          <div className="no-questions">
            This question set has no questions yet. Click "Add Questions" to add some.
          </div>
        ) : (
          <div className="questions-list">
            {questions.map((question, index) => (
              <div key={question.id} className="question-list-item">
                <div className="question-order">
                  {index + 1}.
                </div>
                
                <div className="question-content">
                  <MathJaxContext>
                    <MathJax dynamic>
                      {`\\(${question.question_text}\\)`}
                    </MathJax>
                  </MathJaxContext>
                  
                  <div className="rubric-preview">
                    <strong>Rubric:</strong> {question.question_rubric}
                  </div>
                </div>
                
                <button 
                  className="remove-question-btn" 
                  onClick={() => {
                    if (window.confirm('Remove this question from the set?')) {
                      onRemoveQuestion(question.id);
                    }
                  }}
                  title="Remove question from set"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}