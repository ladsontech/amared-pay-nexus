import { API_CONFIG } from './api-config';

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

type AuthMode = 'bearer' | 'basic' | 'none';

export interface RequestOptions {
  authMode?: AuthMode;
  basicCredentials?: { username: string; password: string };
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(path, API_CONFIG.baseURL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function getBasicHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'AlmaPay-Web/1.0'
  };
  
  return headers;
}

function getAuthHeaders(): Record<string, string> {
  const headers = getBasicHeaders();
  const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getBasicAuthHeaders(opts?: RequestOptions): Record<string, string> {
  const headers = getBasicHeaders();
  let basicToken = localStorage.getItem('basic_auth') || '';

  if (opts?.basicCredentials) {
    const { username, password } = opts.basicCredentials;
    try {
      basicToken = btoa(`${username}:${password}`);
    } catch {
      basicToken = btoa(unescape(encodeURIComponent(`${username}:${password}`)));
    }
  }

  if (!basicToken) {
    const envUser = (import.meta as any).env?.VITE_BASIC_USERNAME;
    const envPass = (import.meta as any).env?.VITE_BASIC_PASSWORD;
    const envToken = (import.meta as any).env?.VITE_BASIC_AUTH;
    if (envToken) {
      basicToken = envToken;
    } else if (envUser && envPass) {
      try {
        basicToken = btoa(`${envUser}:${envPass}`);
      } catch {
        basicToken = btoa(unescape(encodeURIComponent(`${envUser}:${envPass}`)));
      }
    }
  }

  if (basicToken) {
    headers['Authorization'] = `Basic ${basicToken}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!response.ok) {
    let details: unknown = undefined;
    try {
      details = isJson ? await response.json() : await response.text();
    } catch {
      // ignore
    }
    const error: ApiError = new Error(`Request failed (${response.status})`);
    error.status = response.status;
    error.details = details;
    throw error;
  }
  if (isJson) return response.json();
  // @ts-expect-error generic non-json responses
  return response.text();
}

export const apiClient = {
  get: async <T>(path: string, query?: QueryParams, options?: RequestOptions): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('GET request:', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: options?.authMode === 'none' ? getBasicHeaders() : options?.authMode === 'basic' ? getBasicAuthHeaders(options) : getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse<T>(res);
  },
  post: async <T>(path: string, body?: unknown, query?: QueryParams, options?: RequestOptions): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('POST request:', url, body);
    
    // For login endpoint, don't include auth headers unless explicitly provided
    const isLoginRequest = path.includes('/auth/login');
    const headers = options?.authMode
      ? (options.authMode === 'none' ? getBasicHeaders() : options.authMode === 'basic' ? getBasicAuthHeaders(options) : getAuthHeaders())
      : (isLoginRequest ? getBasicHeaders() : getAuthHeaders());
    
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      mode: 'cors'
    });
    return handleResponse<T>(res);
  },
  put: async <T>(path: string, body?: unknown, query?: QueryParams, options?: RequestOptions): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('PUT request:', url, body);
    const res = await fetch(url, {
      method: 'PUT',
      headers: options?.authMode === 'none' ? getBasicHeaders() : options?.authMode === 'basic' ? getBasicAuthHeaders(options) : getAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      mode: 'cors'
    });
    return handleResponse<T>(res);
  },
  delete: async <T>(path: string, query?: QueryParams, options?: RequestOptions): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('DELETE request:', url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: options?.authMode === 'none' ? getBasicHeaders() : options?.authMode === 'basic' ? getBasicAuthHeaders(options) : getAuthHeaders(),
      mode: 'cors'
    });
    return handleResponse<T>(res);
  }
};

