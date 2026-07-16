import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type {
  UserRole,
  CleaningRequest,
  Review,
  ChatMessage,
  AppNotification,
  RecurringSchedule,
} from './types';

// --- 컬렉션 참조 ---
const requestsCol = collection(db, 'clean_requests');
const reviewsCol = collection(db, 'clean_reviews');
const messagesCol = collection(db, 'clean_messages');
const notificationsCol = collection(db, 'clean_notifications');
const profilesCol = collection(db, 'clean_profiles');
const recurringCol = collection(db, 'clean_recurring');

// --- 헬퍼 ---
function toISO(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function docToRequest(id: string, data: Record<string, unknown>): CleaningRequest {
  return {
    ...data,
    id,
    createdAt: toISO(data.createdAt),
    completedAt: data.completedAt ? toISO(data.completedAt) : undefined,
    cancelledAt: data.cancelledAt ? toISO(data.cancelledAt) : undefined,
    asRequestedAt: data.asRequestedAt ? toISO(data.asRequestedAt) : undefined,
  } as CleaningRequest;
}

// --- 현재 사용자 UID ---
export function getCurrentUserId(): string {
  return auth.currentUser?.uid || 'anonymous';
}

// --- 역할 (sessionStorage 유지) ---
export function getRole(): UserRole | null {
  const role = sessionStorage.getItem('cleanmatch_role');
  if (role === 'client' || role === 'cleaner') return role;
  return null;
}

export function setRole(role: UserRole): void {
  sessionStorage.setItem('cleanmatch_role', role);
}

// --- 의뢰 CRUD ---
export async function getRequests(): Promise<CleaningRequest[]> {
  const role = getRole();
  const uid = getCurrentUserId();
  // 의뢰인: 내 의뢰만, 청소자: 전체 의뢰
  const q = role === 'client'
    ? query(requestsCol, where('userId', '==', uid), orderBy('createdAt', 'desc'))
    : query(requestsCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToRequest(d.id, d.data() as Record<string, unknown>));
}

export async function getRequestById(id: string): Promise<CleaningRequest | undefined> {
  const snap = await getDoc(doc(db, 'clean_requests', id));
  if (!snap.exists()) return undefined;
  return docToRequest(snap.id, snap.data() as Record<string, unknown>);
}

export async function saveRequest(request: Omit<CleaningRequest, 'id'>): Promise<CleaningRequest> {
  const uid = getCurrentUserId();
  const docRef = await addDoc(requestsCol, {
    ...request,
    userId: uid,
    createdAt: serverTimestamp(),
  });
  return { ...request, id: docRef.id, createdAt: new Date().toISOString() } as CleaningRequest;
}

export async function updateRequest(
  id: string,
  updates: Partial<Omit<CleaningRequest, 'id'>>
): Promise<CleaningRequest | null> {
  const ref = doc(db, 'clean_requests', id);
  await updateDoc(ref, updates as Record<string, unknown>);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToRequest(snap.id, snap.data() as Record<string, unknown>);
}

export async function deleteRequest(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'clean_requests', id));
  return true;
}

// 실시간 구독
export function subscribeRequests(cb: (requests: CleaningRequest[]) => void): Unsubscribe {
  return onSnapshot(query(requestsCol, orderBy('createdAt', 'desc')), (snap) => {
    cb(snap.docs.map((d) => docToRequest(d.id, d.data() as Record<string, unknown>)));
  });
}

// --- 리뷰 ---
export async function getReviews(): Promise<Review[]> {
  const snap = await getDocs(reviewsCol);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as Review);
}

export async function getReviewsByCleanerId(cleanerId: string): Promise<Review[]> {
  const snap = await getDocs(query(reviewsCol, where('cleanerId', '==', cleanerId)));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as Review);
}

export async function getReviewByRequestId(requestId: string): Promise<Review | undefined> {
  const snap = await getDocs(query(reviewsCol, where('requestId', '==', requestId)));
  if (snap.empty) return undefined;
  const d = snap.docs[0];
  return { ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) } as Review;
}

export async function saveReview(review: Omit<Review, 'id'>): Promise<Review> {
  const docRef = await addDoc(reviewsCol, { ...review, createdAt: serverTimestamp() });
  const saved = { ...review, id: docRef.id, createdAt: new Date().toISOString() } as Review;
  // 리뷰 작성 후 해당 의뢰에 reviewId 저장
  await updateRequest(review.requestId, { reviewId: saved.id });
  return saved;
}

export async function getCleanerAverageRating(cleanerId: string): Promise<number> {
  const reviews = await getReviewsByCleanerId(cleanerId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// --- 채팅 ---
export async function getMessages(requestId: string): Promise<ChatMessage[]> {
  const snap = await getDocs(
    query(messagesCol, where('requestId', '==', requestId), orderBy('createdAt', 'asc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as ChatMessage);
}

export async function getAllMessages(): Promise<ChatMessage[]> {
  const snap = await getDocs(query(messagesCol, orderBy('createdAt', 'asc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as ChatMessage);
}

export async function sendMessage(
  msg: Omit<ChatMessage, 'id' | 'createdAt' | 'read'>
): Promise<ChatMessage> {
  const docRef = await addDoc(messagesCol, { ...msg, createdAt: serverTimestamp(), read: false });
  return { ...msg, id: docRef.id, createdAt: new Date().toISOString(), read: false } as ChatMessage;
}

export async function markMessagesRead(requestId: string, readerRole: UserRole): Promise<void> {
  const snap = await getDocs(
    query(messagesCol, where('requestId', '==', requestId), where('senderRole', '!=', readerRole))
  );
  const updates = snap.docs.filter((d) => !d.data().read).map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}

export async function getUnreadCount(requestId: string, readerRole: UserRole): Promise<number> {
  const msgs = await getMessages(requestId);
  return msgs.filter((m) => m.senderRole !== readerRole && !m.read).length;
}

// 실시간 채팅 구독
export function subscribeMessages(requestId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
  return onSnapshot(
    query(messagesCol, where('requestId', '==', requestId), orderBy('createdAt', 'asc')),
    (snap) => {
      cb(snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as ChatMessage));
    }
  );
}

// --- 알림 ---
export async function getNotifications(): Promise<AppNotification[]> {
  const uid = getCurrentUserId();
  const snap = await getDocs(query(notificationsCol, where('userId', '==', uid), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as AppNotification);
}

export async function addNotification(
  n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): Promise<AppNotification> {
  const uid = getCurrentUserId();
  const docRef = await addDoc(notificationsCol, { ...n, userId: uid, createdAt: serverTimestamp(), read: false });
  return { ...n, id: docRef.id, createdAt: new Date().toISOString(), read: false } as AppNotification;
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'clean_notifications', id), { read: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  const uid = getCurrentUserId();
  const snap = await getDocs(query(notificationsCol, where('userId', '==', uid), where('read', '==', false)));
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const uid = getCurrentUserId();
  const snap = await getDocs(query(notificationsCol, where('userId', '==', uid), where('read', '==', false)));
  return snap.size;
}

// --- 의뢰인 프로필 ---
export interface ClientProfile {
  name: string;
  phone: string;
  address: string;
  photo: string;
}

export async function getClientProfile(userId?: string): Promise<ClientProfile | null> {
  const id = userId || getCurrentUserId();
  const snap = await getDoc(doc(db, 'clean_profiles', id));
  if (!snap.exists()) return null;
  return snap.data() as ClientProfile;
}

export async function saveClientProfile(profile: ClientProfile, userId?: string): Promise<void> {
  const id = userId || getCurrentUserId();
  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'clean_profiles', id), profile);
}

// --- 정기 청소 ---
export async function getRecurringSchedules(): Promise<RecurringSchedule[]> {
  const uid = getCurrentUserId();
  const snap = await getDocs(query(recurringCol, where('userId', '==', uid), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: toISO(d.data().createdAt) }) as RecurringSchedule);
}

export async function saveRecurringSchedule(
  schedule: Omit<RecurringSchedule, 'id' | 'createdAt' | 'active'>
): Promise<RecurringSchedule> {
  const uid = getCurrentUserId();
  const docRef = await addDoc(recurringCol, { ...schedule, userId: uid, active: true, createdAt: serverTimestamp() });
  return { ...schedule, id: docRef.id, active: true, createdAt: new Date().toISOString() } as RecurringSchedule;
}

export async function updateRecurringSchedule(id: string, updates: Partial<RecurringSchedule>): Promise<void> {
  await updateDoc(doc(db, 'clean_recurring', id), updates as Record<string, unknown>);
}
export async function deleteRecurringSchedule(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clean_recurring', id));
}

// --- Mock Cleaners (임시, 추후 Firestore 전환) ---
export const MOCK_CLEANERS = [
  { id: 'cleaner-1', name: '김미영', rating: 4.9, completedJobs: 127, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=miyo', distance: 1.2 },
  { id: 'cleaner-2', name: '박정희', rating: 4.7, completedJobs: 84, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=jung', distance: 2.5 },
  { id: 'cleaner-3', name: '이수진', rating: 4.8, completedJobs: 203, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=sujin', distance: 0.8 },
  { id: 'cleaner-4', name: '최은지', rating: 4.6, completedJobs: 56, photo: 'https://api.dicebear.com/7.x/personas/svg?seed=eunji', distance: 3.1 },
];
