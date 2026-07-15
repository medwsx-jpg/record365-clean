import { useState } from 'react';

const SLIDES = [
  {
    illustration: (
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
        <circle cx="90" cy="90" r="70" fill="#DBEAFE" />
        <path d="M90 40l8 24a4 4 0 003 3l24 8-24 8a4 4 0 00-3 3l-8 24-8-24a4 4 0 00-3-3l-24-8 24-8a4 4 0 003-3l8-24z" fill="#F59E0B" stroke="#1E293B" strokeWidth="2" />
        <path d="M130 50l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z" fill="#3B82F6" />
        <path d="M50 120l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z" fill="#3B82F6" />
        <rect x="65" y="95" width="50" height="30" rx="6" fill="#86EFAC" stroke="#1E293B" strokeWidth="2" />
        <rect x="75" y="85" width="30" height="15" rx="4" fill="#FBBF24" stroke="#1E293B" strokeWidth="2" />
      </svg>
    ),
    title: '슥싹 매칭에 오신 것을\n환영합니다!',
    description: '검증된 청소 전문가로 활동하고\n안정적인 수입을 만들어보세요.',
  },
  {
    illustration: (
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
        <circle cx="90" cy="90" r="70" fill="#DBEAFE" />
        <rect x="70" y="50" width="45" height="80" rx="8" fill="#FBBF24" stroke="#1E293B" strokeWidth="2" />
        <rect x="76" y="60" width="33" height="50" rx="2" fill="white" />
        <circle cx="92.5" cy="120" r="3" fill="#1E293B" />
        <circle cx="108" cy="55" r="10" fill="#EF4444" stroke="#1E293B" strokeWidth="2" />
        <text x="108" y="59" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text>
        <path d="M40 90 C50 70, 60 80, 70 75" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="38" cy="90" r="4" fill="white" stroke="#1E293B" strokeWidth="2" />
      </svg>
    ),
    title: '주변 의뢰를\n실시간으로 확인하세요',
    description: '가까운 곳의 청소 의뢰를\n거리순, 가격순으로 바로 확인할 수 있어요.',
  },
  {
    illustration: (
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
        <circle cx="90" cy="90" r="70" fill="#DBEAFE" />
        <path d="M90 45c-25 5-40 10-40 10v35c0 25 17 40 40 50 23-10 40-25 40-50V55s-15-5-40-10z" fill="white" stroke="#1E293B" strokeWidth="2" />
        <path d="M90 55v75M55 85h70" stroke="#1E293B" strokeWidth="1.5" />
        <rect x="60" y="60" width="25" height="22" fill="#1E293B" rx="2" />
        <rect x="95" y="60" width="25" height="22" fill="#3B82F6" rx="2" />
        <rect x="60" y="88" width="25" height="22" fill="#3B82F6" rx="2" />
        <rect x="95" y="88" width="25" height="22" fill="#1E293B" rx="2" />
        <path d="M90 78l4 8 8 2-6 6 1 9-7-4-7 4 1-9-6-6 8-2 4-8z" fill="#FBBF24" />
        <path d="M135 55l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z" fill="#3B82F6" />
        <path d="M45 120l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#3B82F6" />
      </svg>
    ),
    title: '등급이 올라갈수록\n더 많은 혜택을 받아요',
    description: '우선 매칭, 상위 노출, 전담 지원 등\n등급별 다양한 혜택이 제공됩니다.',
  },
  {
    illustration: (
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
        <circle cx="90" cy="90" r="70" fill="#DBEAFE" />
        <rect x="55" y="45" width="70" height="90" rx="8" fill="white" stroke="#1E293B" strokeWidth="2" />
        <rect x="65" y="60" width="14" height="14" rx="3" fill="#22C55E" stroke="#1E293B" strokeWidth="1.5" />
        <path d="M68 67l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="85" y="63" width="30" height="6" rx="3" fill="#E5E7EB" />
        <rect x="65" y="82" width="14" height="14" rx="3" fill="#22C55E" stroke="#1E293B" strokeWidth="1.5" />
        <path d="M68 89l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="85" y="85" width="25" height="6" rx="3" fill="#E5E7EB" />
        <rect x="65" y="104" width="14" height="14" rx="3" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
        <rect x="85" y="107" width="28" height="6" rx="3" fill="#E5E7EB" />
        <path d="M130 60l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z" fill="#3B82F6" />
        <path d="M45 75l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#3B82F6" />
      </svg>
    ),
    title: '프로필 등록과 교육만\n완료하면 시작할 수 있어요',
    description: '간단한 프로필 등록과 교육 영상 시청 후\n바로 의뢰를 수락할 수 있습니다.',
  },
];

const STORAGE_KEY = 'cleanmatch_cleaner_onboarding_done';

export function shouldShowOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'true';
}

export default function CleanerOnboarding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, 'true');
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  };

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[480px] mx-auto">
      {/* 일러스트 + 텍스트 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="mb-10">
          {slide.illustration}
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center whitespace-pre-line leading-snug">
          {slide.title}
        </h2>
        <p className="text-sm text-gray-500 text-center mt-4 whitespace-pre-line leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* 하단: 도트 + 버튼 */}
      <div className="pb-6 px-6">
        {/* 도트 인디케이터 */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === current ? 'w-2.5 h-2.5 bg-gray-800' : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* 다음/시작 버튼 */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-blue-500 text-white font-bold text-base rounded-2xl active:bg-blue-600 transition-colors"
        >
          {isLast ? '시작하기' : '다음'}
        </button>

        {/* 다시 안보기 */}
        <button
          onClick={handleSkip}
          className="w-full py-3 mt-2 text-sm text-gray-400 font-medium"
        >
          다시 안보기
        </button>
      </div>
    </div>
  );
}
