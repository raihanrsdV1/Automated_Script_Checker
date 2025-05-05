import React, { useState, useEffect } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { Search, Plus } from 'lucide-react';
import '../../../styles/QuestionRubric.css';
import { fetchQuestions } from '../../../api/questions';

export default function AddQuestionToSetForm({ 
  questionSetId, 
  questionSetName, 
  subjectId,
  existingQuestions = [],
  onAdd, 
  onCancel,
  onCreateQuestion
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Fetch questions by subject
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Fetch questions from the API using the subject filter if available
        const questionData = await fetchQuestions(subjectId);
        
        // Filter out questions already in the set
        const existingIds = existingQuestions.map(q => q.id);
        const availableQuestions = questionData.filter(q => !existingIds.includes(q.id));
        
        setQuestions(availableQuestions);
        setFilteredQuestions(availableQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [subjectId, existingQuestions]);

  // Filter questions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuestions(questions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = questions.filter(q => 
      (q.question_text && q.question_text.toLowerCase().includes(query))
    );
    
    setFilteredQuestions(filtered);
  }, [searchQuery, questions]);

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  // Handle adding selected questions to the set
  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question to add.");
      return;
    }

    setLoading(true);
    try {
      await onAdd(selectedQuestions);
    } catch (error) {
      console.error("Error adding questions:", error);
      alert("Failed to add questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-form-backdrop">
      <div className="qr-form question-add-form">
        <h2>Add Questions to "{questionSetName}"</h2>
        
        <div className="form-header">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="btn btn-blue" 
            onClick={onCreateQuestion}
            title="Create a new question"
          >
            <Plus size={16} /> New Question
          </button>
        </div>

        <div className="questions-list">
          {loading ? (
            <div className="loading">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="no-results">
              {searchQuery ? 'No questions match your search.' : 'No questions available.'}
            </div>
          ) : (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                className={`question-item ${selectedQuestions.includes(question.id) ? 'selected' : ''}`}
                onClick={() => toggleQuestionSelection(question.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(question.id)}
                  onChange={() => toggleQuestionSelection(question.id)}
                />
                <div className="question-preview">
                  <MathJaxContext>
                    <MathJax dynamic>
                      {`\\(${question.question_text}\\)`}
                    </MathJax>
                  </MathJaxContext>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="form-footer">
          <div className="selection-info">
            {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="qr-form-buttons">
            <button
              className="btn btn-green"
              onClick={handleAddQuestions}
              disabled={loading || selectedQuestions.length === 0}
            >
              {loading ? 'Adding...' : 'Add Selected'}
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
    </div>
  );
}