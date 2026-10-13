import { API_BASE_URL } from './http';

export interface SubjectDto {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicDto {
  id: string;
  subjectId: string;
  subjectName: string;
  name: string;
  description?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchSubjects(
  token: string,
  includeArchived = false,
  page = 0,
  size = 20
): Promise<PageResponse<SubjectDto>> {
  const res = await fetch(
    `${API_BASE_URL}/subjects?includeArchived=${includeArchived}&page=${page}&size=${size}`,
    { headers: getAuthHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function fetchSubject(token: string, subjectId: string): Promise<SubjectDto> {
  const res = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch subject details');
  return res.json();
}

export async function createSubject(
  token: string,
  payload: { name: string; description?: string }
): Promise<SubjectDto> {
  const res = await fetch(`${API_BASE_URL}/subjects`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create subject');
  return data;
}

export async function updateSubject(
  token: string,
  subjectId: string,
  payload: { name: string; description?: string; archived?: boolean }
): Promise<SubjectDto> {
  const res = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update subject');
  return data;
}

export async function archiveSubject(token: string, subjectId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to archive subject');
}

export async function fetchTopicsBySubject(
  token: string,
  subjectId: string,
  includeArchived = false
): Promise<TopicDto[]> {
  const res = await fetch(
    `${API_BASE_URL}/subjects/${subjectId}/topics?includeArchived=${includeArchived}`,
    { headers: getAuthHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function fetchTopic(token: string, topicId: string): Promise<TopicDto> {
  const res = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch topic details');
  return res.json();
}

export async function createTopic(
  token: string,
  subjectId: string,
  payload: { name: string; description?: string }
): Promise<TopicDto> {
  const res = await fetch(`${API_BASE_URL}/subjects/${subjectId}/topics`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create topic');
  return data;
}

export async function updateTopic(
  token: string,
  topicId: string,
  payload: { name: string; description?: string; archived?: boolean }
): Promise<TopicDto> {
  const res = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update topic');
  return data;
}

export async function archiveTopic(token: string, topicId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to archive topic');
}
