import { API_CONFIG } from './api-config';

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

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
    'Accept': 'application/json'
  };
  
  // Try Bearer token first
  const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Fallback to Basic auth if available
    const basic = localStorage.getItem('basic_auth');
    if (basic) {
      headers['Authorization'] = `Basic ${basic}`;
    }
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
  get: async <T>(path: string, query?: QueryParams): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('GET request:', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: getBasicHeaders(),
      mode: 'cors'
    });
    return handleResponse<T>(res);
  },
  post: async <T>(path: string, body?: unknown, query?: QueryParams): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('POST request:', url, body);
    const res = await fetch(url, {
      method: 'POST',
      headers: getBasicHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      mode: 'cors'
    });
    return handleResponse<T>(res);
  },
  put: async <T>(path: string, body?: unknown, query?: QueryParams): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('PUT request:', url, body);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getBasicHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      mode: 'cors'
    });
    return handleResponse<T>(res);
  },
  delete: async <T>(path: string, query?: QueryParams): Promise<T> => {
    const url = buildUrl(path, query);
    console.log('DELETE request:', url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getBasicHeaders(),
      mode: 'cors'
    });
    return handleResponse<T>(res);
  }
};

