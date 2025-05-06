import React, { useState, useEffect } from 'react';
import '../../../styles/QuestionRubric.css';
import { fetchSubjects } from '../../../api/questions';
import { AlertCircle, Loader } from 'lucide-react';

export default function QuestionSetForm({ questionSetData = null, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjectsData, setSubjectsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState('');

  // Get the current user ID from localStorage (for teacher_id)
  const getUserId = () => {
    try {
      const userId = localStorage.getItem('user_id');
      console.log('Current user ID for question set creation:', userId);
      return userId || null;
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
      return null;
    }
  };

  // Load subjects from API
  useEffect(() => {
    const getSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const data = await fetchSubjects();
        setSubjectsData(data);
        
        // If editing an existing question set, set the subject
        if (questionSetData && questionSetData.subject_id) {
          setSubjectId(questionSetData.subject_id);
        } else if (data.length > 0) {
          // Default to first subject if creating new question set
          setSubjectId(data[0].id);
        }

        setLoadingSubjects(false);
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError('Failed to load subjects. Please try again.');
        setLoadingSubjects(false);
      }
    };

    getSubjects();
  }, []);

  // If we're editing an existing question set, populate the form
  useEffect(() => {
    if (questionSetData) {
      setName(questionSetData.name || '');
      setDescription(questionSetData.description || '');
      if (questionSetData.subject_id) {
        setSubjectId(questionSetData.subject_id);
      }
    }
  }, [questionSetData]);

  const handleSubmit = async () => {
    // Validate inputs
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!subjectId) {
      setError('Please select a subject');
      return;
    }

    // Get teacher_id
    const teacherId = getUserId();
    if (!teacherId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSubmit({
        name,
        description,
        subject_id: subjectId,
        teacher_id: teacherId
      });
      
      // Form will be closed by the parent component after successful submission
    } catch (err) {
      console.error('Error submitting question set:', err);
      setError('Failed to save question set. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="qr-form-backdrop">
      <div className="qr-form">
        <h2>{questionSetData ? 'Edit Question Set' : 'Create Question Set'}</h2>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter question set name"
          disabled={loading}
        />
        
        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter question set description"
          disabled={loading}
        />
        
        <label>Subject</label>
        {loadingSubjects ? (
          <div className="loading-indicator">
            <Loader size={16} className="spinner" />
            <span>Loading subjects...</span>
          </div>
        ) : (
          <select 
            value={subjectId} 
            onChange={e => setSubjectId(e.target.value)} 
            disabled={loading}
          >
            {subjectsData.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        
        <div className="qr-form-buttons">
          <button 
            className="btn btn-green" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="spinner" />
                <span>Saving...</span>
              </>
            ) : questionSetData ? 'Update' : 'Create'}
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