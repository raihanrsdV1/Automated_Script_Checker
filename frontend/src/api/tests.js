/* API functions for tests (question sets used for testing) */
import axios from 'axios';
import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.BASE_URL;

// Test (Question Set) endpoints - using the question set APIs directly
export const fetchTests = async (subjectId = null) => {
  try {
    let url = `${API_URL}/questions/sets`;
    if (subjectId) {
      url += `?subject_id=${subjectId}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw new Error('Failed to fetch tests');
  }
};

export const fetchTestById = async (testId) => {
  try {
    const response = await axios.get(`${API_URL}/questions/sets/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching test ${testId}:`, error);
    throw new Error('Failed to fetch test');
  }
};

export const createTest = async (testData) => {
  try {
    const response = await axios.post(`${API_URL}/questions/sets`, testData);
    return response.data;
  } catch (error) {
    console.error('Error creating test:', error);
    throw new Error('Failed to create test');
  }
};

export const updateTest = async (testId, testData) => {
  try {
    const response = await axios.put(`${API_URL}/questions/sets/${testId}`, testData);
    return response.data;
  } catch (error) {
    console.error(`Error updating test ${testId}:`, error);
    throw new Error('Failed to update test');
  }
};

export const deleteTest = async (testId) => {
  try {
    const response = await axios.delete(`${API_URL}/questions/sets/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting test ${testId}:`, error);
    throw new Error('Failed to delete test');
  }
};

// Test Question Mapping endpoints - using question set mapping APIs
export const addQuestionsToTest = async (testId, questionIds) => {
  try {
    const response = await axios.post(`${API_URL}/questions/sets/${testId}/questions`, {
      question_ids: questionIds
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding questions to test ${testId}:`, error);
    throw new Error('Failed to add questions to test');
  }
};

export const removeQuestionFromTest = async (testId, questionId) => {
  try {
    const response = await axios.delete(`${API_URL}/questions/sets/${testId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing question ${questionId} from test ${testId}:`, error);
    throw new Error('Failed to remove question from test');
  }
};

// Test submission endpoints
export const submitTestAnswers = async (testId, answers) => {
  try {
    const formData = new FormData();
    
    // Add each answer file to the form data
    Object.entries(answers).forEach(([questionId, file]) => {
      formData.append('file', file);
      formData.append('question_id', questionId);
      formData.append('question_set_id', testId);
    });
    
    const response = await axios.post(`${API_URL}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error submitting answers for test ${testId}:`, error);
    throw new Error('Failed to submit test answers');
  }
};

export const fetchTestResults = async (submissionId) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/${submissionId}/results`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching results for submission ${submissionId}:`, error);
    throw new Error('Failed to fetch test results');
  }
};

// Simplifying by removing these features based on your requirements
// No need to implement assignment, publishing, unpublishing features as mentioned