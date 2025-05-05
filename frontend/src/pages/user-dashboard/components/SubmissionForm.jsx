import { useState } from 'react';
import { createSubmission, evaluateSubmission } from '../../../api/submissions';
import { MathJax } from 'better-react-mathjax';

function SubmissionForm({ questionSetId, question, onSubmitSuccess }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        // Check file size (limit to 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
          setFile(null);
          setError('File size exceeds 10MB limit. Please select a smaller PDF file.');
        } else {
          setFile(selectedFile);
          setError(null);
        }
      } else {
        setFile(null);
        setError('Please select a PDF file. Other file formats are not supported.');
      }
    }
  };
  
  const handleEvaluate = async () => {
    if (!submissionId) {
      setError('No submission to evaluate');
      return;
    }
    
    setIsEvaluating(true);
    setError(null);
    
    try {
      // Call the backend to evaluate the submission
      const result = await evaluateSubmission(submissionId);
      setEvaluationComplete(true);
      
      // Update parent component if needed
      if (onSubmitSuccess) {
        onSubmitSuccess(question.id, result, true);
      }
    } catch (err) {
      console.error('Error evaluating submission:', err);
      
      if (err.response) {
        setError(err.response.data?.detail || 'Failed to evaluate your submission. Please try again.');
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to evaluate your submission. Please try again.');
      }
    } finally {
      setIsEvaluating(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file to upload');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createSubmission(question.id, questionSetId, file);
      setSuccess(true);
      setFile(null);
      setSubmissionId(result.id);
      
      // Reset file input
      const fileInput = document.getElementById(`file-input-${question.id}`);
      if (fileInput) {
        fileInput.value = '';
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess(question.id, result);
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting answer:', err);
      
      // More specific error messages based on error type
      if (err.response) {
        if (err.response.status === 413) {
          setError('The PDF file is too large. Please upload a smaller file.');
        } else if (err.response.status === 400) {
          setError('Invalid submission format. Please make sure you are uploading a valid PDF file.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Authentication error. Please log in again and try once more.');
        } else {
          setError(err.response.data?.detail || 'Failed to submit your answer. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to submit your answer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h4 className="font-semibold mb-1 text-lg">Question {question.order || "1"}</h4>
        <div className="text-sm bg-gray-50 p-4 rounded-md mb-2">
          <MathJax>{question.question_text}</MathJax>
        </div>
        
        {question.question_rubric && (
          <div className="text-sm text-gray-600 mb-2 p-2 border-l-2 border-blue-200">
            <p className="font-medium mb-1">Rubric:</p>
            <p>{question.question_rubric}</p>
          </div>
        )}
        
        {question.marks && (
          <div className="text-xs text-gray-600 mt-1 mb-2">
            <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Marks: {question.marks}
            </span>
          </div>
        )}
      </div>
      
      {submissionId && success ? (
        <div className="mt-4">
          <div className="mb-3 text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-100">
            <p className="font-medium">Your answer has been submitted successfully!</p>
            <p>PDF has been uploaded. Click "Evaluate" to process your submission.</p>
          </div>
          
          {evaluationComplete ? (
            <div className="mb-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="font-medium">Evaluation completed!</p>
              <p>Your submission has been evaluated. Check the Submission History tab to see your results.</p>
            </div>
          ) : (
            <button
              onClick={handleEvaluate}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isEvaluating}
            >
              {isEvaluating ? 'Evaluating...' : 'Evaluate Submission'}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label htmlFor={`file-input-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF Answer
            </label>
            <input
              type="file"
              id={`file-input-${question.id}`}
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={isSubmitting || success}
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!file || isSubmitting || success}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>
      )}
    </div>
  );
}

export default SubmissionForm;