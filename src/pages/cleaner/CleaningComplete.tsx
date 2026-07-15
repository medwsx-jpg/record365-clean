import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { getZoneLabel } from '../../types';
import { api } from '../../store';
import PhotoLightbox from '../../components/PhotoLightbox';

type ViewMode = 'side' | 'before' | 'after';

export default function CleaningComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [activeZone, setActiveZone] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('side');
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

  const beforePhotos = request.photos.filter((p) => p.type === 'before');
  const afterPhotos = request.afterPhotos || [];
  const zones = [...new Set(beforePhotos.map((p) => p.zone))];

  const currentBeforePhotos = beforePhotos.filter((p) => p.zone === activeZone);
  const currentAfterPhotos = afterPhotos.filter((p) => p.zone === activeZone);

  const price = request.price;

  const openLightbox = (photoList: typeof beforePhotos, clickedIndex: number, labelPrefix: string) => {
    setLightbox({
      photos: photoList.map((p) => ({ id: p.id, dataUrl: p.dataUrl, label: `${labelPrefix} - ${getZoneLabel(p.zone)}` })),
      index: clickedIndex,
    });
  };

  const handleSubmit = () => {
    api.updateRequest(request.id, { status: 'waiting_confirm', completedAt: new Date().toISOString() });
    alert('완료 보고가 제출되었습니다.\n의뢰자의 확인을 기다려주세요.');
    navigate('/clean/cleaner');
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">청소 완료</h1>
      </header>

      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-1">Before / After 비교</h2>
        <p className="px-4 text-xs text-gray-400 mb-3">사진을 터치하면 크게 볼 수 있습니다</p>

        {zones.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide px-4">
            <div className="flex gap-1 min-w-max py-1">
              {zones.map((zone) => {
                const isActive = zone === activeZone;
                return (
                  <button key={zone} onClick={() => setActiveZone(zone)}
                    className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${isActive ? 'bg-green-500 text-white font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                    {getZoneLabel(zone)}
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
        <h2 className="text-sm font-semibold text-gray-900 mb-3">정산 정보</h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">의뢰 금액</span>
            <span className="text-lg font-bold text-green-600">{price.toLocaleString('ko-KR')}원</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">의뢰자 확인 후 정산이 진행됩니다</p>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
        <button onClick={handleSubmit} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors">
          완료 제출
        </button>
      </div>

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
