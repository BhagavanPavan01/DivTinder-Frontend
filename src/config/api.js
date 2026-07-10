import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

const isProd = import.meta.env.PROD;
const defaultProdUrl = 'https://divtinder.onrender.com';
const defaultDevUrl = ''; // Use Vite proxy ('' instead of localhost:3000) avoids CORS issues in dev

const configuredApiBaseUrl = import.meta.env.VITE_API_URL || (isProd ? defaultProdUrl : defaultDevUrl);
const configuredSocketBaseUrl = import.meta.env.VITE_SOCKET_URL || (isProd ? defaultProdUrl : 'http://localhost:3000');
const configuredChatApiUrl = import.meta.env.VITE_CHAT_API_URL || (isProd ? `${defaultProdUrl}/api` : `${defaultDevUrl}/api`);

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
  const data = error?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    return data.message || data.error || data.detail || data.msg || 'Request failed';
  }

  return error?.message || 'Request failed';
};
