import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest, ChecklistItem, Photo } from '../../types';
import { getZoneLabel, DEFAULT_CHECKLIST } from '../../types';
import { api } from '../../store';
import PhotoUploader from '../../components/PhotoUploader';

function generateId(): string {
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function CleaningProgress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([]);
  const [activeZone, setActiveZone] = useState<string>('sink');

  useEffect(() => {
    if (!id) return;
    const req = api.getRequestById(id);
    if (req) {
      setRequest(req);
      if (req.checklist && req.checklist.length > 0) {
        setChecklist(req.checklist);
      } else {
        const initial = DEFAULT_CHECKLIST.map((item) => ({
          ...item,
          id: generateId(),
        }));
        setChecklist(initial);
        api.updateRequest(req.id, { checklist: initial });
      }
      setAfterPhotos(req.afterPhotos || []);
      const zones = [...new Set(req.photos.filter((p) => p.type === 'before').map((p) => p.zone))];
      if (zones.length > 0) setActiveZone(zones[0]);
    }
  }, [id]);

  const completedCount = checklist.filter((c) => c.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  const handleChecklistToggle = useCallback(
    (itemId: string) => {
      setChecklist((prev) => {
        const updated = prev.map((c) =>
          c.id === itemId ? { ...c, completed: !c.completed } : c,
        );
        if (request) {
          api.updateRequest(request.id, { checklist: updated });
        }
        return updated;
      });
    },
    [request],
  );

  const handleAfterPhotosChange = useCallback(
    (photos: Photo[]) => {
      setAfterPhotos(photos);
      if (request) {
        api.updateRequest(request.id, { afterPhotos: photos });
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
  const allZones = zones.length > 0 ? zones : ['sink', 'bathroom', 'living', 'kitchen', 'bedroom', 'other'];

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">청소 진행 중</h1>
      </header>

      {/* Checklist Section */}
      <section className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">체크리스트</h2>
          <span className="text-xs font-medium text-green-600">
            {completedCount}/{totalCount} ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => handleChecklistToggle(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 text-left active:bg-gray-50 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {item.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-400 block">
                  {getZoneLabel(item.zone)}
                </span>
                <span
                  className={`text-sm ${
                    item.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                  }`}
                >
                  {item.task}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Before/After Photo Comparison Section */}
      <section className="bg-white mt-2 py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-900 mb-1">
          Before/After 사진 비교
        </h2>
        <p className="px-4 text-xs text-blue-500 mb-3">
          Before와 같은 위치, 같은 구도로 촬영하세요
        </p>

        {/* Zone Tabs */}
        <div className="overflow-x-auto scrollbar-hide px-4">
          <div className="flex gap-1 min-w-max py-1">
            {allZones.map((zone) => {
              const beforeCount = beforePhotos.filter((p) => p.zone === zone).length;
              const afterCount = afterPhotos.filter((p) => p.zone === zone && p.type === 'after').length;
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
                  {(beforeCount > 0 || afterCount > 0) && (
                    <span className={`ml-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                      ({afterCount}/{beforeCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Before photos (view-only) + After upload area */}
        <div className="mt-3 px-4">
          {beforePhotos.filter((p) => p.zone === activeZone).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Before</p>
              <div className="grid grid-cols-2 gap-2">
                {beforePhotos
                  .filter((p) => p.zone === activeZone)
                  .map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={photo.dataUrl}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Before
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* After Photo Uploader */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">After</p>
            <PhotoUploader
              photos={afterPhotos}
              onPhotosChange={handleAfterPhotosChange}
              zones={[activeZone]}
              mode="after"
              guidePhotos={beforePhotos}
            />
          </div>
        </div>
      </section>

      {/* Complete Button */}
      {isComplete && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
          <button
            onClick={() => navigate(`/clean/cleaner/complete/${request.id}`)}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors"
          >
            청소 완료
          </button>
        </div>
      )}
    </div>
  );
}
