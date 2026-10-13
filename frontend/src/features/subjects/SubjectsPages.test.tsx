import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SubjectsPage } from './SubjectsPage';
import { AuthProvider } from '../auth/AuthContext';

vi.mock('../../api/authApi', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    timeZone: 'Asia/Kolkata',
    createdAt: '2026-10-13T00:00:00Z',
  }),
  logoutUser: vi.fn(),
}));

vi.mock('../../api/subjectApi', () => ({
  fetchSubjects: vi.fn().mockResolvedValue({
    content: [
      { id: '1', name: 'Mathematics', description: 'Calculus', topicCount: 3, archived: false },
    ],
  }),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  archiveSubject: vi.fn(),
}));

describe('Subjects Page', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('renders subject list correctly', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SubjectsPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(await screen.findByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText(/3 topics/i)).toBeInTheDocument();
  });
});
