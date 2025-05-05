import axios from 'axios';
import { API_CONFIG } from '../config';

// Subject Management APIs
export const fetchSubjects = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/subjects`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/subjects`, subjectData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/subjects/${subjectId}`, subjectData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    const response = await axios.delete(`${API_CONFIG.BASE_URL}/subjects/${subjectId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Class Management APIs
export const fetchClasses = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/classes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

export const createClass = async (classData) => {
  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/classes`, classData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

export const updateClass = async (classId, classData) => {
  try {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/classes/${classId}`, classData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

export const deleteClass = async (classId) => {
  try {
    const response = await axios.delete(`${API_CONFIG.BASE_URL}/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};