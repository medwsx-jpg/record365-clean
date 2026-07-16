// Firestore 기반 store (기존 localStorage 코드는 store.local.ts 로 백업됨)
import type { UserRole, CleaningRequest, Cleaner, Review, ChatMessage, AppNotification, RecurringSchedule } from './types';
import * as fs from './firestore-store';
export { subscribeRequests, subscribeMessages } from './firestore-store';
export type { ClientProfile } from './firestore-store';

export const MOCK_CLEANERS: Cleaner[] = fs.MOCK_CLEANERS;

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const api = {
  // 역할 (sessionStorage — 동기)
  getRole: fs.getRole,
  setRole: fs.setRole,
  // 의뢰 (async)
  getRequests: fs.getRequests,
  getRequestById: fs.getRequestById,
  saveRequest: fs.saveRequest,
  updateRequest: fs.updateRequest,
  deleteRequest: fs.deleteRequest,
  generateId,
  getMockCleaners: () => MOCK_CLEANERS,
  // 리뷰 (async)
  getReviews: fs.getReviews,
  getReviewById: async (id: string) => {
    const reviews = await fs.getReviews();
    return reviews.find((r: Review) => r.id === id);
  },
  getReviewsByCleanerId: fs.getReviewsByCleanerId,
  getReviewByRequestId: fs.getReviewByRequestId,
  saveReview: fs.saveReview,
  getCleanerAverageRating: fs.getCleanerAverageRating,
  // 채팅 (async)
  getMessages: fs.getMessages,
  getAllMessages: fs.getAllMessages,
  sendMessage: fs.sendMessage,
  markMessagesRead: fs.markMessagesRead,
  getUnreadCount: fs.getUnreadCount,
  // 알림 (async)
  getNotifications: fs.getNotifications,
  addNotification: fs.addNotification,
  markNotificationRead: fs.markNotificationRead,
  markAllNotificationsRead: fs.markAllNotificationsRead,
  getUnreadNotificationCount: fs.getUnreadNotificationCount,
  // 의뢰인 프로필 (async)
  getClientProfile: fs.getClientProfile,
  saveClientProfile: fs.saveClientProfile,
  // 정기 청소 (async)
  getRecurringSchedules: fs.getRecurringSchedules,
  saveRecurringSchedule: fs.saveRecurringSchedule,
  updateRecurringSchedule: fs.updateRecurringSchedule,
  deleteRecurringSchedule: fs.deleteRecurringSchedule,
} as const;

export default api;
