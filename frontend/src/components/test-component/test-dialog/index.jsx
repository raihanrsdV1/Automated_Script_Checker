/* TestDialog.jsx */
import React, { useState, useEffect } from 'react';
import '../../../styles/test.css';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import { fetchTestById } from '../../../api/tests';
import { fetchQuestions } from '../../../api/questions';

export default function TestDialog({ data, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Fetch detailed test data when the dialog opens
  useEffect(() => {
    const loadTestDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the full test details
        const testDetails = await fetchTestById(data.id);
        setTest(testDetails);
        
        // Questions are included in the response
        if (testDetails.questions && testDetails.questions.length > 0) {
          setQuestions(testDetails.questions);
        }
      } catch (err) {
        console.error('Error loading test details:', err);
        setError('Failed to load test details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTestDetails();
  }, [data.id]);

  return (
    <div className="ts-backdrop">
      <div className="ts-dialog">
        <button className="ts-close" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="loading-indicator p-4 text-center">
            Loading test details...
          </div>
        ) : error ? (
          <div className="error-message p-3 my-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        ) : (
          <>
            <h2>{test?.name || data.name}</h2>
            
            {test?.description && (
              <p className="test-description my-2 text-gray-600">
                {test.description}
              </p>
            )}
            
            <div className="test-metadata my-3">
              <p><strong>Subject:</strong> {test?.subject_name || data.subject}</p>
              <p><strong>Created:</strong> {new Date(test?.created_at).toLocaleDateString()}</p>
            </div>
            
            <h3>Questions in this test:</h3>
            
            {questions.length === 0 ? (
              <p className="no-questions p-3 text-gray-500">
                No questions have been added to this test yet.
              </p>
            ) : (
              <div className="ts-question-grid">
                <MathJaxContext>
                  {questions.map((q, index) => (
                    <div key={q.id} className="question-card p-3 border rounded my-2">
                      <div className="question-header flex justify-between mb-2">
                        <span className="question-number font-bold">Question {index + 1}</span>
                        <span className="question-marks text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {q.marks} marks
                        </span>
                      </div>
                      
                      <div className="question-text mb-2">
                        <MathJax>
                          {`\\(${q.question_text}\\)`}
                        </MathJax>
                      </div>
                      
                      {q.question_rubric && (
                        <div className="question-rubric text-sm text-gray-600 border-l-2 border-blue-200 pl-2">
                          <p className="font-medium">Rubric:</p>
                          <p>{q.question_rubric}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </MathJaxContext>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}