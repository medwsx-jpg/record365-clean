import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { getZoneLabel } from '../../types';
import { api, MOCK_CLEANERS } from '../../store';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [activeZone, setActiveZone] = useState<string>('sink');

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

  const handleAccept = () => {
    const cleaner = MOCK_CLEANERS[0];
    api.updateRequest(request.id, {
      status: 'in_progress',
      cleanerId: cleaner.id,
      cleanerName: cleaner.name,
      cleanerRating: cleaner.rating,
      cleanerPhoto: cleaner.photo,
    });
    navigate(`/clean/cleaner/progress/${request.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">의뢰 상세</h1>
      </header>

      {/* Before Photos Section */}
      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-3">Before 사진</h2>

        {zones.length > 0 ? (
          <>
            {/* Zone Tabs */}
            <div className="overflow-x-auto scrollbar-hide px-4">
              <div className="flex gap-1 min-w-max py-1">
                {zones.map((zone) => {
                  const count = beforePhotos.filter((p) => p.zone === zone).length;
                  const isActive = zone === activeZone;
                  return (
                    <button
                      key={zone}
                      onClick={() => setActiveZone(zone)}
                      className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-green-500 text-white font-semibold'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getZoneLabel(zone)}
                      {count > 0 && (
                        <span className={`ml-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                          ({count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-3">
              {zonePhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="relative aspect-square">
                    <img
                      src={photo.dataUrl}
                      alt={`${getZoneLabel(photo.zone)} 사진`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {photo.memo && (
                    <div className="p-2">
                      <p className="text-xs text-gray-600">{photo.memo}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="px-4 text-sm text-gray-400">등록된 사진이 없습니다</p>
        )}
      </section>

      {/* Request Info Section */}
      <section className="bg-white mt-2 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">요청 정보</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">날짜/시간</span>
            <span className="text-sm font-medium text-gray-900">
              {request.date} {request.time}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">주소</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
              {request.address}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">가격</span>
            <span className="text-sm font-bold text-green-600">
              {request.price.toLocaleString('ko-KR')}원
            </span>
          </div>
          {request.notes && (
            <div>
              <span className="text-sm text-gray-500 block mb-1">추가 요청사항</span>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {request.notes}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Accept Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
        <button
          onClick={handleAccept}
          className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors"
        >
          수락하기
        </button>
      </div>
    </div>
  );
}
