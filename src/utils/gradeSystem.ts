export interface GradeInfo {
  key: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minJobs: number;
  feeDiscount: number;
  priorityMatching: boolean;
  badgeVisible: boolean;
  exposurePriority: number;
  benefits: string[];
}

export const GRADES: GradeInfo[] = [
  {
    key: 'bronze',
    label: '브론즈',
    emoji: '🥉',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    minJobs: 0,
    feeDiscount: 0,
    priorityMatching: false,
    badgeVisible: false,
    exposurePriority: 1,
    benefits: ['기본 의뢰 수락 가능'],
  },
  {
    key: 'silver',
    label: '실버',
    emoji: '🥈',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    minJobs: 10,
    feeDiscount: 3,
    priorityMatching: false,
    badgeVisible: true,
    exposurePriority: 2,
    benefits: ['수수료 3% 할인', '실버 뱃지 표시', '의뢰자에게 등급 노출'],
  },
  {
    key: 'gold',
    label: '골드',
    emoji: '🥇',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    minJobs: 30,
    feeDiscount: 5,
    priorityMatching: true,
    badgeVisible: true,
    exposurePriority: 3,
    benefits: ['수수료 5% 할인', '우선 매칭 지원', '골드 뱃지 표시', '상위 노출'],
  },
  {
    key: 'platinum',
    label: '플래티넘',
    emoji: '💎',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    minJobs: 100,
    feeDiscount: 10,
    priorityMatching: true,
    badgeVisible: true,
    exposurePriority: 4,
    benefits: ['수수료 10% 할인', '최우선 매칭', '플래티넘 뱃지 표시', '최상위 노출', '전담 고객 지원'],
  },
];

export function getGradeByJobs(completedJobs: number): GradeInfo {
  for (let i = GRADES.length - 1; i >= 0; i--) {
    if (completedJobs >= GRADES[i].minJobs) return GRADES[i];
  }
  return GRADES[0];
}

export function getNextGrade(completedJobs: number): GradeInfo | null {
  const current = getGradeByJobs(completedJobs);
  const idx = GRADES.findIndex((g) => g.key === current.key);
  return idx < GRADES.length - 1 ? GRADES[idx + 1] : null;
}

export function getProgressToNextGrade(completedJobs: number): { current: number; required: number; percent: number } {
  const next = getNextGrade(completedJobs);
  if (!next) return { current: completedJobs, required: completedJobs, percent: 100 };
  const current = getGradeByJobs(completedJobs);
  const range = next.minJobs - current.minJobs;
  const progress = completedJobs - current.minJobs;
  return {
    current: progress,
    required: range,
    percent: Math.round((progress / range) * 100),
  };
}
