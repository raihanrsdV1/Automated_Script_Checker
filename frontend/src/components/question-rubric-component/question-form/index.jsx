/* QuestionForm.jsx */
import React, { useState, useEffect } from 'react'
import '../../../styles/QuestionRubric.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';
import { fetchSubjects } from '../../../api/questions';

export default function QuestionForm({ onSubmit, onCancel, initialData }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [subjectId, setSubjectId] = useState(initialData?.subject_id || '');
  const [question, setQuestion] = useState(initialData?.question_text || '');
  const [rubrics, setRubrics] = useState(initialData?.rubrics || [{ rubric_text: '', marks: '', serial_number: 1 }]);
  const [error, setError] = useState('');
  
  // Fetch subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const data = await fetchSubjects();
        setSubjects(data);
        // Set default subject if there are subjects and none is selected
        if (data.length && !subjectId) {
          setSubjectId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Failed to load subjects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSubjects();
  }, []);
  
  // Scroll to top when form opens
  useEffect(() => window.scrollTo(0, 0), []);
  
  // Get the current user ID from localStorage (for teacher_id)
  const getUserId = () => {
    try {
      const userId = localStorage.getItem('user_id');
      console.log('Current user ID for question creation:', userId);
      return userId || null;
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
      return null;
    }
  };
  
  // Handle adding a new rubric item
  const handleAddRubric = () => {
    setRubrics([
      ...rubrics,
      { 
        rubric_text: '', 
        marks: '', 
        serial_number: rubrics.length + 1 
      }
    ]);
  };
  
  // Handle removing a rubric item
  const handleRemoveRubric = (index) => {
    if (rubrics.length <= 1) {
      setError('At least one rubric item is required');
      return;
    }
    
    const updatedRubrics = rubrics.filter((_, i) => i !== index);
    
    // Recompute serial numbers
    const reorderedRubrics = updatedRubrics.map((item, i) => ({
      ...item,
      serial_number: i + 1
    }));
    
    setRubrics(reorderedRubrics);
  };
  
  // Handle changes to a rubric item
  const handleRubricChange = (index, field, value) => {
    const updatedRubrics = [...rubrics];
    updatedRubrics[index] = {
      ...updatedRubrics[index],
      [field]: field === 'marks' ? (value === '' ? '' : parseFloat(value)) : value
    };
    setRubrics(updatedRubrics);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!subjectId) {
      setError('Please select a subject');
      return;
    }
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    
    // Validate rubrics
    let isValid = true;
    const validatedRubrics = rubrics.map(rubric => {
      if (!rubric.rubric_text.trim()) {
        setError('All rubric items must have content');
        isValid = false;
      }
      
      if (!rubric.marks || isNaN(rubric.marks) || rubric.marks <= 0) {
        setError('All rubric items must have valid marks');
        isValid = false;
      }
      
      return {
        ...rubric,
        marks: parseFloat(rubric.marks) || 0
      };
    });
    
    if (!isValid) return;
    
    // Get the current user ID for teacher_id
    const teacherId = getUserId();
    console.log('Submitting question with teacher_id:', teacherId);
    
    // Pass data to parent component
    const questionData = {
      subject_id: subjectId,
      teacher_id: teacherId, // Include teacher_id if available
      question_text: question,
      rubrics: validatedRubrics
    };
    
    // If we have an initialData.id, we're editing
    if (initialData?.id) {
      questionData.id = initialData.id;
    }
    
    onSubmit(questionData);
  };
  
  if (loading) {
    return (
      <div className="qr-form-backdrop">
        <div className="qr-form">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-form-backdrop">
      <div className="qr-form">
        <h2>{initialData ? 'Edit Question' : 'Add New Question'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select 
              id="subject"
              value={subjectId} 
              onChange={e => setSubjectId(e.target.value)}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="question">Question (LaTeX)</label>
            <textarea 
              id="question"
              value={question} 
              onChange={e => setQuestion(e.target.value)}
              placeholder="Enter your question with LaTeX if needed"
              required
            />
          </div>
          
          {question && (
            <div className="qr-form-preview">
              <h4>Question Preview:</h4>
              <MathJaxContext>
                <MathJax>{question}</MathJax>
              </MathJaxContext>
            </div>
          )}
          
          <div className="rubrics-section">
            <h3>Rubrics</h3>
            <p className="rubric-help">Add one or more rubric items to define how this question will be evaluated.</p>
            
            {rubrics.map((rubric, index) => (
              <div key={index} className="rubric-item">
                <div className="rubric-header">
                  <h4>Rubric Item #{index + 1}</h4>
                  {rubrics.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-small btn-red"
                      onClick={() => handleRemoveRubric(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group marks-group">
                    <label htmlFor={`marks-${index}`}>Marks</label>
                    <input 
                      type="number" 
                      id={`marks-${index}`}
                      min="0.5" 
                      step="0.5"
                      value={rubric.marks} 
                      onChange={e => handleRubricChange(index, 'marks', e.target.value)}
                      placeholder="Enter marks"
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor={`rubric-${index}`}>Rubric Text (Markdown)</label>
                  <textarea 
                    id={`rubric-${index}`}
                    value={rubric.rubric_text} 
                    onChange={e => handleRubricChange(index, 'rubric_text', e.target.value)}
                    placeholder="Enter the grading criteria for this rubric item (supports markdown)"
                    required
                  />
                </div>
                
                {rubric.rubric_text && (
                  <div className="qr-form-preview rubric-preview">
                    <h5>Rubric Preview:</h5>
                    <ReactMarkdown>{rubric.rubric_text}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              className="btn btn-blue rubric-add-btn"
              onClick={handleAddRubric}
            >
              + Add Another Rubric Item
            </button>
            
            <div className="total-marks">
              <h4>Total Marks: {rubrics.reduce((sum, r) => sum + (parseFloat(r.marks) || 0), 0)}</h4>
            </div>
          </div>
          
          <div className="qr-form-buttons">
            <button type="submit" className="btn btn-green">
              {initialData ? 'Update' : 'Create'}
            </button>
            <button 
              type="button" 
              className="btn btn-gray" 
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
