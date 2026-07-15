export type UserRole = 'client' | 'cleaner';

export type RequestStatus = 'pending' | 'matching' | 'matched' | 'in_progress' | 'waiting_confirm' | 'completed' | 'cancelled' | 'as_requested';

export type CleaningZone = 'sink' | 'bathroom' | 'living' | 'kitchen' | 'bedroom' | 'other';

export type CleaningCategory = 'home' | 'office' | 'store' | 'move' | 'appliance' | 'other';

export const CATEGORY_LABELS: Record<CleaningCategory, string> = {
  home: '집 청소',
  office: '사무실 청소',
  store: '매장 청소',
  move: '입주/이사 청소',
  appliance: '가전 청소',
  other: '기타',
};

export const CATEGORY_ICONS: Record<CleaningCategory, string> = {
  home: '\u{1F3E0}',
  office: '\u{1F3E2}',
  store: '\u{1F3EA}',
  move: '\u{1F4E6}',
  appliance: '\u{1F527}',
  other: '✨',
};

export interface Photo {
  id: string;
  zone: string;
  dataUrl: string;
  memo: string;
  type: 'before' | 'after';
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  cleanerId: string;
  cleanerName: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CleaningRequest {
  id: string;
  clientId: string;
  category: CleaningCategory;
  date: string;
  time: string;
  address: string;
  price: number;
  notes: string;
  photos: Photo[];
  status: RequestStatus;
  cleanerId?: string;
  cleanerName?: string;
  cleanerRating?: number;
  cleanerPhoto?: string;
  checklist?: ChecklistItem[];
  afterPhotos?: Photo[];
  completedAt?: string;
  reviewId?: string;
  cancelReason?: string;
  cancelledAt?: string;
  asComment?: string;
  asRequestedAt?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  zone: string;
  task: string;
  completed: boolean;
}

export interface Cleaner {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  photo: string;
  distance?: number;
}

export const ZONE_LABELS: Record<CleaningZone, string> = {
  sink: '싱크대',
  bathroom: '화장실',
  living: '거실',
  kitchen: '주방',
  bedroom: '침실',
  other: '기타',
};

export const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { zone: 'sink', task: '싱크대 청소 및 물때 제거', completed: false },
  { zone: 'bathroom', task: '화장실 변기 및 세면대 청소', completed: false },
  { zone: 'bathroom', task: '화장실 바닥 및 벽면 청소', completed: false },
  { zone: 'living', task: '거실 바닥 청소 및 먼지 제거', completed: false },
  { zone: 'kitchen', task: '주방 가스레인지 및 조리대 청소', completed: false },
  { zone: 'kitchen', task: '주방 바닥 청소', completed: false },
  { zone: 'bedroom', task: '침실 바닥 및 먼지 제거', completed: false },
  { zone: 'other', task: '현관 및 복도 청소', completed: false },
];

export function getZoneLabel(zone: string): string {
  return (ZONE_LABELS as Record<string, string>)[zone] ?? zone;
}

export const CANCEL_REASONS = [
  '일정이 변경되었습니다',
  '다른 청소 서비스를 이용합니다',
  '가격이 맞지 않습니다',
  '개인 사정으로 취소합니다',
  '기타',
] as const;

export const AS_REASONS = [
  '청소 상태가 불만족스럽습니다',
  '요청한 구역이 청소되지 않았습니다',
  '약속된 시간보다 일찍 종료되었습니다',
  '청소 도구/세제 문제가 있었습니다',
  '기타',
] as const;

// 매칭 대기 시간 (시간 단위)
export const MATCHING_TIMEOUT_HOURS = 24;

// --- 채팅 관련 ---
export type ChatMessageType = 'text' | 'image' | 'system';

export interface ChatMessage {
  id: string;
  requestId: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  type: ChatMessageType;
  createdAt: string;
  read: boolean;
}

// --- 알림 관련 ---
export type NotificationType = 'matched' | 'in_progress' | 'waiting_confirm' | 'completed' | 'as_requested' | 'review' | 'chat' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: string;
  read: boolean;
  createdAt: string;
}

// --- 정기 청소 관련 ---
export interface RecurringSchedule {
  id: string;
  category: CleaningCategory;
  address: string;
  price: number;
  notes: string;
  days: number[]; // 0=일, 1=월, ..., 6=토
  time: string;
  frequency: 'weekly' | 'biweekly'; // 매주 / 격주
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
}
