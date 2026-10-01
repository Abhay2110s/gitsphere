/**
 * GitSphere Centralized API Client
 * Built with fetch, supports credentials (cookies) and Authorization header,
 * with standard JSON response formatting and normalized error handling.
 */

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const BASE_URL = rawBase.replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (options.params && typeof options.params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, v);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  // Read auth token from localStorage if present
  let token = null;
  try {
    token = localStorage.getItem('gitsphere_token') || localStorage.getItem('token');
  } catch {
    // ignore
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    credentials: 'include', // Support HTTP-only cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const res = await fetch(url, config);

    // 401 Unauthorized handling
    if (res.status === 401) {
      // Trigger session expiration handling if needed
      window.dispatchEvent(new CustomEvent('gitsphere:unauthorized'));
    }

    let data = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${res.status}`;
      const errorCode = data?.code || `HTTP_${res.status}`;
      throw new ApiError(errorMessage, res.status, errorCode, data?.errors || null);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network request failed', 0, 'NETWORK_ERROR');
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError, BASE_URL };
