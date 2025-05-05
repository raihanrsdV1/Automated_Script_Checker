// src/api/auth.js
import { API_CONFIG } from '../config';

// Keep the full BASE_URL including the /api prefix
const API_ROOT = API_CONFIG.BASE_URL;

export async function login({ username, password }) {
  const res = await fetch(`${API_ROOT}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  
  return res.json(); // { token, user_id, role }
}

export async function register(data) {
  const res = await fetch(`${API_ROOT}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  
  return res.json(); // { id, message }
}

export async function logout() {
  // Clear all auth-related data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  
  return { message: 'Logout successful' };
}

// Get the current authenticated user's information
export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const res = await fetch(`${API_ROOT}/auth/me`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      // If unauthorized, clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      throw new Error('Session expired. Please login again.');
    }
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  
  return res.json(); // User data
}

// Check if the user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}