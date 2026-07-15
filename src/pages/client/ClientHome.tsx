import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest, RequestStatus } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';
import BottomNav from '../../components/BottomNav';

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: '대기중', bg: 'bg-gray-100', text: 'text-gray-600' },
  matching: { label: '매칭중', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  matched: { label: '매칭완료', bg: 'bg-green-100', text: 'text-green-700' },
  in_progress: { label: '청소 진행중', bg: 'bg-blue-100', text: 'text-blue-700' },
  waiting_confirm: { label: '확인 대기', bg: 'bg-orange-100', text: 'text-orange-700' },
  completed: { label: '완료', bg: 'bg-gray-100', text: 'text-gray-500' },
};

function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function ClientHome() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CleaningRequest[]>([]);

  useEffect(() => {
    setRequests(api.getRequests());
    // 주기적으로 상태 변경 감지 (청소자가 완료 제출했을 때)
    const interval = setInterval(() => {
      setRequests(api.getRequests());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const active = requests.filter((r) =>
    ['pending', 'matching', 'matched', 'in_progress', 'waiting_confirm'].includes(r.status),
  );
  const completed = requests.filter((r) => r.status === 'completed');

  const handleCardClick = (req: CleaningRequest) => {
    if (req.status === 'pending') {
      navigate(`/clean/client/matching/${req.id}`);
    } else if (req.status === 'waiting_confirm') {
      navigate(`/clean/client/review/${req.id}`);
    } else if (req.status === 'completed') {
      navigate(`/clean/client/review/${req.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-40">
        <h1 className="text-xl font-bold text-green-500">CleanMatch</h1>
      </header>

      <div className="px-4 pt-4 space-y-6">
        {/* New Request Button */}
        <button
          onClick={() => navigate('/clean/client/create')}
          className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 청소 의뢰
        </button>

        {/* Active Requests */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            진행 중인 의뢰
          </h2>
          {active.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
              진행 중인 의뢰가 없습니다.
              <br />
              새 청소 의뢰를 등록해 보세요!
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((req) => (
                <button
                  key={req.id}
                  onClick={() => handleCardClick(req)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">
                      {CATEGORY_LABELS[req.category]} · {req.date}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm text-gray-600 truncate">{req.address}</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {formatPrice(req.price)}
                  </p>
                  {req.status === 'waiting_confirm' && (
                    <div className="mt-2 bg-orange-50 rounded-lg px-3 py-2 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span className="text-xs text-orange-700 font-medium">청소가 완료되었습니다. 결과를 확인해주세요!</span>
                    </div>
                  )}
                  {req.status === 'in_progress' && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-600">청소자가 작업 중입니다</span>
                    </div>
                  )}
                  {req.cleanerName && req.status !== 'matching' && (
                    <p className="text-xs text-gray-400 mt-1">청소자: {req.cleanerName}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Completed Requests */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            최근 완료
          </h2>
          {completed.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
              완료된 의뢰가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((req) => (
                <button
                  key={req.id}
                  onClick={() => handleCardClick(req)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">
                      {CATEGORY_LABELS[req.category]} · {req.date}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm text-gray-600 truncate">{req.address}</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {formatPrice(req.price)}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs text-gray-400">
                    <span>사진 {req.photos?.length ?? 0}장</span>
                    {req.afterPhotos && (
                      <span>/ 완료 사진 {req.afterPhotos.length}장</span>
                    )}
                  </div>
                  {req.cleanerName && (
                    <p className="text-xs text-gray-400 mt-1">청소자: {req.cleanerName}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
