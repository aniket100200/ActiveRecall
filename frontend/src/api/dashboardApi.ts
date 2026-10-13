import { API_BASE_URL } from './http';
import { PageResponse } from './subjectApi';
import { RevisionTaskDetailDto } from './revisionApi';
import { StudySessionDto } from './studySessionApi';

export interface DashboardSummaryDto {
  tasksDueToday: number;
  overdueTasks: number;
  tasksCompletedToday: number;
  totalStudySessions: number;
  activeSubjects: number;
  completionRate: number;
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummaryDto> {
  const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchUpcomingRevisions(token: string, limit = 10): Promise<RevisionTaskDetailDto[]> {
  const res = await fetch(`${API_BASE_URL}/dashboard/upcoming?limit=${limit}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch upcoming revisions');
  return res.json();
}

export async function fetchCompletedRevisionsHistory(
  token: string,
  page = 0,
  size = 20
): Promise<PageResponse<RevisionTaskDetailDto>> {
  const res = await fetch(`${API_BASE_URL}/history/revisions?page=${page}&size=${size}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch completed revisions history');
  return res.json();
}

export async function fetchStudySessionsHistory(
  token: string,
  page = 0,
  size = 20
): Promise<PageResponse<StudySessionDto>> {
  const res = await fetch(`${API_BASE_URL}/history/study-sessions?page=${page}&size=${size}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch study session history');
  return res.json();
}
