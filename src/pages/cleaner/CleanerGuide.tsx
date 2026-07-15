import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

// 준비물 체크리스트
const SUPPLIES = [
  { category: '기본 도구', items: ['고무장갑', '걸레 (마른/젖은)', '청소 솔', '쓰레기 봉투', '스프레이 공병'] },
  { category: '세제류', items: ['다목적 세정제', '유리 세정제', '욕실 세정제', '주방 세정제'] },
  { category: '장비', items: ['청소기 (선택)', '밀대', '양동이', '스크래퍼'] },
  { category: '위생용품', items: ['마스크', '앞치마', '덧신 (실내화)', '소독용 알코올'] },
];

// FAQ 데이터
const FAQ_DATA = [
  {
    q: '의뢰를 수락한 후 취소할 수 있나요?',
    a: '청소 시작 24시간 전까지 무료 취소 가능합니다. 24시간 이내 취소 시 패널티가 부과될 수 있습니다.',
  },
  {
    q: '청소 시간이 초과되면 어떻게 하나요?',
    a: '예상 시간을 초과할 경우, 의뢰자에게 연장 여부를 확인 후 진행합니다. 추가 시간에 대한 비용은 별도 협의합니다.',
  },
  {
    q: '청소 중 물건이 파손되면 어떻게 하나요?',
    a: '즉시 의뢰자에게 알리고, 사진을 촬영하여 앱에 기록해주세요. 슥싹 매칭 보험을 통해 보상 절차가 진행됩니다.',
  },
  {
    q: '결제는 어떻게 이루어지나요?',
    a: '청소 완료 확인 후 앱을 통해 자동 정산됩니다. 정산 주기는 주 1회이며, 등록된 계좌로 입금됩니다.',
  },
  {
    q: '등급은 어떻게 올릴 수 있나요?',
    a: '청소 완료 건수에 따라 자동으로 올라갑니다. 브론즈(0건) → 실버(10건) → 골드(30건) → 플래티넘(100건). 높은 등급일수록 우선 매칭, 상위 노출 등 혜택이 있습니다.',
  },
  {
    q: '의뢰자가 불합리한 요구를 하면 어떻게 하나요?',
    a: '계약 범위 외의 요구는 정중히 거절하시고, 문제가 지속되면 앱 내 신고 기능을 이용해주세요. 고객센터에서 중재합니다.',
  },
  {
    q: '교육 이수 후 재교육이 필요한가요?',
    a: '6개월마다 업데이트 교육이 제공됩니다. 재교육은 필수는 아니지만, 이수 시 가산점이 부여됩니다.',
  },
  {
    q: '특수 청소(에어컨, 세탁기 등)도 가능한가요?',
    a: '특수 청소는 별도 자격이 필요합니다. 추가 교육 이수 후 특수 청소 카테고리를 활성화할 수 있습니다.',
  },
];

export default function CleanerGuide() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'supplies' | 'faq'>('supplies');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (item: string) => {
    const next = new Set(checkedItems);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setCheckedItems(next);
  };

  const totalItems = SUPPLIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checkedItems.size;

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-20">
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">청소자 가이드</h1>
      </header>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        <button
          onClick={() => setTab('supplies')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'supplies' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
          }`}
        >
          준비물 체크리스트
        </button>
        <button
          onClick={() => setTab('faq')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'faq' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
          }`}
        >
          자주 묻는 질문
        </button>
      </div>

      {tab === 'supplies' && (
        <div className="p-4">
          {/* 체크 진행률 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">준비 완료</span>
              <span className="text-sm font-bold text-green-600">{checkedCount}/{totalItems}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            {SUPPLIES.map((cat) => (
              <div key={cat.category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700">{cat.category}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {cat.items.map((item) => {
                    const checked = checkedItems.has(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleCheck(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {checked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'faq' && (
        <div className="p-4 space-y-2">
          {FAQ_DATA.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-gray-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
