import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  slideCount: number;
  slidePath: string;
  completed: boolean;
}

const TRAINING_MODULES: Omit<TrainingModule, 'completed'>[] = [
  {
    id: 'basic',
    title: '기본 청소 매뉴얼',
    description: '슥싹 매칭 서비스의 기본 청소 절차와 고객 응대 방법을 배웁니다.',
    duration: '15분',
    slideCount: 12,
    slidePath: '/training/basic',
  },
  {
    id: 'safety',
    title: '안전 및 위생 교육',
    description: '청소 시 안전 수칙과 위생 관리 방법을 학습합니다.',
    duration: '10분',
    slideCount: 12,
    slidePath: '/training/safety',
  },
  {
    id: 'tools',
    title: '청소 도구 사용법',
    description: '각 청소 도구의 올바른 사용법과 관리 방법을 배웁니다.',
    duration: '12분',
    slideCount: 12,
    slidePath: '/training/tools',
  },
  {
    id: 'service',
    title: '서비스 이용 가이드',
    description: '앱 사용법, 의뢰 수락, 완료 보고 등 서비스 이용 방법을 안내합니다.',
    duration: '8분',
    slideCount: 12,
    slidePath: '/training/service',
  },
];

const STORAGE_KEY = 'cleanmatch_training';

function getTrainingState(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveTrainingState(state: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isTrainingCompleted(): boolean {
  const state = getTrainingState();
  return TRAINING_MODULES.every((m) => state[m.id] === true);
}

// 슬라이드 뷰어 모달 (모바일 최적화: 풀폭 + 스와이프)
function SlideViewer({
  module,
  onComplete,
  onClose,
}: {
  module: TrainingModule;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [maxViewed, setMaxViewed] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const total = module.slideCount;
  const canComplete = maxViewed >= total - 1;

  const goNext = () => {
    if (currentSlide < total - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      setMaxViewed((prev) => Math.max(prev, next));
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
    setTouchStart(null);
  };

  const padNum = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/70 shrink-0">
        <button onClick={onClose} className="text-white/80 text-sm">
          ✕ 닫기
        </button>
        <h3 className="text-white text-sm font-medium">{module.title}</h3>
        <span className="text-white/60 text-xs">{currentSlide + 1} / {total}</span>
      </div>

      {/* 슬라이드 이미지 영역 — 풀폭 + 세로 스크롤 */}
      <div
        className="flex-1 overflow-y-auto relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={`${module.slidePath}/slide-${padNum(currentSlide + 1)}.jpg`}
          alt={`슬라이드 ${currentSlide + 1}`}
          className="w-full block"
        />

        {/* 이전 영역 (좌측 탭) */}
        {currentSlide > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 w-1/4 h-full opacity-0"
            aria-label="이전 슬라이드"
          />
        )}

        {/* 다음 영역 (우측 탭) */}
        {currentSlide < total - 1 && (
          <button
            onClick={goNext}
            className="absolute right-0 top-0 w-1/4 h-full opacity-0"
            aria-label="다음 슬라이드"
          />
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="px-4 py-3 bg-black/70 shrink-0">
        {/* 좌우 버튼 + 인디케이터 */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-20 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex gap-1 justify-center flex-1 flex-wrap">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentSlide
                    ? 'w-5 bg-green-400'
                    : i <= maxViewed
                    ? 'w-1.5 bg-green-400/50'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={goNext}
            disabled={currentSlide >= total - 1}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-20 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {canComplete ? (
          <button
            onClick={onComplete}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl active:bg-green-600 transition-colors"
          >
            이수 완료
          </button>
        ) : (
          <p className="text-center text-white/50 text-xs py-2">
            모든 슬라이드를 확인하면 이수 완료할 수 있습니다 ({maxViewed + 1}/{total})
          </p>
        )}
      </div>
    </div>
  );
}

export default function CleanerTraining() {
  const navigate = useNavigate();
  const [trainingState, setTrainingState] = useState<Record<string, boolean>>(getTrainingState());
  const [playingModule, setPlayingModule] = useState<string | null>(null);

  const modules: TrainingModule[] = TRAINING_MODULES.map((m) => ({
    ...m,
    completed: trainingState[m.id] === true,
  }));

  const completedCount = modules.filter((m) => m.completed).length;
  const allCompleted = completedCount === modules.length;

  const handleComplete = (moduleId: string) => {
    const next = { ...trainingState, [moduleId]: true };
    setTrainingState(next);
    saveTrainingState(next);
    setPlayingModule(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">초기 교육</h1>
      </header>

      {/* 진행 상황 */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-800">교육 진행 상황</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {allCompleted
                  ? '모든 교육을 완료했습니다!'
                  : '모든 교육을 이수해야 의뢰 수락이 가능합니다'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">{completedCount}/{modules.length}</p>
              <p className="text-[10px] text-gray-400">완료</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / modules.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 교육 모듈 목록 */}
      <div className="px-4 space-y-3 mt-2">
        {modules.map((mod, idx) => (
          <button
            key={mod.id}
            onClick={() => mod.slideCount > 0 && setPlayingModule(mod.id)}
            className={`w-full text-left bg-white rounded-xl border p-4 transition-colors ${
              mod.completed
                ? 'border-green-200 bg-green-50/50'
                : mod.slideCount > 0
                ? 'border-gray-200 active:bg-gray-50'
                : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                mod.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {mod.completed ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${mod.completed ? 'text-green-700' : 'text-gray-800'}`}>
                    {mod.title}
                  </h3>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{mod.duration}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                {mod.completed ? (
                  <span className="inline-block mt-1.5 text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    이수 완료
                  </span>
                ) : mod.slideCount === 0 ? (
                  <span className="inline-block mt-1.5 text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    준비 중
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 완료 버튼 */}
      {allCompleted && (
        <div className="px-4 mt-6">
          <button
            onClick={() => navigate('/clean/cleaner')}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl active:bg-green-600 transition-colors"
          >
            교육 완료 - 의뢰 수락 시작하기
          </button>
        </div>
      )}

      {/* 슬라이드 뷰어 모달 */}
      {playingModule && (
        <SlideViewer
          module={modules.find((m) => m.id === playingModule)!}
          onComplete={() => handleComplete(playingModule)}
          onClose={() => setPlayingModule(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
