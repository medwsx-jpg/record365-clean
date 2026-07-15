import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest, Review } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';
import BottomNav from '../../components/BottomNav';

type FilterTab = 'all' | 'completed' | 'cancelled';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '대기중', color: 'text-gray-500 bg-gray-100' },
  matched: { label: '매칭완료', color: 'text-green-600 bg-green-50' },
  in_progress: { label: '진행중', color: 'text-blue-600 bg-blue-50' },
  waiting_confirm: { label: '확인대기', color: 'text-orange-600 bg-orange-50' },
  completed: { label: '완료', color: 'text-green-600 bg-green-50' },
  cancelled: { label: '취소', color: 'text-red-500 bg-red-50' },
  as_requested: { label: 'A/S요청', color: 'text-red-600 bg-red-50' },
};

export default function CleaningHistory() {
  const navigate = useNavigate();
  const role = api.getRole();
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const all = api.getRequests();
    // 최신순 정렬
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRequests(all);
  }, []);

  const filtered = requests.filter((r) => {
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const stats = {
    total: requests.length,
    completed: requests.filter((r) => r.status === 'completed').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
    totalSpent: requests.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.price, 0),
  };

  const reportRequest = reportId ? requests.find((r) => r.id === reportId) : null;
  const reportReview = reportId ? api.getReviewByRequestId(reportId) : undefined;

  if (reportRequest) {
    return <CleaningReport request={reportRequest} review={reportReview} onBack={() => setReportId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">의뢰 이력</h1>
      </header>

      {/* 통계 요약 */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            <p className="text-[11px] text-gray-400">전체</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{stats.completed}</p>
            <p className="text-[11px] text-gray-400">완료</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-500">{stats.cancelled}</p>
            <p className="text-[11px] text-gray-400">취소</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{(stats.totalSpent / 10000).toFixed(0)}<span className="text-sm font-normal">만원</span></p>
            <p className="text-[11px] text-gray-400">{role === 'client' ? '총 지출' : '총 수입'}</p>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 px-4 py-3">
        {([['all', '전체'], ['completed', '완료'], ['cancelled', '취소']] as [FilterTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
              filter === key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>{label}</button>
        ))}
      </div>

      {/* 의뢰 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 mb-3">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" />
          </svg>
          <p className="text-sm text-gray-400">해당 조건의 의뢰가 없습니다</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {filtered.map((req) => {
            const statusCfg = STATUS_LABELS[req.status] || { label: req.status, color: 'text-gray-500 bg-gray-100' };
            const hasReport = req.status === 'completed' && (req.afterPhotos?.length || 0) > 0;
            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[req.category]}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{req.price.toLocaleString('ko-KR')}원</span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{req.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{req.date} {req.time}</span>
                  <div className="flex gap-2">
                    {req.cleanerName && (
                      <span className="text-xs text-gray-400">청소자: {req.cleanerName}</span>
                    )}
                    {hasReport && (
                      <button onClick={() => setReportId(req.id)}
                        className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                        리포트 보기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// --- 청소 리포트 ---
function CleaningReport({ request, review, onBack }: {
  request: CleaningRequest;
  review?: Review;
  onBack: () => void;
}) {
  const beforePhotos = request.photos.filter((p) => p.type === 'before');
  const afterPhotos = request.afterPhotos || [];
  const zones = [...new Set(beforePhotos.map((p) => p.zone))];
  const checklist = request.checklist || [];
  const completedItems = checklist.filter((c) => c.completed).length;

  const zoneLabel = (z: string) => {
    const labels: Record<string, string> = { sink: '싱크대', bathroom: '화장실', living: '거실', kitchen: '주방', bedroom: '침실', other: '기타' };
    return labels[z] || z;
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-8">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">청소 리포트</h1>
      </header>

      {/* 의뢰 요약 */}
      <section className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[request.category]}</span>
          <span className="text-sm font-bold text-green-600">{request.price.toLocaleString('ko-KR')}원</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div><span className="text-gray-400">날짜:</span> {request.date} {request.time}</div>
          <div><span className="text-gray-400">청소자:</span> {request.cleanerName || '-'}</div>
          <div className="col-span-2"><span className="text-gray-400">주소:</span> {request.address}</div>
        </div>
      </section>

      {/* 체크리스트 결과 */}
      {checklist.length > 0 && (
        <section className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">체크리스트</h2>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {completedItems}/{checklist.length} 완료
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0}%` }} />
          </div>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                  item.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  {item.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${item.completed ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Before/After 비교 */}
      {zones.length > 0 && (
        <section className="bg-white mt-2 py-4">
          <h2 className="px-4 text-sm font-semibold text-gray-900 mb-3">Before / After</h2>
          {zones.map((zone) => {
            const before = beforePhotos.filter((p) => p.zone === zone);
            const after = afterPhotos.filter((p) => p.zone === zone);
            return (
              <div key={zone} className="px-4 mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">{zoneLabel(zone)}</p>
                <div className="space-y-2">
                  {before.map((bp, idx) => {
                    const ap = after[idx];
                    return (
                      <div key={bp.id} className="flex gap-2">
                        <div className="flex-1 relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={bp.dataUrl} alt="Before" className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Before</div>
                        </div>
                        <div className="flex-1 relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          {ap ? (
                            <>
                              <img src={ap.dataUrl} alt="After" className="w-full h-full object-cover" />
                              <div className="absolute top-1 left-1 bg-green-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">After</div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-400">사진 없음</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 리뷰 */}
      {review && (
        <section className="bg-white mt-2 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">리뷰</h2>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="16" height="16" viewBox="0 0 24 24"
                fill={s <= review.rating ? '#facc15' : 'none'}
                stroke={s <= review.rating ? '#facc15' : '#d1d5db'} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
            <span className="text-sm font-bold text-gray-700 ml-1">{review.rating.toFixed(1)}</span>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{review.comment}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</p>
        </section>
      )}
    </div>
  );
}
