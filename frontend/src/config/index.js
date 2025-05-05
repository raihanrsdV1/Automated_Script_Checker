/**
 * Application configuration
 * 
 * This file centralizes all configuration variables for the application.
 * All config values are first looked up in environment variables, then fall back to defaults.
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000, // Default timeout in ms
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_info',
  REFRESH_TOKEN_KEY: 'refresh_token',
};

// Feature Flags
export const FEATURES = {
  ENABLE_QUESTION_SETS: true,
  ENABLE_RUBRIC_EDITING: true,
};

// App-wide settings
export const APP_CONFIG = {
  APP_NAME: 'Automated Script Checker',
  SUPPORT_EMAIL: 'support@example.com',
};