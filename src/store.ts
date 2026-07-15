import type { UserRole, CleaningRequest, Cleaner, Review, ChatMessage, AppNotification } from './types';

const STORAGE_KEYS = {
  ROLE: 'cleanmatch_role',
  REQUESTS: 'cleanmatch_requests',
  REVIEWS: 'cleanmatch_reviews',
  MESSAGES: 'cleanmatch_messages',
  NOTIFICATIONS: 'cleanmatch_notifications',
  CLIENT_PROFILE: 'cleanmatch_client_profile',
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

// sessionStorage: 탭별로 독립적인 역할 유지
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

// --- 리뷰 관련 ---
function getReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) return [];
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
}

function getReviewById(id: string): Review | undefined {
  return getReviews().find((r) => r.id === id);
}

function getReviewsByCleanerId(cleanerId: string): Review[] {
  return getReviews().filter((r) => r.cleanerId === cleanerId);
}

function getReviewByRequestId(requestId: string): Review | undefined {
  return getReviews().find((r) => r.requestId === requestId);
}

function saveReview(review: Review): Review {
  const reviews = getReviews();
  reviews.push(review);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  // 리뷰 작성 후 해당 의뢰에 reviewId 저장
  updateRequest(review.requestId, { reviewId: review.id });
  return review;
}

function getCleanerAverageRating(cleanerId: string): number {
  const reviews = getReviewsByCleanerId(cleanerId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}


// --- 채팅 관련 ---
function getMessages(requestId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    const all = JSON.parse(raw) as ChatMessage[];
    return all.filter((m) => m.requestId === requestId);
  } catch {
    return [];
  }
}

function getAllMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function sendMessage(msg: Omit<ChatMessage, 'id' | 'createdAt' | 'read'>): ChatMessage {
  const all = getAllMessages();
  const newMsg: ChatMessage = {
    ...msg,
    id: generateId(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  all.push(newMsg);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  return newMsg;
}

function markMessagesRead(requestId: string, readerRole: UserRole): void {
  const all = getAllMessages();
  let changed = false;
  all.forEach((m) => {
    if (m.requestId === requestId && m.senderRole !== readerRole && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  }
}

function getUnreadCount(requestId: string, readerRole: UserRole): number {
  const msgs = getMessages(requestId);
  return msgs.filter((m) => m.senderRole !== readerRole && !m.read).length;
}


// --- 알림 관련 ---
function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

function addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  const all = getNotifications();
  const newN: AppNotification = {
    ...n,
    id: generateId(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  all.unshift(newN); // 최신이 위로
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  return newN;
}

function markNotificationRead(id: string): void {
  const all = getNotifications();
  const n = all.find((x) => x.id === id);
  if (n && !n.read) {
    n.read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  }
}

function markAllNotificationsRead(): void {
  const all = getNotifications();
  let changed = false;
  all.forEach((n) => { if (!n.read) { n.read = true; changed = true; } });
  if (changed) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
}

function getUnreadNotificationCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

// --- 의뢰인 프로필 관련 ---
interface ClientProfile {
  name: string;
  phone: string;
  address: string;
  photo: string;
}

function getClientProfile(): ClientProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as ClientProfile;
  } catch {
    return null;
  }
}

function saveClientProfile(profile: ClientProfile): void {
  localStorage.setItem(STORAGE_KEYS.CLIENT_PROFILE, JSON.stringify(profile));
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
  // 리뷰
  getReviews,
  getReviewById,
  getReviewsByCleanerId,
  getReviewByRequestId,
  saveReview,
  getCleanerAverageRating,
  // 채팅
  getMessages,
  getAllMessages,
  sendMessage,
  markMessagesRead,
  getUnreadCount,
  // 알림
  getNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  // 의뢰인 프로필
  getClientProfile,
  saveClientProfile,
} as const;

export default api;
