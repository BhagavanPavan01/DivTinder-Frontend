import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

const isProd = import.meta.env.PROD;
// We route production calls through the Netlify proxy to prevent CORS network errors!
const defaultProdUrl = '/backend-api';
const defaultDevUrl = ''; // Use Vite proxy ('' instead of localhost:3000) avoids CORS issues in dev

const configuredApiBaseUrl = isProd ? defaultProdUrl : (import.meta.env.VITE_API_URL || defaultDevUrl);
const configuredSocketBaseUrl = isProd ? 'https://divtinder.onrender.com' : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
const configuredChatApiUrl = isProd ? `${defaultProdUrl}/api` : (import.meta.env.VITE_CHAT_API_URL || `${defaultDevUrl}/api`);

export const API_BASE_URL = normalizeBaseUrl(configuredApiBaseUrl);
export const SOCKET_BASE_URL = normalizeBaseUrl(configuredSocketBaseUrl);
export const CHAT_API_BASE_URL = normalizeBaseUrl(configuredChatApiUrl);

// Ensure credentials are sent by default for all requests
axios.defaults.withCredentials = true;

const LOGIN_PATHS = ['/login', '/api/login', '/auth/login', '/api/auth/login', '/users/login', '/api/users/login'];
const PROFILE_PATHS = ['/profile/view', '/api/profile/view', '/profile', '/api/profile'];
const LOGOUT_PATHS = ['/logout', '/api/logout', '/auth/logout', '/api/auth/logout'];

const buildRequestUrls = (paths) => {
  return paths.map((path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  });
};

const requestWithFallback = async (method, paths, payload, options = {}) => {
  const urls = buildRequestUrls(paths);
  let lastError = null;

  for (const url of urls) {
    try {
      return await axios({
        method,
        url,
        data: payload,
        ...options,
      });
    } catch (error) {
      const status = error.response?.status;
      lastError = error;

      if (status && status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const loginWithFallback = async (emailId, password, options = {}) => {
  const payloads = [
    { emailId, password },
    { email: emailId, password },
    { username: emailId, password },
  ];

  let lastError = null;

  for (const payload of payloads) {
    try {
      return await requestWithFallback('post', LOGIN_PATHS, payload, options);
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      if (status && status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const fetchProfileWithFallback = async (options = {}) => {
  return requestWithFallback('get', PROFILE_PATHS, undefined, options);
};

export const logoutWithFallback = async (options = {}) => {
  return requestWithFallback('post', LOGOUT_PATHS, {}, options);
};

export const getApiErrorMessage = (error) => {
  if (!error?.response) {
    if (error?.message?.toLowerCase().includes('network error') || error?.message?.toLowerCase().includes('ssl')) {
      return 'Network or server connection failed. Please try again later.';
    }
    return error?.message || 'Network error occurred.';
  }

  const data = error?.response?.data;

  if (typeof data === 'string') {
    if (
      data.includes('<html') ||
      data.includes('<!DOCTYPE') ||
      data.includes('SSL routines') ||
      data.includes('Error:')
    ) {
      return 'Server encountered an unexpected network error. Please try again.';
    }
    if (data.length > 150) {
      return 'An unexpected server error occurred.';
    }
    return data;
  }

  if (data && typeof data === 'object') {
    return data.message || data.error || data.detail || data.msg || 'Request failed';
  }

  return error?.message || 'Request failed';
};
