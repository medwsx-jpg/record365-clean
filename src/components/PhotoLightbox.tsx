import { useState, useEffect, useCallback, useRef } from 'react';

interface PhotoLightboxProps {
  photos: { id: string; dataUrl: string; label?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export default function PhotoLightbox({ photos, initialIndex = 0, onClose }: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const lastTapRef = useRef(0);
  const pinchStartRef = useRef<number | null>(null);
  const pinchScaleRef = useRef(1);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const translateStartRef = useRef({ x: 0, y: 0 });

  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handlePrev = useCallback(() => {
    resetZoom();
    setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    resetZoom();
    setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, handlePrev, handleNext]);

  // 더블탭 줌
  const handleDoubleTap = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      setTranslate({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 핀치 시작
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartRef.current = dist;
      pinchScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      setTouchStart(e.touches[0].clientX);
      // 더블탭 감지
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleTap();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // 확대 상태에서 팬 이동
      if (scale > 1) {
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        translateStartRef.current = { ...translate };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current !== null) {
      // 핀치 줌
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(5, Math.max(1, pinchScaleRef.current * (dist / pinchStartRef.current)));
      setScale(newScale);
      if (newScale <= 1) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && scale > 1 && panStartRef.current) {
      // 확대 상태에서 팬
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setTranslate({
        x: translateStartRef.current.x + dx,
        y: translateStartRef.current.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchStartRef.current !== null && e.touches.length < 2) {
      pinchStartRef.current = null;
      if (scale <= 1) resetZoom();
      return;
    }

    // 스와이프 (확대 안 된 상태에서만)
    if (touchStart !== null && scale <= 1) {
      const diff = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(diff) > 50) {
        if (diff > 0) handlePrev();
        else handleNext();
      }
    }
    setTouchStart(null);
    panStartRef.current = null;
  };

  // 마우스 더블클릭 줌 (PC)
  const handleDoubleClick = () => {
    handleDoubleTap();
  };

  // 마우스 휠 줌 (PC)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.min(5, Math.max(1, scale - e.deltaY * 0.003));
    setScale(newScale);
    if (newScale <= 1) setTranslate({ x: 0, y: 0 });
  };

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col" onClick={() => { if (scale <= 1) onClose(); }}>
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {photo.label && <span className="text-gray-300 mr-2">{photo.label}</span>}
            {index + 1} / {photos.length}
          </span>
          {scale > 1 && <span className="text-xs text-gray-400">{Math.round(scale * 100)}%</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 사진 */}
      <div
        className="flex-1 flex items-center justify-center px-4 overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      >
        <img
          src={photo.dataUrl}
          alt={photo.label || '사진'}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-100"
          style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)` }}
          draggable={false}
        />
      </div>

      {/* 줌 안내 (첫 진입시) */}
      {scale <= 1 && (
        <p className="text-center text-[11px] text-gray-500 py-1">더블탭으로 확대 · 핀치로 줌</p>
      )}

      {/* 좌우 네비게이션 */}
      {photos.length > 1 && scale <= 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      <div className="h-4 shrink-0" />
    </div>
  );
}
