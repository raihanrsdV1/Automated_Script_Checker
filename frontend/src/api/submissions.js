/* API functions for submissions */
import axios from 'axios';
import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.BASE_URL;

// Set up axios interceptor to add auth token
axios.interceptors.request.use(
  config => {
    // Get the real token from localStorage
    const token = localStorage.getItem('token');
    
    // Add Authorization header to all API requests if token exists
    if (token && config.url && config.url.includes('/api/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Fetch all submissions for the current user
export const fetchUserSubmissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/submissions/user`);
    return response.data.submissions || [];
  } catch (error) {
    // console.error('Error fetching user submissions:', error);
    // throw new Error('Failed to fetch user submissions');
  }
};

// Fetch submissions for a specific test
export const fetchTestSubmissions = async (testId) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/test/${testId}`);
    return response.data.submissions || [];
  } catch (error) {
    console.error(`Error fetching submissions for test ${testId}:`, error);
    throw new Error('Failed to fetch test submissions');
  }
};

// Fetch a specific submission by ID
export const fetchSubmission = async (submissionId) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching submission ${submissionId}:`, error);
    throw new Error('Failed to fetch submission');
  }
};

// Create a new test submission (for answering all questions in a test)
export const submitTestAnswers = async (testId, answers) => {
  try {
    const response = await axios.post(`${API_URL}/submissions/test`, {
      test_id: testId,
      answers: answers
    });
    return response.data;
  } catch (error) {
    console.error(`Error submitting answers for test ${testId}:`, error);
    throw new Error('Failed to submit test answers');
  }
};

// Create a new submission
export const createSubmission = async (questionId, questionSetId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question_id', questionId);
    formData.append('question_set_id', questionSetId);
    
    const response = await axios.post(`${API_URL}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw new Error('Failed to create submission');
  }
};

// Create multiple submissions at once
export const createBatchSubmissions = async (submissions, questionSetId) => {
  try {
    // First, calculate total size to warn if it's too large
    const totalSizeBytes = submissions.reduce((total, sub) => total + (sub.file?.size || 0), 0);
    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    
    // Warn if total size is large but still attempt the upload
    if (totalSizeMB > 30) {
      console.warn(`Large upload detected: ${totalSizeMB.toFixed(2)}MB total. This may cause browser performance issues.`);
    }

    const formData = new FormData();
    
    // Add each file with a unique key
    submissions.forEach(submission => {
      if (submission.file) {
        // Use a modified file name to avoid name collisions
        const uniqueFileName = `${submission.questionId}_${Date.now()}_${submission.file.name.replace(/\s+/g, '_')}`;
        formData.append('files', submission.file, uniqueFileName);
        
        // Store the unique filename as the file_key
        submission.fileKey = uniqueFileName;
      }
    });
    
    // Create batch data structure
    const batchData = submissions.map(submission => ({
      question_id: submission.questionId,
      file_key: submission.fileKey
    }));
    
    // Add the batch data as a JSON string
    formData.append('batch_data', JSON.stringify(batchData));
    
    // Add question set ID if provided
    if (questionSetId) {
      formData.append('question_set_id', questionSetId);
    }
    
    // Set a longer timeout for larger uploads
    const response = await axios.post(`${API_URL}/submissions/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for larger uploads
      onUploadProgress: (progressEvent) => {
        // Implement progress tracking
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    // Handle the response which now returns processing status
    return {
      submissions: response.data.submissions,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error creating batch submissions:', error);
    
    // Enhanced error reporting
    if (error.response) {
      if (error.response.status === 413) {
        throw new Error('Files too large for the server to handle. Please reduce file sizes.');
      } else if (error.response.status === 400 && error.response.data?.detail?.includes('Too many files')) {
        throw new Error(error.response.data.detail);
      } else if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timed out. Please try with smaller files or a better connection.');
    }
    
    throw error;
  }
};

// Request a recheck for a submission
export const requestRecheck = async (submissionId, issueDetail) => {
  try {
    const response = await axios.post(`${API_URL}/submissions/recheck`, {
      submission_id: submissionId,
      issue_detail: issueDetail
    });
    return response.data;
  } catch (error) {
    console.error(`Error requesting recheck for submission ${submissionId}:`, error);
    throw new Error('Failed to request recheck');
  }
};

// Evaluate a submitted answer
export const evaluateSubmission = async (submissionId) => {
  try {
    const response = await axios.post(`${API_URL}/submissions/evaluate`, {
      submission_id: submissionId
    });
    return response.data;
  } catch (error) {
    console.error(`Error evaluating submission ${submissionId}:`, error);
    throw new Error('Failed to evaluate submission');
  }
};

// Upload PDF to Firebase (this will be used within createSubmission)
export const uploadPDFToFirebase = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/submissions/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF to Firebase:', error);
    throw new Error('Failed to upload PDF');
  }
};

// Get test results for a specific submission
export const fetchTestResults = async (submissionId) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/${submissionId}/results`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching results for submission ${submissionId}:`, error);
    throw new Error('Failed to fetch test results');
  }
};