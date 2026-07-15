import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { CATEGORY_LABELS, getZoneLabel } from '../../types';
import { api, MOCK_CLEANERS } from '../../store';
import PhotoLightbox from '../../components/PhotoLightbox';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [activeZone, setActiveZone] = useState<string>('');
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
  const zones = [...new Set(beforePhotos.map((p) => p.zone))];
  const zonePhotos = beforePhotos.filter((p) => p.zone === activeZone);
  const price = request.price;

  const openLightbox = (clickedIndex: number) => {
    setLightbox({
      photos: zonePhotos.map((p) => ({ id: p.id, dataUrl: p.dataUrl, label: getZoneLabel(p.zone) })),
      index: clickedIndex,
    });
  };

  const handleApply = () => {
    const profile = JSON.parse(localStorage.getItem('cleanmatch_cleaner_profile') || 'null');
    const cleaner = profile ? {
      id: 'self',
      name: profile.name || '청소자',
      rating: 4.8,
      photo: profile.photo || '',
    } : MOCK_CLEANERS[0];

    api.updateRequest(request.id, {
      status: 'matched',
      cleanerId: cleaner.id,
      cleanerName: cleaner.name,
      cleanerRating: cleaner.rating,
      cleanerPhoto: cleaner.photo,
    });
    navigate(`/clean/cleaner/prep/${request.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">의뢰 상세</h1>
      </header>

      {/* 카테고리 & 가격 요약 */}
      <section className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">{CATEGORY_LABELS[request.category]}</span>
          <span className="text-lg font-bold text-green-600">{price.toLocaleString('ko-KR')}원</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">날짜/시간</span>
            <span className="text-gray-900 font-medium">{request.date} {request.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">주소</span>
            <span className="text-gray-900 font-medium text-right max-w-[60%]">{request.address}</span>
          </div>
          {request.notes && (
            <div>
              <span className="text-gray-500 block mb-1">요청사항</span>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-xs">{request.notes}</p>
            </div>
          )}
        </div>
      </section>

      {/* 청소 구역 사진 */}
      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-1">청소 구역 사진</h2>
        <p className="px-4 text-xs text-gray-400 mb-1">사진을 터치하면 크게 볼 수 있습니다</p>
        <div className="px-4 flex items-center gap-1.5 mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[11px] text-gray-400">촬영된 사진은 의뢰인과 담당 청소자만 열람할 수 있습니다</span>
        </div>
        {zones.length > 0 ? (
          <>
            <div className="overflow-x-auto scrollbar-hide px-4">
              <div className="flex gap-1 min-w-max py-1">
                {zones.map((zone) => {
                  const count = beforePhotos.filter((p) => p.zone === zone).length;
                  const isActive = zone === activeZone;
                  return (
                    <button key={zone} onClick={() => setActiveZone(zone)}
                      className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${isActive ? 'bg-green-500 text-white font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                      {getZoneLabel(zone)}
                      {count > 0 && <span className={`ml-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 mt-3">
              {zonePhotos.map((photo, idx) => (
                <div key={photo.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm cursor-pointer active:opacity-80"
                  onClick={() => openLightbox(idx)}>
                  <div className="relative aspect-square">
                    <img src={photo.dataUrl} alt={`${getZoneLabel(photo.zone)} 사진`} className="w-full h-full object-cover" />
                  </div>
                  {photo.memo && <div className="p-2"><p className="text-xs text-gray-600">{photo.memo}</p></div>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="px-4 text-sm text-gray-400">등록된 사진이 없습니다</p>
        )}
      </section>

      {/* 지원하기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
        <button onClick={handleApply} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors">
          지원하기
        </button>
      </div>

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
