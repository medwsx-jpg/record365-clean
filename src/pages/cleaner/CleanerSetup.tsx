import { useNavigate } from 'react-router-dom';
import { isTrainingCompleted } from './CleanerTraining';

interface StepInfo {
  label: string;
  description: string;
  completed: boolean;
  action: () => void;
}

export function isSetupCompleted(): boolean {
  const hasProfile = !!localStorage.getItem('cleanmatch_cleaner_profile');
  const trainingDone = isTrainingCompleted();
  return hasProfile && trainingDone;
}

export default function CleanerSetup() {
  const navigate = useNavigate();
  const hasProfile = !!localStorage.getItem('cleanmatch_cleaner_profile');
  const trainingDone = isTrainingCompleted();

  const steps: StepInfo[] = [
    {
      label: '프로필 등록',
      description: '이름, 연락처, 경력 등 기본 정보를 등록하세요.',
      completed: hasProfile,
      action: () => navigate('/clean/cleaner/profile'),
    },
    {
      label: '교육 영상 시청',
      description: '청소 매뉴얼과 서비스 이용법을 학습하세요.',
      completed: trainingDone,
      action: () => navigate('/clean/cleaner/training'),
    },
    {
      label: '청소 매칭 시작',
      description: '주변 의뢰를 확인하고 수락할 수 있습니다.',
      completed: false,
      action: () => {},
    },
  ];

  // 현재 진행해야 할 단계 인덱스
  const currentStep = !hasProfile ? 0 : !trainingDone ? 1 : 2;

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto">
      {/* 헤더 */}
      <header className="bg-gray-900 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">이용 준비</h1>
        <button
          onClick={() => navigate('/clean')}
          className="text-sm text-gray-400"
        >
          나가기
        </button>
      </header>

      {/* 안내 메시지 */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-lg font-bold text-gray-900">
          청소 매칭을 위해 준비가 필요합니다.
        </h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          아래 순서에 따라 등록을 완료해 주세요.{'\n'}
          모든 단계를 완료하면 의뢰 수락이 가능합니다.
        </p>
      </div>

      {/* 단계별 안내 */}
      <div className="px-5 pt-2 pb-8">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isLocked = idx > currentStep;
          const isDone = step.completed;

          return (
            <div key={idx}>
              {/* 스텝 카드 */}
              <button
                onClick={() => {
                  if (isActive && !isDone) step.action();
                }}
                disabled={isLocked || isDone}
                className={`w-full rounded-2xl py-4 px-5 text-left transition-all ${
                  isActive && !isDone
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 active:bg-blue-600'
                    : isDone
                    ? 'bg-white border-2 border-green-400'
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 상태 아이콘 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-green-500'
                      : isActive
                      ? 'bg-white/20'
                      : 'bg-gray-200'
                  }`}>
                    {isDone ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1">
                    <p className={`font-bold ${
                      isActive && !isDone ? 'text-white' : isDone ? 'text-green-700' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>

                  {/* 화살표 (활성 단계만) */}
                  {isActive && !isDone && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  {isDone && (
                    <span className="text-xs text-green-600 font-medium">완료</span>
                  )}
                </div>
              </button>

              {/* 설명 텍스트 */}
              <p className={`text-xs mt-2 mb-1 px-2 ${
                isActive && !isDone ? 'text-gray-600' : isDone ? 'text-green-600' : 'text-gray-400'
              }`}>
                {isDone ? `* ${step.label}이 완료되었습니다.` : `* ${step.description}`}
              </p>

              {/* 화살표 연결 (마지막 제외) */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDone ? '#22C55E' : '#D1D5DB'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
