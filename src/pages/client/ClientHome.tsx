import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest, RequestStatus } from '../../types';
import { CATEGORY_LABELS, CANCEL_REASONS } from '../../types';
import { api } from '../../store';
import BottomNav from '../../components/BottomNav';

const AUTO_COMPLETE_HOURS = 12;

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; text: string }> = {
  pending: { label: '대기중', bg: 'bg-gray-100', text: 'text-gray-600' },
  matching: { label: '매칭중', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  matched: { label: '매칭완료', bg: 'bg-green-100', text: 'text-green-700' },
  in_progress: { label: '청소 진행중', bg: 'bg-blue-100', text: 'text-blue-700' },
  waiting_confirm: { label: '확인 대기', bg: 'bg-orange-100', text: 'text-orange-700' },
  completed: { label: '완료', bg: 'bg-gray-100', text: 'text-gray-500' },
  cancelled: { label: '취소됨', bg: 'bg-red-50', text: 'text-red-500' },
};

function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

function getRemainingTime(completedAt?: string): string | null {
  if (!completedAt) return null;
  const deadline = new Date(completedAt).getTime() + AUTO_COMPLETE_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  const remaining = deadline - now;
  if (remaining <= 0) return null;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

function renderStars(rating: number) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24"
          fill={s <= rating ? '#facc15' : 'none'}
          stroke={s <= rating ? '#facc15' : '#d1d5db'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function ClientHome() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [, setTick] = useState(0);
  const [cancelModal, setCancelModal] = useState<{ requestId: string; step: 'confirm' | 'reason' } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const loadAndAutoComplete = () => {
      const reqs = api.getRequests();
      reqs.forEach((r) => {
        if (r.status === 'waiting_confirm' && r.completedAt) {
          const deadline = new Date(r.completedAt).getTime() + AUTO_COMPLETE_HOURS * 60 * 60 * 1000;
          if (Date.now() >= deadline) {
            api.updateRequest(r.id, { status: 'completed' });
          }
        }
      });
      setRequests(api.getRequests());
    };
    loadAndAutoComplete();
    const interval = setInterval(loadAndAutoComplete, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const active = requests.filter((r) =>
    ['pending', 'matching', 'matched', 'in_progress', 'waiting_confirm'].includes(r.status),
  );
  const completed = requests.filter((r) => r.status === 'completed');

  const handleCardClick = (req: CleaningRequest) => {
    if (req.status === 'pending') {
      navigate(`/clean/client/matching/${req.id}`);
    } else if (req.status === 'matched') {
      navigate(`/clean/client/matched/${req.id}`);
    } else if (req.status === 'waiting_confirm') {
      navigate(`/clean/client/review/${req.id}`);
    } else if (req.status === 'completed') {
      navigate(`/clean/client/review/${req.id}`);
    }
  };

  const handleCancelStart = (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation();
    setCancelModal({ requestId, step: 'confirm' });
    setCancelReason('');
  };

  const handleCancelConfirm = () => {
    if (!cancelModal) return;
    if (cancelModal.step === 'confirm') {
      setCancelModal({ ...cancelModal, step: 'reason' });
      return;
    }
    // 취소 처리
    api.updateRequest(cancelModal.requestId, {
      status: 'cancelled',
      cancelReason: cancelReason || '취소 사유 없음',
      cancelledAt: new Date().toISOString(),
    });
    setCancelModal(null);
    setRequests(api.getRequests());
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-40">
        <h1 className="text-xl font-bold text-green-500">CleanMatch</h1>
      </header>

      <div className="px-4 pt-4 space-y-6">
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

        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">진행 중인 의뢰</h2>
          {active.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
              진행 중인 의뢰가 없습니다.<br />새 청소 의뢰를 등록해 보세요!
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((req) => {
                const remaining = req.status === 'waiting_confirm' ? getRemainingTime(req.completedAt) : null;
                return (
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
                    <p className="text-sm font-semibold text-green-600 mt-1">{formatPrice(req.price)}</p>
                    {req.status === 'matched' && (
                      <div className="mt-2 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-xs text-green-700 font-medium">청소자가 매칭되었습니다. 청소일을 기다려주세요.</span>
                      </div>
                    )}
                    {req.status === 'waiting_confirm' && (
                      <div className="mt-2 bg-orange-50 rounded-lg px-3 py-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" className="shrink-0">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span className="text-xs text-orange-700 font-medium">청소가 완료되었습니다. 결과를 확인해주세요!</span>
                        </div>
                        {remaining && (
                          <div className="flex items-center gap-1.5 pl-5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9a3412" strokeWidth="2" className="shrink-0">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="text-[11px] text-orange-800">{remaining} 이후 자동 완료됩니다</span>
                          </div>
                        )}
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
                    {/* 취소 버튼: pending 상태만 */}
                    {req.status === 'pending' && (
                      <div className="mt-3 flex justify-end">
                        <span
                          onClick={(e) => handleCancelStart(e, req.id)}
                          className="text-xs text-red-400 underline cursor-pointer hover:text-red-500">
                          의뢰 취소
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">최근 완료</h2>
          {completed.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
              완료된 의뢰가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((req) => {
                const review = req.reviewId ? api.getReviewById(req.reviewId) : null;
                return (
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
                    <p className="text-sm font-semibold text-green-600 mt-1">{formatPrice(req.price)}</p>
                    {req.cleanerName && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">청소자: {req.cleanerName}</p>
                        {review ? renderStars(review.rating) : (
                          <span className="text-xs text-yellow-500 font-medium">리뷰 작성하기 ⭐</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 취소 모달 */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            {cancelModal.step === 'confirm' ? (
              <>
                <div className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">의뢰를 취소하시겠습니까?</h3>
                  <p className="text-sm text-gray-500">취소하면 되돌릴 수 없습니다.</p>
                </div>
                <div className="flex border-t border-gray-200">
                  <button onClick={() => setCancelModal(null)}
                    className="flex-1 py-3.5 text-sm font-medium text-gray-600 border-r border-gray-200">아니오</button>
                  <button onClick={handleCancelConfirm}
                    className="flex-1 py-3.5 text-sm font-medium text-red-500">취소하기</button>
                </div>
              </>
            ) : (
              <>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">취소 사유를 선택해주세요</h3>
                  <div className="space-y-2">
                    {CANCEL_REASONS.map((reason) => (
                      <button key={reason} onClick={() => setCancelReason(reason)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                          cancelReason === reason ? 'bg-red-50 border-red-300 border text-red-700 font-medium' : 'bg-gray-50 border border-gray-200 text-gray-700'
                        }`}>
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex border-t border-gray-200">
                  <button onClick={() => setCancelModal(null)}
                    className="flex-1 py-3.5 text-sm font-medium text-gray-600 border-r border-gray-200">돌아가기</button>
                  <button onClick={handleCancelConfirm}
                    disabled={!cancelReason}
                    className={`flex-1 py-3.5 text-sm font-medium ${cancelReason ? 'text-red-500' : 'text-gray-300'}`}>확인</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
