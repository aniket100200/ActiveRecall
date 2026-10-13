const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function fetchHealthStatus(): Promise<{ status: string }> {
  try {
    const res = await fetch('/actuator/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'UNKNOWN' };
  }
}

export { API_BASE_URL };
