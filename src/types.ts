export type UserRole = 'client' | 'cleaner';

export type RequestStatus = 'pending' | 'matching' | 'matched' | 'in_progress' | 'waiting_confirm' | 'completed';

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
