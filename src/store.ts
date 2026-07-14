import type { UserRole, CleaningRequest, Cleaner } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  ROLE: 'cleanmatch_role',
  REQUESTS: 'cleanmatch_requests',
} as const;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

export const MOCK_CLEANERS: Cleaner[] = [
  {
    id: 'cleaner-1',
    name: '김미영',
    rating: 4.9,
    completedJobs: 127,
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=miyo',
    distance: 1.2,
  },
  {
    id: 'cleaner-2',
    name: '박정희',
    rating: 4.7,
    completedJobs: 84,
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=jung',
    distance: 2.5,
  },
  {
    id: 'cleaner-3',
    name: '이수진',
    rating: 4.8,
    completedJobs: 203,
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=sujin',
    distance: 0.8,
  },
  {
    id: 'cleaner-4',
    name: '최은지',
    rating: 4.6,
    completedJobs: 56,
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=eunji',
    distance: 3.1,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Role
// ---------------------------------------------------------------------------

function getRole(): UserRole | null {
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  if (role === 'client' || role === 'cleaner') return role;
  return null;
}

function setRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
}

// ---------------------------------------------------------------------------
// Requests CRUD
// ---------------------------------------------------------------------------

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

function updateRequest(
  id: string,
  updates: Partial<Omit<CleaningRequest, 'id'>>,
): CleaningRequest | null {
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

// ---------------------------------------------------------------------------
// Matching simulation
// ---------------------------------------------------------------------------

/**
 * Simulates an asynchronous matching process.
 * After ~5 seconds the request transitions from 'matching' → 'matched'
 * with a randomly chosen mock cleaner.
 *
 * Returns a cleanup function that cancels the pending timeout.
 */
function simulateMatching(requestId: string): () => void {
  // Immediately mark as 'matching'
  updateRequest(requestId, { status: 'matching' });

  const timer = window.setTimeout(() => {
    const cleaner =
      MOCK_CLEANERS[Math.floor(Math.random() * MOCK_CLEANERS.length)];

    updateRequest(requestId, {
      status: 'matched',
      cleanerId: cleaner.id,
      cleanerName: cleaner.name,
      cleanerRating: cleaner.rating,
      cleanerPhoto: cleaner.photo,
    });
  }, 5000);

  return () => clearTimeout(timer);
}

// ---------------------------------------------------------------------------
// Public API object
// ---------------------------------------------------------------------------

/**
 * All data access goes through this `api` object so swapping in a real
 * backend later requires changing only this file.
 */
export const api = {
  // Role
  getRole,
  setRole,

  // Requests
  getRequests,
  getRequestById,
  saveRequest,
  updateRequest,
  deleteRequest,

  // Matching
  simulateMatching,

  // Helpers
  generateId,

  // Mock data (exposed for UI listing)
  getMockCleaners: () => MOCK_CLEANERS,
} as const;

export default api;
