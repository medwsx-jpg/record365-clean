import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';

const SUPPLY_CHECKLIST = [
  { id: 'gloves', label: '고무장갑', icon: '🧤' },
  { id: 'cloth', label: '걸레 / 극세사 타월', icon: '🧹' },
  { id: 'detergent', label: '다용도 세정제', icon: '🧴' },
  { id: 'trash_bag', label: '쓰레기봉투', icon: '🗑️' },
  { id: 'brush', label: '솔 / 브러시', icon: '🪥' },
  { id: 'mop', label: '밀대 / 청소기', icon: '🧹' },
  { id: 'sponge', label: '수세미 / 스펀지', icon: '🧽' },
  { id: 'mask', label: '마스크 / 앞치마', icon: '😷' },
];

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CleanerPrep() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const req = api.getRequestById(id);
    if (req) setRequest(req);
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다</p>
      </div>
    );
  }

  const daysLeft = getDaysUntil(request.date);
  const allChecked = checked.size === SUPPLY_CHECKLIST.length;

  const toggleCheck = (itemId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleStartCleaning = () => {
    api.updateRequest(request.id, { status: 'in_progress' });
    navigate(`/clean/cleaner/progress/${request.id}`);
  };

  const handleCancel = () => {
    api.updateRequest(request.id, {
      status: 'pending',
      cleanerId: undefined,
      cleanerName: undefined,
      cleanerRating: undefined,
      cleanerPhoto: undefined,
    });
    setShowCancelConfirm(false);
    navigate('/clean/cleaner', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-32">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/clean/cleaner')} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">청소 준비</h1>
      </header>

      {/* 의뢰 요약 */}
      <section className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[request.category]}</span>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">매칭완료</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">날짜</span>
          <span className="text-gray-900 font-medium">{request.date}</span>
          <span className="text-gray-500">시간</span>
          <span className="text-gray-900 font-medium">{request.time}</span>
          <span className="text-gray-500">주소</span>
          <span className="text-gray-900 font-medium text-right">{request.address}</span>
          <span className="text-gray-500">금액</span>
          <span className="text-green-600 font-bold">{request.price.toLocaleString('ko-KR')}원</span>
        </div>
      </section>

      {/* 남은 일수 */}
      <section className="bg-white mt-2 p-4">
        <div className={`rounded-xl p-4 text-center ${daysLeft <= 0 ? 'bg-green-50 border border-green-200' : daysLeft <= 1 ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
          {daysLeft <= 0 ? (
            <>
              <p className="text-2xl font-bold text-green-700">오늘</p>
              <p className="text-sm text-green-600 mt-1">청소 예정일입니다. 현장에 도착하면 아래 버튼을 눌러주세요.</p>
            </>
          ) : daysLeft === 1 ? (
            <>
              <p className="text-2xl font-bold text-amber-700">내일</p>
              <p className="text-sm text-amber-600 mt-1">청소 예정일까지 1일 남았습니다.</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-blue-700">D-{daysLeft}</p>
              <p className="text-sm text-blue-600 mt-1">청소 예정일까지 {daysLeft}일 남았습니다.</p>
            </>
          )}
        </div>
      </section>

      {/* 물품 체크리스트 */}
      <section className="bg-white mt-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">준비물 체크리스트</h2>
          <span className="text-xs text-green-600 font-medium">{checked.size}/{SUPPLY_CHECKLIST.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(checked.size / SUPPLY_CHECKLIST.length) * 100}%` }} />
        </div>
        <div className="space-y-2">
          {SUPPLY_CHECKLIST.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <button key={item.id} onClick={() => toggleCheck(item.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 text-left active:bg-gray-50 transition-colors">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {isChecked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </div>
                <span className="text-lg">{item.icon}</span>
                <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 취소 패널티 안내 */}
      <section className="bg-white mt-2 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">지원 취소 안내</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <div className="space-y-1">
              <p className="text-xs text-red-700 font-medium">청소일 3일 전까지: 패널티 없음</p>
              <p className="text-xs text-red-700 font-medium">청소일 1~2일 전: 경고 1회</p>
              <p className="text-xs text-red-700 font-medium">청소 당일 취소: 경고 2회 + 매칭 제한 3일</p>
              <p className="text-xs text-red-600 mt-1">누적 경고 3회 시 서비스 이용이 제한됩니다.</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowCancelConfirm(true)}
          className="w-full mt-3 py-2.5 border border-red-300 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors">
          지원 취소
        </button>
      </section>

      {/* 청소 시작 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50 space-y-2">
        {!allChecked && (
          <p className="text-xs text-amber-600 text-center">준비물을 모두 체크해주세요</p>
        )}
        <button onClick={handleStartCleaning} disabled={!allChecked || daysLeft > 0}
          className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
          {daysLeft > 0 ? `D-${daysLeft} 청소 예정일에 시작 가능` : '청소 시작하기'}
        </button>
      </div>

      {/* 취소 확인 모달 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">지원을 취소하시겠습니까?</h3>
            <p className="text-sm text-gray-600">
              {daysLeft <= 0 ? '당일 취소는 경고 2회 + 매칭 제한 3일 패널티가 부과됩니다.' :
               daysLeft <= 2 ? '1~2일 전 취소는 경고 1회 패널티가 부과됩니다.' :
               '3일 전 취소로 패널티 없이 취소됩니다.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl">돌아가기</button>
              <button onClick={handleCancel} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl">취소하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
