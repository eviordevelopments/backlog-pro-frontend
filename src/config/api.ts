/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

export const API_CONFIG = {
  BACKEND_URL: import.meta.env.BACKEND_URL || 'http://localhost:3001',
  GRAPHQL_ENDPOINT: `${import.meta.env.BACKEND_URL || 'http://localhost:3001'}/graphql`,
};

export default API_CONFIG;
