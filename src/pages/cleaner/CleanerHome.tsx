import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';
import BottomNav from '../../components/BottomNav';
import CleanerSetup, { isSetupCompleted } from './CleanerSetup';

type SortMode = 'distance' | 'price';

function getDistance(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return Math.round(((hash % 50) / 10 + 0.3) * 10) / 10;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

const MY_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  matched: { label: '매칭완료', bg: 'bg-green-100', text: 'text-green-700' },
  in_progress: { label: '청소 진행중', bg: 'bg-blue-100', text: 'text-blue-700' },
  waiting_confirm: { label: '확인 대기', bg: 'bg-orange-100', text: 'text-orange-700' },
};

export default function CleanerHome() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortMode>('distance');
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [myRequests, setMyRequests] = useState<CleaningRequest[]>([]);

  const loadRequests = () => {
    const all = api.getRequests();
    setRequests(all.filter((r) => r.status === 'pending'));
    setMyRequests(all.filter((r) => ['matched', 'in_progress', 'waiting_confirm'].includes(r.status)));
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!isSetupCompleted()) {
    return <CleanerSetup />;
  }

  const sorted = [...requests].sort((a, b) => {
    if (sort === 'distance') return getDistance(a.id) - getDistance(b.id);
    return a.price - b.price;
  });

  const handleMyClick = (req: CleaningRequest) => {
    if (req.status === 'matched') navigate(`/clean/cleaner/prep/${req.id}`);
    else if (req.status === 'in_progress') navigate(`/clean/cleaner/progress/${req.id}`);
    else if (req.status === 'waiting_confirm') navigate(`/clean/cleaner/complete/${req.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">주변 의뢰</h1>
        <button onClick={() => navigate('/clean/cleaner/guide')} className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">가이드</button>
      </header>

      {/* 내 의뢰 */}
      {myRequests.length > 0 && (
        <section className="px-4 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">내 의뢰</h2>
          <div className="space-y-2 mb-4">
            {myRequests.map((req) => {
              const cfg = MY_STATUS_CONFIG[req.status] || { label: req.status, bg: 'bg-gray-100', text: 'text-gray-600' };
              return (
                <button key={req.id} onClick={() => handleMyClick(req)}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left shadow-sm active:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{CATEGORY_LABELS[req.category]} · {req.date}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{req.address}</p>
                  <p className="text-sm font-bold text-green-600 mt-1">{formatPrice(req.price)}원</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-gray-400 py-2" onClick={loadRequests}>아래로 당겨 새로고침</p>

      <div className="flex gap-2 px-4 pb-3">
        <button onClick={() => setSort('distance')}
          className={`flex-1 py-2 text-sm rounded-full font-medium transition-colors ${sort === 'distance' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>거리순</button>
        <button onClick={() => setSort('price')}
          className={`flex-1 py-2 text-sm rounded-full font-medium transition-colors ${sort === 'price' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>가격순</button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-gray-300 mb-4">
            <circle cx="12" cy="12" r="10" /><path d="M8 15h8" />
            <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
          </svg>
          <p className="text-gray-400 text-sm text-center">주변에 새로운 의뢰가 없습니다</p>
          <p className="text-gray-300 text-xs mt-1">잠시 후 다시 확인해주세요</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {sorted.map((req) => {
            const dist = getDistance(req.id);
            const photoCount = req.photos.length;
            return (
              <button key={req.id} onClick={() => navigate(`/clean/cleaner/request/${req.id}`)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left shadow-sm active:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{dist}km</span>
                  <span className="text-base font-bold text-gray-900">{formatPrice(req.price)}원</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span>{req.date}</span><span>{req.time}</span>
                  {photoCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
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
