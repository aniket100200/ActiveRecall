import { API_BASE_URL } from './http';
import { PageResponse } from './subjectApi';

export type RevisionQueueStatus = 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED';
export type RevisionOutcome = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface RevisionTaskDetailDto {
  id: string;
  studySessionId: string;
  sessionTitle?: string;
  sessionNotes?: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  scheduleOffsetDays: number;
  dueAt: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  outcome?: RevisionOutcome;
  reflection?: string;
  createdAt: string;
}

export interface CompleteRevisionPayload {
  outcome: RevisionOutcome;
  reflection?: string;
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchRevisions(
  token: string,
  status: RevisionQueueStatus = 'DUE_TODAY',
  subjectId?: string,
  topicId?: string,
  page = 0,
  size = 20
): Promise<PageResponse<RevisionTaskDetailDto>> {
  let url = `${API_BASE_URL}/revisions?status=${status}&page=${page}&size=${size}`;
  if (subjectId) url += `&subjectId=${subjectId}`;
  if (topicId) url += `&topicId=${topicId}`;

  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch revision queue');
  return res.json();
}

export async function fetchRevisionTask(token: string, taskId: string): Promise<RevisionTaskDetailDto> {
  const res = await fetch(`${API_BASE_URL}/revisions/${taskId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch revision task details');
  return res.json();
}

export async function completeRevisionTask(
  token: string,
  taskId: string,
  payload: CompleteRevisionPayload
): Promise<RevisionTaskDetailDto> {
  const res = await fetch(`${API_BASE_URL}/revisions/${taskId}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to complete revision task');
  }
  return data;
}
