import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HistoryPage } from './HistoryPage';
import { AuthProvider } from '../auth/AuthContext';

vi.mock('../../api/authApi', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'u1',
    name: 'History User',
    email: 'test@example.com',
    timeZone: 'Asia/Kolkata',
    createdAt: '2026-10-13T00:00:00Z',
  }),
  logoutUser: vi.fn(),
}));

vi.mock('../../api/dashboardApi', () => ({
  fetchCompletedRevisionsHistory: vi.fn().mockResolvedValue({
    content: [
      {
        id: 'c1',
        sessionTitle: 'Derivatives Formula Review',
        topicName: 'Calculus',
        subjectName: 'Math',
        scheduleOffsetDays: 0,
        outcome: 'GOOD',
        completedAt: new Date().toISOString(),
      },
    ],
  }),
  fetchStudySessionsHistory: vi.fn().mockResolvedValue({ content: [] }),
}));

describe('History Page', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('renders completed revisions history tab', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <HistoryPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(await screen.findByRole('heading', { name: /revision & study history/i })).toBeInTheDocument();
    expect(await screen.findByText('Derivatives Formula Review')).toBeInTheDocument();
    expect(screen.getByText('Outcome: GOOD')).toBeInTheDocument();
  });
});
