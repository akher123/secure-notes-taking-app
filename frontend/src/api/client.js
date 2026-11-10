const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) {
    return null;
  }

  const body = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    if (res.status === 401 && token) {
      onUnauthorized();
    }
    throw new ApiError(body.message || res.statusText, {
      code: body.code,
      status: res.status,
    });
  }

  return body;
}
