import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { AuthProvider } from '../auth/AuthContext';

vi.mock('../../api/authApi', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'u1',
    name: 'Dashboard User',
    email: 'test@example.com',
    timeZone: 'Asia/Kolkata',
    createdAt: '2026-10-13T00:00:00Z',
  }),
  logoutUser: vi.fn(),
}));

vi.mock('../../api/dashboardApi', () => ({
  fetchDashboardSummary: vi.fn().mockResolvedValue({
    tasksDueToday: 3,
    overdueTasks: 1,
    tasksCompletedToday: 2,
    totalStudySessions: 5,
    activeSubjects: 2,
    completionRate: 40.0,
  }),
  fetchUpcomingRevisions: vi.fn().mockResolvedValue([
    {
      id: 'task1',
      studySessionId: 'sess1',
      sessionTitle: 'Calculus Limits Practice',
      topicId: 'top1',
      topicName: 'Limits',
      subjectId: 'sub1',
      subjectName: 'Mathematics',
      scheduleOffsetDays: 3,
      dueAt: new Date().toISOString(),
      status: 'PENDING',
      createdAt: '2026-10-13T00:00:00Z',
    },
  ]),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('renders dashboard summary cards and upcoming revisions', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(await screen.findByText('Welcome back, Dashboard User!')).toBeInTheDocument();
    expect(screen.getByText('Due Today')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(await screen.findByText('Calculus Limits Practice')).toBeInTheDocument();
  });
});
