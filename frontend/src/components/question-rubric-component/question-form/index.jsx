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
  const [rubric, setRubric] = useState(initialData?.question_rubric || '');
  const [marks, setMarks] = useState(initialData?.marks || '');
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
    
    if (!rubric.trim()) {
      setError('Please enter a rubric');
      return;
    }
    
    if (!marks || isNaN(marks) || marks <= 0) {
      setError('Please enter a valid number of marks');
      return;
    }
    
    // Pass data to parent component
    const questionData = {
      subject_id: subjectId,
      question_text: question,
      question_rubric: rubric,
      marks: parseFloat(marks)
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
          
          <div className="form-row">
            <div className="form-group marks-group">
              <label htmlFor="marks">Total Marks</label>
              <input 
                type="number" 
                id="marks" 
                min="1" 
                step="0.5"
                value={marks} 
                onChange={e => setMarks(e.target.value)}
                placeholder="Enter total marks"
                required 
              />
            </div>
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
          
          <div className="form-group">
            <label htmlFor="rubric">Rubric (Markdown)</label>
            <textarea 
              id="rubric"
              value={rubric} 
              onChange={e => setRubric(e.target.value)}
              placeholder="Enter the grading rubric (supports markdown)"
              required
            />
          </div>
          
          {rubric && (
            <div className="qr-form-preview">
              <h4>Rubric Preview:</h4>
              <ReactMarkdown>{rubric}</ReactMarkdown>
            </div>
          )}
          
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
