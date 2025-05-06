/* TestForm.jsx */
import React, { useState, useEffect } from 'react';
import '../../../styles/test.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { fetchSubjects, fetchQuestions } from '../../../api/questions';

function truncateLatex(latex, maxLen = 80) {
  const clean = latex.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + '...' : clean;
}
  
export default function TestForm({ onSubmit, onCancel, loading = false }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subjects when component mounts
  useEffect(() => {
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setError(null);
      try {
        const data = await fetchSubjects();
        setSubjects(data);
        // Set default subject if available
        if (data.length > 0) {
          setSubjectId(data[0].id);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError('Failed to load subjects. Please try again.');
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, []);

  // Fetch questions when subject changes
  useEffect(() => {
    if (!subjectId) return;

    const loadQuestions = async () => {
      setLoadingQuestions(true);
      setError(null);
      try {
        const data = await fetchQuestions(subjectId);
        setAvailableQuestions(data);
        // Clear selected questions when subject changes
        setSelectedQuestionIds([]);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [subjectId]);

  const handleSubjectChange = e => {
    setSubjectId(e.target.value);
  };

  const toggleQuestion = id => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Test name is required');
      return;
    }

    if (!subjectId) {
      setError('Please select a subject');
      return;
    }

    onSubmit({
      name,
      description,
      subject: subjectId,
      questions: selectedQuestionIds
    });
  };

  return (
    <div className="ts-backdrop">
      <div className="ts-form">
        <h2>Create New Test</h2>
        
        {error && (
          <div className="error-message mb-3 p-2 text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label>Test Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Enter test name"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter test description"
            disabled={loading}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Subject</label>
          {loadingSubjects ? (
            <div className="loading-indicator">Loading subjects...</div>
          ) : (
            <select 
              value={subjectId} 
              onChange={handleSubjectChange}
              disabled={loading || subjects.length === 0}
            >
              {subjects.length === 0 && <option value="">No subjects available</option>}
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <label>Select Questions</label>
        {loadingQuestions ? (
          <div className="loading-indicator">Loading questions...</div>
        ) : (
          <div className="ts-questions-list">
            <MathJaxContext>
              {availableQuestions.length === 0 ? (
                <div className="empty-message p-2 text-gray-500">
                  No questions available for this subject
                </div>
              ) : (
                availableQuestions.map(q => (
                  <div
                    key={q.id}
                    className={`ts-qlist-item ${selectedQuestionIds.includes(q.id) ? 'selected' : ''}`}
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <MathJax dynamic>
                      {`\\(${truncateLatex(q.question_text, 80)}\\)`}
                    </MathJax>
                  </div>
                ))
              )}
            </MathJaxContext>
          </div>
        )}
        
        <div className="ts-form-buttons">
          <button 
            className="btn btn-green" 
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Test'}
          </button>
          <button 
            className="btn btn-gray" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
