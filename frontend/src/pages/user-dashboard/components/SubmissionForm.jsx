import { useState, useEffect } from 'react';
import { createSubmission, evaluateSubmission } from '../../../api/submissions';
import { Button, Alert, Progress, Tooltip } from 'antd';
import { 
  DeleteOutlined, 
  CheckCircleOutlined, 
  UploadOutlined, 
  FileTextOutlined, 
  FilePdfOutlined
} from '@ant-design/icons';

function SubmissionForm({ questionSetId, question, onSubmitSuccess, onFileChange, showSubmitButton = true }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  
  // Notify parent component when file changes
  useEffect(() => {
    if (onFileChange) {
      onFileChange(question.id, file);
    }
  }, [file, question.id, onFileChange]);
  
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
  
  // Function to reset the file selector
  const handleRemoveFile = () => {
    setFile(null);
    
    // Reset file input
    const fileInput = document.getElementById(`file-input-${question.id}`);
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Notify parent component
    if (onFileChange) {
      onFileChange(question.id, null);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="mb-3">
        <h4 className="font-semibold mb-1 text-lg">Question {question.order || "1"}</h4>
        
        {/* Simple question text display without MathJax */}
        <div className="text-sm bg-gray-50 p-4 rounded-md mb-2">
          <p>{question.question_text}</p>
        </div>
        
        {/* Simple display for question marks */}
        {question.marks && (
          <div className="text-xs text-gray-600 mt-1 mb-2">
            <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Marks: {question.marks}
            </span>
          </div>
        )}
      </div>
      
      {/* Submission success state */}
      {submissionId && success ? (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <CheckCircleOutlined className="text-green-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Your answer has been submitted successfully!</p>
              {!evaluationComplete && (
                <button
                  onClick={handleEvaluate}
                  className="mt-2 py-1.5 px-3 bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={isEvaluating}
                >
                  {isEvaluating ? 'Evaluating...' : 'Evaluate Submission'}
                </button>
              )}
            </div>
          </div>
          
          {evaluationComplete && (
            <div className="mt-2 text-blue-700">
              <p>Evaluation completed! Check the Submissions page to see results.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3">
          {/* File upload section */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF Answer
            </label>
            
            {file ? (
              <div className="border rounded-lg p-3 bg-green-50 border-green-200 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FilePdfOutlined className="text-red-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium truncate max-w-xs">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <label
                  htmlFor={`file-input-${question.id}`}
                  className="cursor-pointer block"
                >
                  <FileTextOutlined className="text-2xl text-gray-400 mb-1" />
                  <div className="text-sm mb-1">Click to upload PDF file</div>
                  <p className="text-xs text-gray-500">PDF files only, max 10MB</p>
                  <input
                    type="file"
                    id={`file-input-${question.id}`}
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting || success}
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* Error message display */}
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              <span>⚠️ {error}</span>
            </div>
          )}
          
          {/* Submit button */}
          {showSubmitButton && (
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!file || isSubmitting || success}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmissionForm;