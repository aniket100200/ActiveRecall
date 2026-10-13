import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { AuthProvider } from './AuthContext';

vi.mock('../../api/authApi', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getCurrentUser: vi.fn().mockRejectedValue(new Error('No token')),
  logoutUser: vi.fn(),
}));

describe('Auth Pages', () => {
  it('renders login form correctly', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders register form correctly', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time zone/i)).toBeInTheDocument();
  });
});
