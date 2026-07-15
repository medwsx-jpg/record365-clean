import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
}

const TRAINING_MODULES: Omit<TrainingModule, 'completed'>[] = [
  {
    id: 'basic',
    title: '기본 청소 매뉴얼',
    description: '슥싹 매칭 서비스의 기본 청소 절차와 고객 응대 방법을 배웁니다.',
    duration: '15분',
    videoUrl: '',
  },
  {
    id: 'safety',
    title: '안전 및 위생 교육',
    description: '청소 시 안전 수칙과 위생 관리 방법을 학습합니다.',
    duration: '10분',
    videoUrl: '',
  },
  {
    id: 'tools',
    title: '청소 도구 사용법',
    description: '각 청소 도구의 올바른 사용법과 관리 방법을 배웁니다.',
    duration: '12분',
    videoUrl: '',
  },
  {
    id: 'service',
    title: '서비스 이용 가이드',
    description: '앱 사용법, 의뢰 수락, 완료 보고 등 서비스 이용 방법을 안내합니다.',
    duration: '8분',
    videoUrl: '',
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

// 영상 시청 모달
function VideoPlayer({
  module,
  onComplete,
  onClose,
}: {
  module: TrainingModule;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 데모: 10초 후 완료 가능 (실제로는 영상 길이에 맞춤)
    intervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 10, 100);
        if (next >= 100) {
          setCanComplete(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden">
        {/* 영상 영역 (데모) */}
        <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
          <div className="text-center text-white">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white" className="mx-auto mb-2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <p className="text-sm opacity-80">{module.title}</p>
            <p className="text-xs opacity-50 mt-1">데모 영상 (10초)</p>
          </div>
          {/* 진행 바 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-1">{module.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{module.description}</p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">진행률: {progress}%</span>
            <span className="text-xs text-gray-400">{module.duration}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 font-medium"
            >
              닫기
            </button>
            <button
              onClick={onComplete}
              disabled={!canComplete}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium disabled:bg-gray-300 disabled:text-gray-500"
            >
              {canComplete ? '시청 완료' : '영상을 끝까지 시청하세요'}
            </button>
          </div>
        </div>
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
            onClick={() => !mod.completed && setPlayingModule(mod.id)}
            className={`w-full text-left bg-white rounded-xl border p-4 transition-colors ${
              mod.completed
                ? 'border-green-200 bg-green-50/50'
                : 'border-gray-200 active:bg-gray-50'
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
                {mod.completed && (
                  <span className="inline-block mt-1.5 text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    이수 완료
                  </span>
                )}
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

      {/* 영상 플레이어 모달 */}
      {playingModule && (
        <VideoPlayer
          module={modules.find((m) => m.id === playingModule)!}
          onComplete={() => handleComplete(playingModule)}
          onClose={() => setPlayingModule(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
