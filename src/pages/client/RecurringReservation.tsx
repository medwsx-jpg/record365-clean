import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningCategory, RecurringSchedule } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TIME_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const h = i + 8; // 08:00 ~ 18:00
  return `${h.toString().padStart(2, '0')}:00`;
});

export default function RecurringReservation() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);

  // 폼 상태
  const [category, setCategory] = useState<CleaningCategory>('home');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [time, setTime] = useState('10:00');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');

  useEffect(() => {
    setSchedules(api.getRecurringSchedules());
    // 기본 주소 불러오기
    const profile = api.getClientProfile();
    if (profile?.address) setAddress(profile.address);
  }, []);

  const toggleDay = (d: number) => {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort());
  };

  const handleSave = () => {
    if (days.length === 0) { alert('요일을 1개 이상 선택해주세요.'); return; }
    if (!address.trim()) { alert('주소를 입력해주세요.'); return; }
    if (!price || parseInt(price) < 10000) { alert('금액을 입력해주세요 (최소 1만원).'); return; }

    api.saveRecurringSchedule({
      category,
      address: address.trim(),
      price: parseInt(price),
      notes: notes.trim(),
      days,
      time,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
    });

    setSchedules(api.getRecurringSchedules());
    setShowForm(false);
    // 폼 초기화
    setDays([]);
    setNotes('');
    setPrice('');
  };

  const handleToggleActive = (id: string, active: boolean) => {
    api.updateRecurringSchedule(id, { active: !active });
    setSchedules(api.getRecurringSchedules());
  };

  const handleDelete = (id: string) => {
    if (confirm('이 정기 예약을 삭제하시겠습니까?')) {
      api.deleteRecurringSchedule(id);
      setSchedules(api.getRecurringSchedules());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">정기 청소 예약</h1>
      </header>

      {/* 안내 배너 */}
      <div className="bg-green-50 mx-4 mt-4 rounded-xl p-4 flex items-start gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="shrink-0 mt-0.5">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-800">정기 청소로 할인 받으세요</p>
          <p className="text-xs text-green-600 mt-0.5">매주 또는 격주 반복 예약을 설정하면 매칭 우선권이 부여됩니다.</p>
        </div>
      </div>

      {/* 등록된 정기 예약 목록 */}
      {schedules.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">내 정기 예약</h2>
          <div className="space-y-3">
            {schedules.map((s) => (
              <div key={s.id} className={`bg-white rounded-xl border p-4 ${s.active ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[s.category]}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? '활성' : '일시정지'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{s.price.toLocaleString('ko-KR')}원</span>
                </div>
                <p className="text-xs text-gray-500 mb-2 truncate">{s.address}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {DAY_LABELS.map((label, idx) => (
                      <span key={idx} className={`w-6 h-6 rounded-full text-[11px] flex items-center justify-center font-medium ${
                        s.days.includes(idx) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
                      }`}>{label}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{s.time}</span>
                  <span className="text-xs text-gray-400">· {s.frequency === 'weekly' ? '매주' : '격주'}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleActive(s.id, s.active)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg ${s.active ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                    {s.active ? '일시정지' : '다시 활성화'}
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-500">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 새 예약 등록 폼 */}
      {showForm ? (
        <section className="bg-white mt-4 mx-4 rounded-xl border border-gray-200 p-4 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">새 정기 예약</h2>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">청소 유형</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(CATEGORY_LABELS) as [CleaningCategory, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setCategory(key)}
                  className={`py-2 text-xs rounded-lg font-medium transition-colors ${
                    category === key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {/* 요일 선택 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">요일 선택</label>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, idx) => (
                <button key={idx} onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    days.includes(idx) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {/* 시간 + 주기 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">시간</label>
              <select value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 outline-none">
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">반복 주기</label>
              <div className="flex gap-2">
                <button onClick={() => setFrequency('weekly')}
                  className={`flex-1 py-2.5 text-xs rounded-xl font-medium ${frequency === 'weekly' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>매주</button>
                <button onClick={() => setFrequency('biweekly')}
                  className={`flex-1 py-2.5 text-xs rounded-xl font-medium ${frequency === 'biweekly' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>격주</button>
              </div>
            </div>
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">주소</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="청소 장소 주소" maxLength={100}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-300" />
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">희망 금액</label>
            <div className="relative">
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="50000" min="10000" step="5000"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-300 pr-10" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
          </div>

          {/* 요청사항 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">요청사항 (선택)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="특별한 요청사항이 있으면 입력하세요" maxLength={300} rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-300 resize-none" />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm">취소</button>
            <button onClick={handleSave}
              className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl text-sm active:bg-green-600">등록하기</button>
          </div>
        </section>
      ) : (
        <div className="px-4 mt-4">
          <button onClick={() => setShowForm(true)}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            정기 예약 등록
          </button>
        </div>
      )}

      {/* 안내 */}
      <div className="px-4 mt-6 space-y-3">
        <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
          <span className="text-lg">📅</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">자동 의뢰 생성</p>
            <p className="text-xs text-gray-500 mt-0.5">설정된 요일/시간에 자동으로 청소 의뢰가 생성되고 매칭됩니다.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
          <span className="text-lg">💰</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">정기 할인</p>
            <p className="text-xs text-gray-500 mt-0.5">정기 예약 시 청소자에게 매칭 우선권이 부여되어 더 빠른 매칭이 가능합니다.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
          <span className="text-lg">🔄</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">유연한 관리</p>
            <p className="text-xs text-gray-500 mt-0.5">일시정지, 요일 변경, 삭제 등 언제든 자유롭게 관리할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
