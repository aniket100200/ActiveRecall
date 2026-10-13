import { API_BASE_URL } from './http';

export interface RevisionSettingsDto {
  scheduleOffsetsDays: number[];
  updatedAt: string;
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchRevisionSchedule(token: string): Promise<RevisionSettingsDto> {
  const res = await fetch(`${API_BASE_URL}/settings/revision-schedule`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch schedule settings');
  return res.json();
}

export async function updateRevisionSchedule(
  token: string,
  offsetsDays: number[]
): Promise<RevisionSettingsDto> {
  const res = await fetch(`${API_BASE_URL}/settings/revision-schedule`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ offsetsDays }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update revision schedule');
  return data;
}
