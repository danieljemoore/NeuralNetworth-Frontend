// src/config.js
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment
  ? '/api'
  : 'https://neuralnetworth-backend-409815903554.us-central1.run.app/api';
