const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('The server returned an invalid JSON response.');
  }

  if (!response.ok) {
    throw new Error(body?.error?.message || `Request failed (${response.status}).`);
  }
  if (!body?.success || !('data' in body)) {
    throw new Error('The server returned an invalid response.');
  }
  return body.data;
}

export function register(username, password) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function login(username, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getTasks() {
  const tasks = await request('/tasks');
  if (!Array.isArray(tasks)) throw new Error('The server returned an invalid task list.');
  return tasks;
}

export function createTask(input) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTask(id, input) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
