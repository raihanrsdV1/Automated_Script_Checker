/* API functions for questions and question sets */
import axios from 'axios';
import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.BASE_URL;

// Subject endpoints
export const fetchSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/subjects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error('Failed to fetch subjects');
  }
};

// Question endpoints
export const fetchQuestions = async (subjectId = null) => {
  try {
    let url = `${API_URL}/questions`;
    if (subjectId) {
      url += `?subject_id=${subjectId}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to fetch questions');
  }
};

export const fetchQuestionById = async (questionId) => {
  try {
    const response = await axios.get(`${API_URL}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question ${questionId}:`, error);
    throw new Error('Failed to fetch question');
  }
};

export const createQuestion = async (questionData) => {
  try {
    // Ensure the questionData has the expected structure with rubrics array
    if (!questionData.rubrics || !Array.isArray(questionData.rubrics)) {
      questionData.rubrics = [];
    }
    
    // Ensure each rubric has a serial_number if not already set
    questionData.rubrics = questionData.rubrics.map((rubric, index) => ({
      ...rubric,
      serial_number: rubric.serial_number || index + 1
    }));
    
    const response = await axios.post(`${API_URL}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('Failed to create question');
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    // Ensure the questionData has the expected structure with rubrics array
    if (!questionData.rubrics || !Array.isArray(questionData.rubrics)) {
      questionData.rubrics = [];
    }
    
    // Ensure each rubric has a serial_number if not already set
    questionData.rubrics = questionData.rubrics.map((rubric, index) => ({
      ...rubric,
      serial_number: rubric.serial_number || index + 1
    }));
    
    const response = await axios.put(`${API_URL}/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating question ${questionId}:`, error);
    throw new Error('Failed to update question');
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await axios.delete(`${API_URL}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    throw new Error('Failed to delete question');
  }
};

// Rubric-specific endpoints (new)
export const createRubric = async (questionId, rubricData) => {
  try {
    // This endpoint doesn't exist yet in the backend, but we're preparing for it
    const response = await axios.post(`${API_URL}/questions/${questionId}/rubrics`, rubricData);
    return response.data;
  } catch (error) {
    console.error(`Error creating rubric for question ${questionId}:`, error);
    throw new Error('Failed to create rubric');
  }
};

export const updateRubric = async (questionId, rubricId, rubricData) => {
  try {
    // This endpoint doesn't exist yet in the backend, but we're preparing for it
    const response = await axios.put(`${API_URL}/questions/${questionId}/rubrics/${rubricId}`, rubricData);
    return response.data;
  } catch (error) {
    console.error(`Error updating rubric ${rubricId}:`, error);
    throw new Error('Failed to update rubric');
  }
};

export const deleteRubric = async (questionId, rubricId) => {
  try {
    // This endpoint doesn't exist yet in the backend, but we're preparing for it
    const response = await axios.delete(`${API_URL}/questions/${questionId}/rubrics/${rubricId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting rubric ${rubricId}:`, error);
    throw new Error('Failed to delete rubric');
  }
};

// Question Set endpoints
export const fetchQuestionSets = async (subjectId = null) => {
  try {
    let url = `${API_URL}/questions/sets`;
    if (subjectId) {
      url += `?subject_id=${subjectId}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching question sets:', error);
    throw new Error('Failed to fetch question sets');
  }
};

export const fetchQuestionSetById = async (setId) => {
  try {
    const response = await axios.get(`${API_URL}/questions/sets/${setId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question set ${setId}:`, error);
    throw new Error('Failed to fetch question set');
  }
};

export const createQuestionSet = async (setData) => {
  try {
    const response = await axios.post(`${API_URL}/questions/sets`, setData);
    return response.data;
  } catch (error) {
    console.error('Error creating question set:', error);
    throw new Error('Failed to create question set');
  }
};

export const updateQuestionSet = async (setId, setData) => {
  try {
    const response = await axios.put(`${API_URL}/questions/sets/${setId}`, setData);
    return response.data;
  } catch (error) {
    console.error(`Error updating question set ${setId}:`, error);
    throw new Error('Failed to update question set');
  }
};

export const deleteQuestionSet = async (setId) => {
  try {
    const response = await axios.delete(`${API_URL}/questions/sets/${setId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question set ${setId}:`, error);
    throw new Error('Failed to delete question set');
  }
};

// Question Set Mapping endpoints
export const addQuestionsToSet = async (setId, questionIds) => {
  try {
    const response = await axios.post(`${API_URL}/questions/sets/${setId}/questions`, {
      question_ids: questionIds
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding questions to set ${setId}:`, error);
    throw new Error('Failed to add questions to set');
  }
};

export const removeQuestionFromSet = async (setId, questionId) => {
  try {
    const response = await axios.delete(`${API_URL}/questions/sets/${setId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing question ${questionId} from set ${setId}:`, error);
    throw new Error('Failed to remove question from set');
  }
};