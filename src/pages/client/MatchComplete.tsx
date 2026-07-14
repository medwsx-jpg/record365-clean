import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { api } from '../../store';

export default function MatchComplete() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CleaningRequest | undefined>();

  useEffect(() => {
    if (!id) return;
    const req = api.getRequestById(id);
    setRequest(req);
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-[480px] mx-auto">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Extract cleaner initials for avatar fallback
  const initials = request.cleanerName
    ? request.cleanerName.slice(0, 1)
    : '?';

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex flex-col items-center px-6 pt-16 pb-8">
      {/* Success animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
        <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-green-300 rounded-full" />
        <div className="absolute top-0 -left-3 w-2 h-2 bg-yellow-400 rounded-full" />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-1">매칭 완료!</h2>
      <p className="text-sm text-gray-500 mb-8">
        청소자가 배정되었습니다.
      </p>

      {/* Cleaner info card */}
      <div className="w-full bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          {request.cleanerPhoto ? (
            <img
              src={request.cleanerPhoto}
              alt={request.cleanerName}
              className="w-14 h-14 rounded-full bg-gray-100 object-cover border-2 border-green-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold border-2 border-green-200">
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-gray-800">
              {request.cleanerName || '청소자'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={
                      star <= Math.round(request.cleanerRating ?? 0)
                        ? '#facc15'
                        : 'none'
                    }
                    stroke="#facc15"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {request.cleanerRating?.toFixed(1) ?? '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Cleaner stats -- we show completedJobs from mock data if available */}
        <div className="bg-gray-50 rounded-lg p-3 flex justify-around text-center">
          <div>
            <p className="text-lg font-bold text-gray-800">
              {request.cleanerRating?.toFixed(1) ?? '-'}
            </p>
            <p className="text-[10px] text-gray-500">평점</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-lg font-bold text-gray-800">
              {(() => {
                const cleaners = api.getMockCleaners();
                const c = cleaners.find((cl) => cl.id === request.cleanerId);
                return c ? c.completedJobs : '-';
              })()}
            </p>
            <p className="text-[10px] text-gray-500">완료 건수</p>
          </div>
        </div>
      </div>

      {/* Request summary */}
      <div className="w-full bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">의뢰 정보</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">날짜</span>
          <span className="text-gray-800">{request.date}</span>
          <span className="text-gray-500">시간</span>
          <span className="text-gray-800">{request.time}</span>
          <span className="text-gray-500">주소</span>
          <span className="text-gray-800 truncate">{request.address}</span>
          <span className="text-gray-500">희망 가격</span>
          <span className="text-green-600 font-bold">
            {request.price.toLocaleString('ko-KR')}원
          </span>
        </div>
      </div>

      {/* Home button */}
      <button
        onClick={() => navigate('/clean/client')}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors"
      >
        홈으로
      </button>
    </div>
  );
}
