import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { getZoneLabel, CATEGORY_LABELS } from '../../types';
import { api } from '../../store';
import PhotoLightbox from '../../components/PhotoLightbox';

type ViewMode = 'side' | 'before' | 'after';

export default function ClientReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [activeZone, setActiveZone] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('side');
  const [confirmed, setConfirmed] = useState(false);
  const [lightbox, setLightbox] = useState<{ photos: { id: string; dataUrl: string; label?: string }[]; index: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    const req = api.getRequestById(id);
    if (req) {
      setRequest(req);
      const zones = [...new Set(req.photos.filter((p) => p.type === 'before').map((p) => p.zone))];
      if (zones.length > 0) setActiveZone(zones[0]);
    }
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다</p>
      </div>
    );
  }

  const isCompleted = request.status === 'completed';
  const beforePhotos = request.photos.filter((p) => p.type === 'before');
  const afterPhotos = request.afterPhotos || [];
  const zones = [...new Set(beforePhotos.map((p) => p.zone))];
  const currentBeforePhotos = beforePhotos.filter((p) => p.zone === activeZone);
  const currentAfterPhotos = afterPhotos.filter((p) => p.zone === activeZone);
  const price = request.price;
  const fee = Math.round(price * 0.15);
  const payout = price - fee;

  const openLightbox = (photoList: typeof beforePhotos, clickedIndex: number, labelPrefix: string) => {
    setLightbox({
      photos: photoList.map((p) => ({ id: p.id, dataUrl: p.dataUrl, label: `${labelPrefix} - ${getZoneLabel(p.zone)}` })),
      index: clickedIndex,
    });
  };

  const handleConfirm = () => {
    api.updateRequest(request.id, { status: 'completed' });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">확인 완료!</h2>
        <p className="text-sm text-gray-500 text-center mb-2">청소가 정상적으로 완료되었습니다.</p>
        <div className="bg-green-50 rounded-xl p-4 w-full mb-6 text-center">
          <p className="text-xs text-green-600 mb-1">청소자 정산 금액</p>
          <p className="text-2xl font-bold text-green-700">{payout.toLocaleString('ko-KR')}원</p>
          <p className="text-xs text-gray-400 mt-1">수수료 {fee.toLocaleString('ko-KR')}원 차감</p>
        </div>
        <p className="text-xs text-gray-400 mb-8">이용해주셔서 감사합니다.</p>
        <button onClick={() => navigate('/clean/client')} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors">홈으로</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 max-w-[480px] mx-auto ${isCompleted ? 'pb-8' : 'pb-24'}`}>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">{isCompleted ? '청소 결과' : '청소 결과 확인'}</h1>
      </header>

      {isCompleted ? (
        <div className="bg-green-50 border-b border-green-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
            <p className="text-sm text-green-700">확인 완료된 의뢰입니다.</p>
          </div>
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
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {isCompleted ? '완료' : '확인 대기'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-sm">
          <span className="text-gray-500">청소 종류</span>
          <span className="text-gray-800 font-medium">{CATEGORY_LABELS[request.category]}</span>
          <span className="text-gray-500">날짜</span>
          <span className="text-gray-800">{request.date} {request.time}</span>
          <span className="text-gray-500">청소자</span>
          <span className="text-gray-800 font-medium">{request.cleanerName || '-'}</span>
        </div>
      </section>

      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-1">Before / After 비교</h2>
        <p className="px-4 text-xs text-gray-400 mb-3">사진을 터치하면 크게 볼 수 있습니다</p>

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

      <section className="bg-white mt-2 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">결제 정보</h2>
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">의뢰 금액</span>
            <span className="text-sm font-medium text-gray-900">{price.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">수수료 (15%)</span>
            <span className="text-sm font-medium text-gray-400">-{fee.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">청소자 정산 금액</span>
            <span className="text-lg font-bold text-green-600">{payout.toLocaleString('ko-KR')}원</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {isCompleted ? '정산이 완료되었습니다' : '확인을 누르시면 정산이 진행됩니다'}
        </p>
      </section>

      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
          <button onClick={handleConfirm} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors">
            청소 결과 확인 완료
          </button>
        </div>
      )}

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
