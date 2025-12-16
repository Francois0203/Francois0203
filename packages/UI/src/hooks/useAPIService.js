/**
 * useAPIService - Centralized API Service Utility (Core)
 * 
 * Features:
 * - Named parameter substitution in URLs
 * - Standardised error handling with user-friendly messages
 * - Support for all HTTP methods
 * - Query parameter handling
 * - Request/response interceptors
 * - Automatic content-type handling
 * - Loading state management with UI component
 * - Enhanced network/offline error detection
 */

import { useState, useEffect } from 'react';
import { Loading } from '../components';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Default request configuration
const DEFAULT_CONFIG = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'credentials': 'include',
  },
  timeout: REQUEST_TIMEOUT,
};

// =============================================================================
// USER-FRIENDLY ERROR MESSAGES
// =============================================================================

/**
 * Mapping of HTTP status codes to user-friendly messages
 */
const ERROR_MESSAGES = {
  400: 'We couldn\'t process your request. Please check your information and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource could not be found.',
  408: 'The request took too long. Please try again.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again in a few moments.',
  502: 'Our servers are temporarily unavailable. Please try again soon.',
  503: 'Our service is temporarily unavailable. Please try again later.',
  504: 'The request is taking too long. Please try again.',
  NETWORK: 'Unable to connect to the server. Please check your internet connection and try again.',
  TIMEOUT: 'The request took too long to complete. Please check your connection and try again.',
  DEFAULT: 'An unexpected error occurred. Please try again.',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Build URL with named parameters
 * @param {string} endpoint - Endpoint template with :paramName placeholders
 * @param {Object} params - Object with parameter values
 * @param {Object} queryParams - Object with query parameters
 * @param {Object} API_ENDPOINTS - API endpoints registry from the app
 * @param {string} baseURL - Base API URL
 * @returns {string} - Constructed URL
 * 
 * Example:
 * buildURL('/client/:clientId/project/:projectId', 
 *          { clientId: 123, projectId: 456 }, 
 *          { status: 'ACTIVE' },
 *          API_ENDPOINTS,
 *          'http://localhost:3000')
 * Returns: 'http://localhost:3000/client/123/project/456?status=ACTIVE'
 */
function buildURL(endpoint, params = {}, queryParams = {}, API_ENDPOINTS = {}, baseURL = '') {
  let url = API_ENDPOINTS[endpoint] || endpoint;
  
  // Replace named parameters
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
  });
  
  // Check for unreplaced parameters
  const unreplacedParams = url.match(/:[a-zA-Z_]+/g);
  if (unreplacedParams) {
    console.warn(`Warning: Unreplaced URL parameters found: ${unreplacedParams.join(', ')}`);
  }
  
  // Add query parameters
  const queryString = buildQueryString(queryParams);
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return `${baseURL}${url}`;
}

/**
 * Build query string from object
 * @param {Object} params - Query parameters object
 * @returns {string} - Query string (without leading ?)
 */
function buildQueryString(params = {}) {
  const entries = Object.entries(params).filter(([_, value]) => 
    value !== null && value !== undefined
  );
  
  if (entries.length === 0) return '';
  
  return entries
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

/**
 * Check if error is a network/connectivity error
 * @param {Error} error - Error object
 * @returns {boolean} - True if network error
 */
function isNetworkError(error) {
  // TypeError is thrown by fetch for network failures
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('load failed')
    );
  }
  return false;
}

/**
 * Check if error is a timeout error
 * @param {Error} error - Error object
 * @returns {boolean} - True if timeout error
 */
function isTimeoutError(error) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }
  return false;
}

/**
 * Get user-friendly error message based on status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} - User-friendly error message
 */
function getUserFriendlyErrorMessage(statusCode) {
  return ERROR_MESSAGES[statusCode] || ERROR_MESSAGES.DEFAULT;
}

// =============================================================================
// CORE API SERVICE CLASS FACTORY
// =============================================================================

/**
 * Create an APIService class with configured endpoints and base URL
 * @param {Object} API_ENDPOINTS - API endpoints registry
 * @param {string} baseURL - Base API URL
 * @returns {Class} - Configured APIService class
 */
export function createAPIService(API_ENDPOINTS = {}, baseURL = '') {
  class APIService {
    /**
     * Generic request handler
     * @param {string} method - HTTP method
     * @param {string} endpoint - Endpoint from API_ENDPOINTS or custom endpoint
     * @param {Object} options - Request options
     * @returns {Promise} - Response data
     */
    static async request(method, endpoint, options = {}) {
      const {
        params = {},
        queryParams = {},
        body = null,
        headers = {},
        customConfig = {},
        timeout = DEFAULT_CONFIG.timeout,
      } = options;

      let timeoutId;

      try {
        // Build the full URL
        const url = buildURL(endpoint, params, queryParams, API_ENDPOINTS, baseURL);
        
        // Prepare request configuration
        const config = {
          ...DEFAULT_CONFIG,
          ...customConfig,
          method: method.toUpperCase(),
          headers: {
            ...DEFAULT_CONFIG.headers,
            ...headers,
          },
        };

        // Remove headers with undefined values (allows browser to set them automatically)
        // This is critical for FormData/multipart requests where browser must set Content-Type with boundary
        Object.keys(config.headers).forEach(key => {
          if (config.headers[key] === undefined) {
            delete config.headers[key];
          }
        });

        // Add body if present (not for GET/HEAD requests)
        // Skip JSON.stringify for FormData, Blob, ArrayBuffer, etc.
        if (body && !['GET', 'HEAD'].includes(config.method)) {
          // Check if body is already a browser-native type that should not be stringified
          const isNativeBodyType = body instanceof FormData || 
                                   body instanceof Blob || 
                                   body instanceof ArrayBuffer ||
                                   body instanceof URLSearchParams ||
                                   typeof body === 'string';
          
          config.body = isNativeBodyType ? body : JSON.stringify(body);
        }

        // Set up timeout with AbortController
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        // Make the request
        const response = await fetch(url, config);

        // Clear timeout on successful response
        clearTimeout(timeoutId);

        // Handle non-OK responses
        if (!response.ok) {
          await this.handleErrorResponse(response, method);
        }

        // Handle empty responses (204 No Content)
        if (response.status === 204) {
          return null;
        }

        // Parse and return JSON response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }

        // Return text for non-JSON responses
        return await response.text();
        
      } catch (error) {
        // Clear timeout if still pending
        if (timeoutId) clearTimeout(timeoutId);

        // Handle abort (timeout) errors
        if (error.name === 'AbortError') {
          throw new Error(ERROR_MESSAGES.TIMEOUT);
        }

        // Handle network/connectivity errors
        if (isNetworkError(error)) {
          throw new Error(ERROR_MESSAGES.NETWORK);
        }

        // Handle timeout errors
        if (isTimeoutError(error)) {
          throw new Error(ERROR_MESSAGES.TIMEOUT);
        }

        // Re-throw errors from handleErrorResponse (they already have good messages)
        if (error.message && (error.message === ERROR_MESSAGES.NETWORK || 
            Object.values(ERROR_MESSAGES).includes(error.message))) {
          throw error;
        }
        
        // Handle any other unexpected errors with generic message
        throw new Error(ERROR_MESSAGES.DEFAULT);
      }
    }

    /**
     * Handle error responses with user-friendly messages only
     */
    static async handleErrorResponse(response, method) {
      const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
      throw new Error(userFriendlyMessage);
    }

    /**
     * Get appropriate action verb for HTTP method
     */
    static getActionVerb(method) {
      const verbMap = {
        GET: 'fetch',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
      };
      return verbMap[method.toUpperCase()] || 'process';
    }

    // =============================================================================
    // HTTP METHOD SHORTCUTS
    // =============================================================================

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options (params, queryParams, etc.)
     */
    static async get(endpoint, options = {}) {
      return this.request('GET', endpoint, options);
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request body
     * @param {Object} options - Additional request options
     */
    static async post(endpoint, body = null, options = {}) {
      return this.request('POST', endpoint, { ...options, body });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request body
     * @param {Object} options - Additional request options
     */
    static async put(endpoint, body = null, options = {}) {
      return this.request('PUT', endpoint, { ...options, body });
    }

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request body
     * @param {Object} options - Additional request options
     */
    static async patch(endpoint, body = null, options = {}) {
      return this.request('PATCH', endpoint, { ...options, body });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     */
    static async delete(endpoint, options = {}) {
      return this.request('DELETE', endpoint, options);
    }
  }

  return APIService;
}

// =============================================================================
// CONVENIENCE WRAPPERS FACTORY
// =============================================================================

/**
 * Create convenience wrapper functions with configured APIService
 * @param {Class} APIService - Configured APIService class
 * @returns {Object} - Object containing all convenience functions
 */
export function createAPIHelpers(APIService) {
  /**
   * Fetch data with error handling and optional state setter
   */
  async function fetchData(endpoint, options = {}, setState = null, showToast = null, entityName = null) {
    try {
      const data = await APIService.get(endpoint, { ...options, entityName });
      
      if (setState) {
        setState(data);
      }
      
      return data;
    } catch (error) {
      if (showToast) {
        showToast('error', 'Load Error', `Failed to load ${entityName || 'data'}.`);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  /**
   * Submit data (POST/PUT/PATCH) with error handling
   */
  async function submitData(method, endpoint, body, options = {}, showToast = null, entityName = null) {
    try {
      const response = await APIService.request(method, endpoint, { ...options, body, entityName });
      return response;
    } catch (error) {
      if (showToast) {
        const action = method === 'POST' ? 'create' : method === 'PUT' || method === 'PATCH' ? 'update' : 'process';
        showToast('error', 'Error', `Failed to ${action} ${entityName || 'data'}.`);
      }
      throw error;
    }
  }

  /**
   * Delete data with error handling
   */
  async function deleteData(endpoint, options = {}, showToast = null, entityName = null) {
    try {
      await APIService.delete(endpoint, { ...options, entityName });
      return true;
    } catch (error) {
      if (showToast) {
        showToast('error', 'Error', `Failed to delete ${entityName || 'data'}.`);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  /**
   * Fetch data with loading component support
   */
  async function fetchDataWithLoading(
    endpoint, 
    options = {}, 
    setState = null, 
    showToast = null, 
    entityName = null,
    setLoading = null
  ) {
    try {
      if (setLoading) setLoading(true);
      
      const data = await APIService.get(endpoint, { ...options, entityName });
      
      if (setState) {
        setState(data);
      }
      
      return data;
    } catch (error) {
      if (showToast) {
        showToast('error', 'Load Error', `Failed to load ${entityName || 'data'}.`);
      } else {
        console.error(error.message);
      }
      return null;
    } finally {
      if (setLoading) setLoading(false);
    }
  }

  /**
   * Submit data with loading state support
   */
  async function submitDataWithLoading(
    method, 
    endpoint, 
    body, 
    options = {}, 
    showToast = null, 
    entityName = null,
    setLoading = null
  ) {
    try {
      if (setLoading) setLoading(true);
      
      const response = await APIService.request(method, endpoint, { ...options, body, entityName });
      return response;
    } catch (error) {
      if (showToast) {
        const action = method === 'POST' ? 'create' : method === 'PUT' || method === 'PATCH' ? 'update' : 'process';
        showToast('error', 'Error', `Failed to ${action} ${entityName || 'data'}.`);
      }
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  }

  return {
    fetchData,
    submitData,
    deleteData,
    fetchDataWithLoading,
    submitDataWithLoading,
  };
}

// =============================================================================
// REACT HOOKS FACTORY
// =============================================================================

/**
 * Create React hooks with configured APIService
 * @param {Class} APIService - Configured APIService class
 * @returns {Object} - Object containing all React hooks
 */
export function createAPIHooks(APIService) {
  /**
   * useAPIRequest - Generic hook for API requests with loading state
   */
  function useAPIRequest() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (method, endpoint, options = {}) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await APIService.request(method, endpoint, options);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const reset = () => {
      setData(null);
      setLoading(false);
      setError(null);
    };

    return { data, loading, error, execute, reset };
  }

  /**
   * useAPIGet - Hook for GET requests with loading state
   */
  function useAPIGet(endpoint, options = {}, autoFetch = false) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await APIService.get(endpoint, options);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    };

    // Auto-fetch on mount if enabled
    useEffect(() => {
      if (autoFetch) {
        fetchData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, endpoint]);

    return { data, loading, error, refetch: fetchData };
  }

  /**
   * useAPIPost - Hook for POST requests with loading state
   */
  function useAPIPost() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const post = async (endpoint, body, options = {}) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await APIService.post(endpoint, body, options);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return { data, loading, error, post };
  }

  /**
   * useAPIPatch - Hook for PATCH requests with loading state
   */
  function useAPIPatch() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const patch = async (endpoint, body, options = {}) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await APIService.patch(endpoint, body, options);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return { data, loading, error, patch };
  }

  /**
   * useAPIDelete - Hook for DELETE requests with loading state
   */
  function useAPIDelete() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteRequest = async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);
      
      try {
        await APIService.delete(endpoint, options);
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return { loading, error, deleteRequest };
  }

  /**
   * useAPIFetch - Enhanced fetch hook with Loading component
   */
  function useAPIFetch(endpoint, options = {}, showToast = null, showLoadingComponent = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await APIService.get(endpoint, options);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        if (showToast) {
          showToast('error', 'Error', err.message);
        }
        return null;
      } finally {
        setLoading(false);
      }
    };

    // Loading component to render
    const LoadingComponent = showLoadingComponent && loading ? <Loading /> : null;

    return { data, loading, error, refetch: fetchData, LoadingComponent };
  }

  return {
    useAPIRequest,
    useAPIGet,
    useAPIPost,
    useAPIPatch,
    useAPIDelete,
    useAPIFetch,
  };
}