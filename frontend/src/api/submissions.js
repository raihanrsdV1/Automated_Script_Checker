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