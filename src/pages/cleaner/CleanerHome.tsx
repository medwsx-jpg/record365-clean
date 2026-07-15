import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { api } from '../../store';
import BottomNav from '../../components/BottomNav';

type SortMode = 'distance' | 'price';

function getDistance(id: string): number {
  // Generate a stable pseudo-random distance from the request id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return Math.round(((hash % 50) / 10 + 0.3) * 10) / 10; // 0.3 ~ 5.3 km
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function CleanerHome() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortMode>('distance');
  const [requests, setRequests] = useState<CleaningRequest[]>([]);

  const loadRequests = () => {
    const all = api.getRequests().filter(
      (r) => r.status === 'matching' || r.status === 'pending',
    );
    setRequests(all);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const sorted = [...requests].sort((a, b) => {
    if (sort === 'distance') return getDistance(a.id) - getDistance(b.id);
    return a.price - b.price;
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">주변 의뢰</h1>
      </header>

      {/* 프로필 미등록 알림 */}
      {!localStorage.getItem('cleanmatch_cleaner_profile') && (
        <button
          onClick={() => navigate('/clean/cleaner/profile')}
          className="mx-4 mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3 text-left w-[calc(100%-2rem)]"
        >
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-orange-700">프로필을 등록해주세요</p>
            <p className="text-xs text-orange-500">의뢰를 수락하려면 프로필 등록이 필요합니다</p>
          </div>
        </button>
      )}

      {/* Pull-to-refresh hint */}
      <p className="text-center text-xs text-gray-400 py-2" onClick={loadRequests}>
        아래로 당겨 새로고침
      </p>

      {/* Sort buttons */}
      <div className="flex gap-2 px-4 pb-3">
        <button
          onClick={() => setSort('distance')}
          className={`flex-1 py-2 text-sm rounded-full font-medium transition-colors ${
            sort === 'distance'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          거리순
        </button>
        <button
          onClick={() => setSort('price')}
          className={`flex-1 py-2 text-sm rounded-full font-medium transition-colors ${
            sort === 'price'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          가격순
        </button>
      </div>

      {/* Request list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            className="text-gray-300 mb-4"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15h8" />
            <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
          </svg>
          <p className="text-gray-400 text-sm text-center">
            주변에 새로운 의뢰가 없습니다
          </p>
          <p className="text-gray-300 text-xs mt-1">
            잠시 후 다시 확인해주세요
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {sorted.map((req) => {
            const dist = getDistance(req.id);
            const photoCount = req.photos.length;
            return (
              <button
                key={req.id}
                onClick={() => navigate(`/clean/cleaner/request/${req.id}`)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left shadow-sm active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                    {dist}km
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(req.price)}원
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span>{req.date}</span>
                  <span>{req.time}</span>
                  {photoCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      {photoCount}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 truncate">{req.address}</p>
              </button>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
