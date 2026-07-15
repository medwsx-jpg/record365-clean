import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: '서비스 미제공 범위가 궁금해요.',
    answer:
      '다음 항목은 서비스 범위에 포함되지 않습니다.\n\n' +
      '• 천장, 높은 곳의 조명 청소 (안전상 제한)\n' +
      '• 외부 창문 청소 (2층 이상)\n' +
      '• 곰팡이 제거, 특수 약품이 필요한 오염\n' +
      '• 폐기물 처리 및 대형 쓰레기 반출\n' +
      '• 반려동물 관련 청소 (배변 처리 등)\n' +
      '• 가구 이동이 필요한 청소 (무거운 가구)\n\n' +
      '특수 청소가 필요한 경우, 의뢰 등록 시 요청사항에 미리 적어주시면 가능 여부를 안내드립니다.',
  },
  {
    question: '청소 도구는 무엇을 준비해야 되나요?',
    answer:
      '소지하고 계신 청소 도구를 사용해요. 청소에 필요한 도구를 미리 준비해주세요.\n\n' +
      '• 진공 청소기 (또는 빗자루)\n' +
      '• 막대걸레\n' +
      '• 청소포 (막대걸레 부착용)\n' +
      '• 걸레\n' +
      '• 고무장갑\n' +
      '• 세제\n' +
      '• 세척용품\n' +
      '• 쓰레기봉투 등\n\n' +
      '도구가 부족하면 청소자가 기본 도구를 지참할 수 있지만, 사전에 협의가 필요합니다.',
  },
  {
    question: '우리 집에 어떤 클리너가 방문하나요?',
    answer:
      '슥싹 매칭에 등록된 청소자는 모두 프로필 등록과 교육 영상 시청을 완료한 분들입니다.\n\n' +
      '• 청소자의 프로필 (경력, 자기소개, 등급)을 매칭 후 확인할 수 있습니다.\n' +
      '• 등급 시스템 (브론즈 → 실버 → 골드 → 플래티넘)으로 경험이 많은 청소자를 구분할 수 있습니다.\n' +
      '• 매칭 완료 후 청소자 정보가 표시되며, 불편한 점이 있으면 고객센터로 문의해주세요.',
  },
  {
    question: '부재중에 비대면 서비스를 받고싶어요.',
    answer:
      '비대면 서비스도 가능합니다.\n\n' +
      '• 의뢰 등록 시 요청사항에 "비대면 희망"이라고 적어주세요.\n' +
      '• 출입 방법 (비밀번호, 키패드 등)을 별도로 안내해주셔야 합니다.\n' +
      '• 청소 완료 후 사진으로 결과를 확인하실 수 있습니다.\n' +
      '• 귀중품은 미리 보관해주시는 것을 권장합니다.',
  },
  {
    question: '시간을 연장하고 싶어요.',
    answer:
      '청소 진행 중 시간 연장이 필요한 경우:\n\n' +
      '• 청소자와 직접 협의하여 연장 가능합니다.\n' +
      '• 연장 시간에 대한 추가 비용은 시간당 기준으로 협의해주세요.\n' +
      '• 청소자의 다음 일정에 따라 연장이 어려울 수 있으니, 가능 여부를 먼저 확인해주세요.\n' +
      '• 연장 비용은 기존 의뢰 금액과 별도로 정산됩니다.',
  },
  {
    question: '결제 시점은 언제인가요?',
    answer:
      '결제는 청소 완료 후 진행됩니다.\n\n' +
      '• 청소자가 작업을 완료하고 완료 보고를 하면, 의뢰자에게 확인 요청이 갑니다.\n' +
      '• 의뢰자가 청소 결과를 확인한 뒤 결제가 확정됩니다.\n' +
      '• 결제 수단은 추후 앱 내 결제 시스템이 도입될 예정이며, 현재는 직접 정산 방식입니다.\n' +
      '• 금액 관련 분쟁은 고객센터를 통해 도움받으실 수 있습니다.',
  },
  {
    question: '청소 일정을 변경하고 싶어요.',
    answer:
      '일정 변경은 청소 시작 전까지 가능합니다.\n\n' +
      '• 매칭 완료 전: 의뢰를 취소하고 새로 등록해주세요.\n' +
      '• 매칭 완료 후: 청소자와 직접 협의하여 일정을 조정해주세요.\n' +
      '• 당일 취소나 잦은 변경은 매칭에 불이익이 있을 수 있으니 가급적 미리 변경해주세요.',
  },
  {
    question: '청소 결과가 불만족스러워요.',
    answer:
      '청소 결과에 만족하지 못하신 경우:\n\n' +
      '• 청소 완료 확인 시 불만족 사항을 구체적으로 알려주세요.\n' +
      '• 사진 기록 기능을 활용하여 청소 전후 상태를 비교할 수 있습니다.\n' +
      '• 심각한 문제가 있을 경우 고객센터를 통해 재청소 또는 환불 절차를 안내받으실 수 있습니다.\n' +
      '• 청소자 평가를 통해 서비스 품질 개선에 기여할 수 있습니다.',
  },
  {
    question: '의뢰 가격은 어떻게 정해지나요?',
    answer:
      '의뢰 등록 시 가이드 금액을 참고하여 희망 가격을 설정합니다.\n\n' +
      '• 집 청소: 기본료 + 공간 구성 (방, 거실, 화장실 수)에 따라 산출\n' +
      '• 사무실/매장: 기본료 + 면적(평수)에 따라 산출\n' +
      '• 입주/이사, 가전 청소: 카테고리별 기본 가격 제공\n' +
      '• 가이드 금액은 참고용이며, 최종 가격은 의뢰자가 자유롭게 조정할 수 있습니다.\n' +
      '• 적정 가격을 제시할수록 빠른 매칭이 가능합니다.',
  },
];

export default function ClientFAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">자주 묻는 질문</h1>
      </header>

      <div className="p-4">
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {FAQ_LIST.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="w-full text-left px-4 py-4 flex items-center justify-between gap-3"
              >
                <span className="text-sm font-medium text-gray-800">{item.question}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4">
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          추가 문의사항은 고객센터로 연락주세요.
        </p>
      </div>
    </div>
  );
}
