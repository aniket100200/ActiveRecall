import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RevisionsPage } from './RevisionsPage';
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
  fetchSubjects: vi.fn().mockResolvedValue({ content: [] }),
  fetchTopicsBySubject: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../api/revisionApi', () => ({
  fetchRevisions: vi.fn().mockResolvedValue({
    content: [
      {
        id: 'rev1',
        studySessionId: 'sess1',
        sessionTitle: 'Quadratic Formula Notes',
        topicId: 't1',
        topicName: 'Algebra',
        subjectId: 's1',
        subjectName: 'Mathematics',
        scheduleOffsetDays: 0,
        dueAt: new Date().toISOString(),
        status: 'PENDING',
        createdAt: '2026-10-13T00:00:00Z',
      },
    ],
  }),
  fetchRevisionTask: vi.fn(),
  completeRevisionTask: vi.fn(),
}));

describe('Revision Queue Page', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('renders revision queue tabs and pending tasks', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <RevisionsPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(await screen.findByRole('heading', { name: /active recall revision queue/i })).toBeInTheDocument();
    expect(screen.getByText('Due Today')).toBeInTheDocument();
    expect(await screen.findByText('Quadratic Formula Notes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start recall/i })).toBeInTheDocument();
  });
});
