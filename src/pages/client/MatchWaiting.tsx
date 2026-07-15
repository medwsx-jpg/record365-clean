import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { api } from '../../store';

export default function MatchWaiting() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CleaningRequest | undefined>();

  useEffect(() => {
    if (!id) return;
    setRequest(api.getRequestById(id));
  }, [id]);

  // Poll for any status change from pending
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      const updated = api.getRequestById(id);
      if (updated) {
        setRequest(updated);
        // pending이 아닌 다른 상태로 변하면 홈으로 이동
        if (updated.status !== 'pending') {
          clearInterval(interval);
          navigate('/clean/client', { replace: true });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  const handleCancel = () => {
    if (!id) return;
    api.deleteRequest(id);
    navigate('/clean/client', { replace: true });
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-[480px] mx-auto">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex flex-col items-center justify-center px-6">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-green-500 animate-spin" />
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">청소자 대기 중...</h2>
      <p className="text-sm text-gray-500 text-center mb-8">청소자가 의뢰를 수락하면 알려드릴게요.</p>

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
          <span className="text-green-600 font-bold">{request.price.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      <button onClick={handleCancel} className="w-full border border-red-300 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors">
        의뢰 취소
      </button>
    </div>
  );
}
