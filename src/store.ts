import type { UserRole, CleaningRequest, Cleaner } from './types';

const STORAGE_KEYS = {
  ROLE: 'cleanmatch_role',
  REQUESTS: 'cleanmatch_requests',
} as const;

export const MOCK_CLEANERS: Cleaner[] = [
  { id: 'cleaner-1', name: '김미영', rating: 4.9, completedJobs: 127, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=miyo', distance: 1.2 },
  { id: 'cleaner-2', name: '박정희', rating: 4.7, completedJobs: 84, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=jung', distance: 2.5 },
  { id: 'cleaner-3', name: '이수진', rating: 4.8, completedJobs: 203, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=sujin', distance: 0.8 },
  { id: 'cleaner-4', name: '최은지', rating: 4.6, completedJobs: 56, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=eunji', distance: 3.1 },
];

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// sessionStorage: 탭별로 독립적인 역할 유지 (같은 브라우저 두 탭에서 의뢰자/청소자 동시 테스트 가능)
function getRole(): UserRole | null {
  const role = sessionStorage.getItem(STORAGE_KEYS.ROLE);
  if (role === 'client' || role === 'cleaner') return role;
  return null;
}

function setRole(role: UserRole): void {
  sessionStorage.setItem(STORAGE_KEYS.ROLE, role);
}

function getRequests(): CleaningRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) return [];
    return JSON.parse(raw) as CleaningRequest[];
  } catch {
    return [];
  }
}

function getRequestById(id: string): CleaningRequest | undefined {
  return getRequests().find((r) => r.id === id);
}

function saveRequest(request: CleaningRequest): CleaningRequest {
  const requests = getRequests();
  requests.push(request);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return request;
}

function updateRequest(id: string, updates: Partial<Omit<CleaningRequest, 'id'>>): CleaningRequest | null {
  const requests = getRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const updated = { ...requests[index], ...updates };
  requests[index] = updated;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return updated;
}

function deleteRequest(id: string): boolean {
  const requests = getRequests();
  const filtered = requests.filter((r) => r.id !== id);
  if (filtered.length === requests.length) return false;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(filtered));
  return true;
}

export const api = {
  getRole,
  setRole,
  getRequests,
  getRequestById,
  saveRequest,
  updateRequest,
  deleteRequest,
  generateId,
  getMockCleaners: () => MOCK_CLEANERS,
} as const;

export default api;
