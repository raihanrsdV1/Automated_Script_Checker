// src/api/auth.js
import { API_CONFIG } from '../config';

const API_ROOT = API_CONFIG.BASE_URL.replace('/api', '');

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
  const res = await fetch(`${API_ROOT}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || res.statusText);
  }
  return res.json(); // { message }
}