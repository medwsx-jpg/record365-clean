import React, { useRef, useState } from 'react';
import type { Photo } from '../types';
import { getZoneLabel } from '../types';

interface PhotoUploaderProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  zones: string[];
  mode: 'before' | 'after';
  guidePhotos?: Photo[];
}

function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoUploader({
  photos,
  onPhotosChange,
  zones,
  mode,
  guidePhotos,
}: PhotoUploaderProps) {
  const [activeZone, setActiveZone] = useState<string>(zones[0] || 'sink');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zonePhotos = photos.filter((p) => p.zone === activeZone && p.type === mode);
  const zoneGuidePhotos = guidePhotos?.filter((p) => p.zone === activeZone) || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const dataUrl = await fileToBase64(files[i]);
      newPhotos.push({
        id: generateId(),
        zone: activeZone,
        dataUrl,
        memo: '',
        type: mode,
        createdAt: new Date().toISOString(),
      });
    }
    onPhotosChange([...photos, ...newPhotos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (photoId: string) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId));
  };

  const handleMemoChange = (photoId: string, memo: string) => {
    onPhotosChange(
      photos.map((p) => (p.id === photoId ? { ...p, memo } : p))
    );
  };

  return (
    <div className="w-full">
      {/* Zone Tab Bar */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max px-1 py-2">
          {zones.map((zone) => {
            const count = photos.filter((p) => p.zone === zone && p.type === mode).length;
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

      {/* Guide Photo Reference (After mode) */}
      {mode === 'after' && zoneGuidePhotos.length > 0 && (
        <div className="mx-2 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-2">
            Before와 같은 구도로 촬영하세요
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {zoneGuidePhotos.map((gp) => (
              <div key={gp.id} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden opacity-60">
                <img
                  src={gp.dataUrl}
                  alt="참고 사진"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <span className="text-[8px] text-blue-700 bg-white/80 px-1 rounded">Before</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-3 px-2">
        {zonePhotos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="relative aspect-square">
              <img
                src={photo.dataUrl}
                alt={`${getZoneLabel(photo.zone)} 사진`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              <input
                type="text"
                value={photo.memo}
                onChange={(e) => handleMemoChange(photo.id, e.target.value)}
                placeholder="메모 입력..."
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-400 placeholder-gray-300"
              />
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-xs mt-1.5 font-medium">사진 추가</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
