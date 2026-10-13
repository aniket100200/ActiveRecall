import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { NewStudySessionPage } from './NewStudySessionPage';
import { SettingsPage } from '../settings/SettingsPage';
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
    content: [{ id: 's1', name: 'Mathematics', topicCount: 1 }],
  }),
  fetchTopicsBySubject: vi.fn().mockResolvedValue([
    { id: 't1', subjectId: 's1', name: 'Percent' },
  ]),
}));

vi.mock('../../api/settingsApi', () => ({
  fetchRevisionSchedule: vi.fn().mockResolvedValue({
    scheduleOffsetsDays: [0, 3, 7, 14, 21],
    updatedAt: '2026-10-13T00:00:00Z',
  }),
  updateRevisionSchedule: vi.fn(),
}));

describe('Study Session & Settings Pages', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('renders Record Study Session page with schedule preview', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <NewStudySessionPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(await screen.findByRole('heading', { name: /record study session/i })).toBeInTheDocument();
    expect(screen.getByText(/day 0 \(immediate\)/i)).toBeInTheDocument();
    expect(screen.getByText(/day 21 revision/i)).toBeInTheDocument();
  });

  it('renders Settings page with intervals editor', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SettingsPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(await screen.findByRole('heading', { name: /account & revision settings/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('0, 3, 7, 14, 21')).toBeInTheDocument();
  });
});
