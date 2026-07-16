import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest, Photo } from '../../types';
import { getZoneLabel } from '../../types';
import { api } from '../../store';
import PhotoUploader from '../../components/PhotoUploader';
import PhotoLightbox from '../../components/PhotoLightbox';

export default function CleaningProgress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([]);
  const [activeZone, setActiveZone] = useState<string>('');
  const [lightbox, setLightbox] = useState<{ photos: { id: string; dataUrl: string; label?: string }[]; index: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const req = await api.getRequestById(id);
      if (req) {
        setRequest(req);
        setAfterPhotos(req.afterPhotos || []);
        const zones = [...new Set(req.photos.filter((p) => p.type === 'before').map((p) => p.zone))];
        if (zones.length > 0) setActiveZone(zones[0]);
      }
    })();
  }, [id]);

  const handleAfterPhotosChange = useCallback(
    async (photos: Photo[]) => {
      setAfterPhotos(photos);
      if (request) {
        await api.updateRequest(request.id, { afterPhotos: photos });
      }
    },
    [request],
  );

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다</p>
      </div>
    );
  }

  const beforePhotos = request.photos.filter((p) => p.type === 'before');
  const zones = [...new Set(beforePhotos.map((p) => p.zone))];

  const allZonesHaveAfter = zones.length > 0 && zones.every(
    (zone) => afterPhotos.filter((p) => p.zone === zone && p.type === 'after').length > 0
  );

  const openLightbox = (photoList: typeof beforePhotos, clickedIndex: number, labelPrefix: string) => {
    setLightbox({
      photos: photoList.map((p) => ({ id: p.id, dataUrl: p.dataUrl, label: `${labelPrefix} - ${getZoneLabel(p.zone)}` })),
      index: clickedIndex,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">청소 진행 중</h1>
      </header>

      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
        <p className="text-sm text-blue-700 font-medium">의뢰자가 촬영한 구역과 같은 위치에서 촬영해 주세요.</p>
        <p className="text-xs text-blue-500 mt-1">모든 구역의 After 사진을 등록해야 완료할 수 있습니다.</p>
      </div>

      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-3">Before / After 사진</h2>

        <div className="overflow-x-auto scrollbar-hide px-4">
          <div className="flex gap-1 min-w-max py-1">
            {zones.map((zone) => {
              const beforeCount = beforePhotos.filter((p) => p.zone === zone).length;
              const afterCount = afterPhotos.filter((p) => p.zone === zone && p.type === 'after').length;
              const isActive = zone === activeZone;
              const hasAfter = afterCount > 0;
              return (
                <button key={zone} onClick={() => setActiveZone(zone)}
                  className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                    isActive ? 'bg-green-500 text-white font-semibold' : hasAfter ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {getZoneLabel(zone)}
                  <span className={`ml-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                    {hasAfter ? '✓' : `${afterCount}/${beforeCount}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 px-4">
          {beforePhotos.filter((p) => p.zone === activeZone).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Before (터치하면 크게 볼 수 있습니다)</p>
              <div className="grid grid-cols-2 gap-2">
                {beforePhotos.filter((p) => p.zone === activeZone).map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer active:opacity-80"
                    onClick={() => openLightbox(beforePhotos.filter((p) => p.zone === activeZone), idx, 'Before')}>
                    <img src={photo.dataUrl} alt="Before" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Before</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">After</p>
            <PhotoUploader photos={afterPhotos} onPhotosChange={handleAfterPhotosChange} zones={[activeZone]} mode="after" guidePhotos={beforePhotos} />
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
        {!allZonesHaveAfter && (
          <p className="text-xs text-amber-600 text-center mb-2">모든 구역의 After 사진을 등록해주세요</p>
        )}
        <button onClick={() => navigate(`/clean/cleaner/complete/${request.id}`)} disabled={!allZonesHaveAfter}
          className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
          청소 완료
        </button>
      </div>

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
