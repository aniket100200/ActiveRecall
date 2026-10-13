import { API_BASE_URL } from './http';
import { PageResponse } from './subjectApi';

export interface RevisionTaskSummaryDto {
  id: string;
  scheduleOffsetDays: number;
  dueAt: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface StudySessionDto {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  title?: string;
  notes?: string;
  studiedAt: string;
  durationMinutes?: number;
  revisionTasks: RevisionTaskSummaryDto[];
  createdAt: string;
}

export interface CreateStudySessionPayload {
  title?: string;
  notes?: string;
  studiedAt?: string;
  durationMinutes?: number;
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createStudySession(
  token: string,
  topicId: string,
  payload: CreateStudySessionPayload
): Promise<StudySessionDto> {
  const res = await fetch(`${API_BASE_URL}/topics/${topicId}/sessions`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to log study session');
  }
  return data;
}

export async function fetchSessionsForTopic(
  token: string,
  topicId: string,
  page = 0,
  size = 20
): Promise<PageResponse<StudySessionDto>> {
  const res = await fetch(`${API_BASE_URL}/topics/${topicId}/sessions?page=${page}&size=${size}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch study sessions');
  return res.json();
}
