import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest, Review } from '../../types';
import { getZoneLabel, CATEGORY_LABELS, AS_REASONS } from '../../types';
import { api } from '../../store';
import PhotoLightbox from '../../components/PhotoLightbox';

type ViewMode = 'side' | 'before' | 'after';

export default function ClientReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [activeZone, setActiveZone] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('side');
  const [lightbox, setLightbox] = useState<{ photos: { id: string; dataUrl: string; label?: string }[]; index: number } | null>(null);
  const [asModal, setAsModal] = useState(false);
  const [asReason, setAsReason] = useState('');
  const [asComment, setAsComment] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const req = await api.getRequestById(id);
      if (req) {
        setRequest(req);
        const zones = [...new Set(req.photos.filter((p) => p.type === 'before').map((p) => p.zone))];
        if (zones.length > 0) setActiveZone(zones[0]);
        if (req.reviewId) {
          const review = await api.getReviewById(req.reviewId);
          if (review) setExistingReview(review);
        }
      }
    })();
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다</p>
      </div>
    );
  }

  const isCompleted = request.status === 'completed';
  const isAsRequested = request.status === 'as_requested';
  const hasReview = !!request.reviewId;
  const beforePhotos = request.photos.filter((p) => p.type === 'before');
  const afterPhotos = request.afterPhotos || [];
  const zones = [...new Set(beforePhotos.map((p) => p.zone))];
  const currentBeforePhotos = beforePhotos.filter((p) => p.zone === activeZone);
  const currentAfterPhotos = afterPhotos.filter((p) => p.zone === activeZone);

  const openLightbox = (photoList: typeof beforePhotos, clickedIndex: number, labelPrefix: string) => {
    setLightbox({
      photos: photoList.map((p) => ({ id: p.id, dataUrl: p.dataUrl, label: `${labelPrefix} - ${getZoneLabel(p.zone)}` })),
      index: clickedIndex,
    });
  };

  const handleConfirm = async () => {
    await api.updateRequest(request.id, { status: 'completed' });
    navigate(`/clean/client/review/${request.id}/write`, { replace: true });
  };

  const handleAsRequest = async () => {
    if (!asReason && !asComment.trim()) return;
    const commentText = asComment.trim()
      ? `[${asReason}] ${asComment.trim()}`
      : asReason;
    await api.updateRequest(request.id, {
      status: 'as_requested',
      asComment: commentText,
      asRequestedAt: new Date().toISOString(),
    });
    setAsModal(false);
    setRequest(await api.getRequestById(request.id) || null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} width="14" height="14" viewBox="0 0 24 24"
            fill={star <= rating ? '#facc15' : 'none'}
            stroke={star <= rating ? '#facc15' : '#d1d5db'}
            strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
    );
  };

  const showBottomButtons = request.status === 'waiting_confirm';

  return (
    <div className={`min-h-screen bg-gray-50 max-w-[480px] mx-auto ${showBottomButtons ? 'pb-28' : 'pb-8'}`}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {isCompleted ? '청소 결과' : isAsRequested ? 'A/S 요청됨' : '청소 결과 확인'}
        </h1>
      </header>

      {isCompleted ? (
        <div className="bg-green-50 border-b border-green-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            <p className="text-sm text-green-700">확인 완료된 의뢰입니다.</p>
          </div>
        </div>
      ) : isAsRequested ? (
        <div className="bg-red-50 border-b border-red-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-700">A/S 재방문이 요청되었습니다.</p>
          </div>
          {request.asComment && (
            <p className="text-xs text-red-600 mt-2 bg-red-100/50 rounded-lg p-2">{request.asComment}</p>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-blue-700">청소자가 작업을 완료했습니다. 결과를 확인해주세요.</p>
          </div>
        </div>
      )}

      <section className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">의뢰 정보</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isCompleted ? 'bg-green-100 text-green-700' :
            isAsRequested ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {isCompleted ? '완료' : isAsRequested ? 'A/S 요청' : '확인 대기'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-sm">
          <span className="text-gray-500">청소 종류</span>
          <span className="text-gray-800 font-medium">{CATEGORY_LABELS[request.category]}</span>
          <span className="text-gray-500">날짜</span>
          <span className="text-gray-800">{request.date} {request.time}</span>
          <span className="text-gray-500">청소자</span>
          <span className="text-gray-800 font-medium">{request.cleanerName || '-'}</span>
          <span className="text-gray-500">결제 금액</span>
          <span className="text-gray-800 font-bold">{request.price.toLocaleString('ko-KR')}원</span>
        </div>
      </section>

      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-1">Before / After 비교</h2>
        <p className="px-4 text-xs text-gray-400 mb-1">사진을 터치하면 크게 볼 수 있습니다</p>
        <div className="px-4 flex items-center gap-1.5 mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[11px] text-gray-400">촬영된 사진은 의뢰인과 담당 청소자만 열람할 수 있습니다</span>
        </div>

        {zones.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide px-4">
            <div className="flex gap-1 min-w-max py-1">
              {zones.map((zone) => {
                const isActive = zone === activeZone;
                const bCount = beforePhotos.filter((p) => p.zone === zone).length;
                const aCount = afterPhotos.filter((p) => p.zone === zone).length;
                return (
                  <button key={zone} onClick={() => setActiveZone(zone)}
                    className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${isActive ? 'bg-green-500 text-white font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                    {getZoneLabel(zone)}
                    <span className={`ml-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>({aCount}/{bCount})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-1 px-4 mt-3 mb-3">
          {(['side', 'before', 'after'] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`flex-1 py-1.5 text-xs rounded-full font-medium transition-colors ${viewMode === mode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {mode === 'side' ? '나란히 보기' : mode === 'before' ? 'Before' : 'After'}
            </button>
          ))}
        </div>

        <div className="px-4">
          {viewMode === 'side' ? (
            <div className="space-y-3">
              {currentBeforePhotos.map((beforePhoto, idx) => {
                const afterPhoto = currentAfterPhotos[idx];
                return (
                  <div key={beforePhoto.id} className="flex gap-2">
                    <div className="flex-1 relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer active:opacity-80"
                      onClick={() => openLightbox(currentBeforePhotos, idx, 'Before')}>
                      <img src={beforePhoto.dataUrl} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Before</div>
                    </div>
                    <div className="flex-1 relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      {afterPhoto ? (
                        <div className="w-full h-full cursor-pointer active:opacity-80"
                          onClick={() => openLightbox(currentAfterPhotos, idx, 'After')}>
                          <img src={afterPhoto.dataUrl} alt="After" className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-green-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">After</div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-400">사진 없음</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {currentBeforePhotos.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">이 구역의 사진이 없습니다</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(viewMode === 'before' ? currentBeforePhotos : currentAfterPhotos).map((photo, idx) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer active:opacity-80"
                  onClick={() => openLightbox(viewMode === 'before' ? currentBeforePhotos : currentAfterPhotos, idx, viewMode === 'before' ? 'Before' : 'After')}>
                  <img src={photo.dataUrl} alt={viewMode} className="w-full h-full object-cover" />
                  <div className={`absolute top-1 left-1 text-white text-[10px] px-1.5 py-0.5 rounded ${viewMode === 'before' ? 'bg-black/50' : 'bg-green-500/80'}`}>
                    {viewMode === 'before' ? 'Before' : 'After'}
                  </div>
                </div>
              ))}
              {(viewMode === 'before' ? currentBeforePhotos : currentAfterPhotos).length === 0 && (
                <p className="col-span-2 text-sm text-gray-400 text-center py-8">사진이 없습니다</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 리뷰 표시 (완료 + 리뷰 작성된 경우) */}
      {isCompleted && existingReview && (
        <section className="bg-white mt-2 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">내 리뷰</h2>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {renderStars(existingReview.rating)}
              <span className="text-sm font-bold text-gray-700">{existingReview.rating}.0</span>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-gray-700">{existingReview.comment}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">{new Date(existingReview.createdAt).toLocaleDateString('ko-KR')}</p>
          </div>
        </section>
      )}

      {/* 리뷰 작성 버튼 (완료 + 리뷰 없는 경우) */}
      {isCompleted && !hasReview && (
        <div className="px-4 mt-4">
          <button onClick={() => navigate(`/clean/client/review/${request.id}/write`)}
            className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm active:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
            <span>⭐</span> 리뷰 작성하기
          </button>
        </div>
      )}

      {/* 재예약 + 정기 청소 (완료 상태) */}
      {isCompleted && (
        <section className="bg-white mt-2 p-4 space-y-2">
          <button onClick={() => navigate('/clean/client/create', { state: { rebookFrom: request } })}
            className="w-full py-3 bg-white border-2 border-green-400 text-green-600 font-semibold rounded-xl text-sm active:bg-green-50 transition-colors flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            같은 청소자로 다시 예약
          </button>
          {existingReview && existingReview.rating >= 4 && (
            <button onClick={() => navigate('/clean/client/recurring')}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-xl text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              정기 청소 신청하기
            </button>
          )}
        </section>
      )}

      {/* 하단 버튼: 확인 대기 상태에서만 */}
      {showBottomButtons && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
          <div className="flex gap-3">
            <button onClick={() => { setAsModal(true); setAsReason(''); setAsComment(''); }}
              className="flex-1 py-4 bg-red-50 text-red-500 font-bold rounded-xl text-sm border border-red-200 active:bg-red-100 transition-colors">
              불만족 / A/S 요청
            </button>
            <button onClick={handleConfirm}
              className="flex-[2] py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors">
              만족 / 확인 완료
            </button>
          </div>
        </div>
      )}

      {/* A/S 요청 모달 */}
      {asModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">A/S 재방문 요청</h3>
              <p className="text-xs text-gray-500 text-center mb-4">불만족 사유를 선택하고 상세 내용을 작성해주세요</p>

              <div className="space-y-2 mb-4">
                {AS_REASONS.map((reason) => (
                  <button key={reason} onClick={() => setAsReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                      asReason === reason ? 'bg-red-50 border-red-300 border text-red-700 font-medium' : 'bg-gray-50 border border-gray-200 text-gray-700'
                    }`}>
                    {reason}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">상세 코멘트</label>
                <textarea
                  value={asComment}
                  onChange={(e) => setAsComment(e.target.value)}
                  placeholder="불만족 사항을 구체적으로 작성해주세요 (선택)"
                  maxLength={300}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none h-24"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{asComment.length}/300</p>
              </div>
            </div>
            <div className="flex border-t border-gray-200">
              <button onClick={() => setAsModal(false)}
                className="flex-1 py-3.5 text-sm font-medium text-gray-600 border-r border-gray-200">취소</button>
              <button onClick={handleAsRequest}
                disabled={!asReason}
                className={`flex-1 py-3.5 text-sm font-medium ${asReason ? 'text-red-500' : 'text-gray-300'}`}>A/S 요청하기</button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
