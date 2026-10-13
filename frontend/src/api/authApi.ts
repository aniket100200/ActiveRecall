import { API_BASE_URL } from './http';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  timeZone: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserDto;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  timeZone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid email or password');
  }
  return data;
}

export async function getCurrentUser(token: string): Promise<UserDto> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Session expired');
  }
  return await res.json();
}

export async function logoutUser(token?: string): Promise<void> {
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Ignore network errors on logout
  }
}
