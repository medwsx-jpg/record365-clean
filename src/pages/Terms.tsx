import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'terms' | 'privacy';

export default function Terms() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('terms');

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-8">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">약관 및 정책</h1>
      </header>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        <button
          onClick={() => setTab('terms')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'terms' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'
          }`}
        >
          이용약관
        </button>
        <button
          onClick={() => setTab('privacy')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'privacy' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'
          }`}
        >
          개인정보처리방침
        </button>
      </div>

      {tab === 'terms' ? <TermsContent /> : <PrivacyContent />}
    </div>
  );
}

function TermsContent() {
  return (
    <div className="bg-white mt-2 px-4 py-5 space-y-6 text-sm text-gray-700 leading-relaxed">
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Record 365 이용약관</h2>
        <p className="text-xs text-gray-400 mb-4">시행일: 2024년 1월 1일 | 최종 수정: 2025년 7월 1일</p>
      </div>

      <Section title="제1조 (목적)">
        본 약관은 Record 365(이하 "회사")이 제공하는 분쟁해결 기록 서비스 및 슥싹 매칭 청소 중개 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </Section>

      <Section title="제2조 (정의)">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>"서비스"란 회사가 제공하는 분쟁해결 녹음/기록 서비스와 청소 매칭 중개 서비스를 말합니다.</li>
          <li>"의뢰자"란 청소 서비스를 요청하는 이용자를 말합니다.</li>
          <li>"청소자"란 청소 서비스를 제공하는 이용자를 말합니다.</li>
          <li>"슥싹 매칭"이란 의뢰자와 청소자를 연결하는 중개 서비스를 말합니다.</li>
        </ol>
      </Section>

      <Section title="제3조 (약관의 효력)">
        본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용되며, 이용자가 회원가입 시 동의한 것으로 간주합니다. 회사는 관련 법령에 위배되지 않는 범위에서 약관을 개정할 수 있습니다.
      </Section>

      <Section title="제4조 (서비스의 내용)">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li><strong>분쟁해결 기록 서비스:</strong> 음성 녹음, 기록 저장 및 관리 기능을 제공합니다.</li>
          <li><strong>슥싹 매칭 서비스:</strong> 청소 의뢰 등록, 청소자 매칭, Before/After 사진 비교, 청소 완료 확인, 리뷰 작성 등의 기능을 제공합니다.</li>
          <li>회사는 중개 플랫폼으로서, 청소 서비스의 품질에 대해 직접적인 책임을 지지 않습니다.</li>
        </ol>
      </Section>

      <Section title="제5조 (이용자의 의무)">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>이용자는 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.</li>
          <li>의뢰자는 정확한 청소 장소, 희망 일시 및 요구사항을 기재해야 합니다.</li>
          <li>청소자는 매칭 수락 후 성실히 서비스를 제공해야 합니다.</li>
          <li>Before/After 사진은 청소 품질 확인 목적으로만 사용되어야 합니다.</li>
        </ol>
      </Section>

      <Section title="제6조 (결제 및 환불)">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>결제는 매칭 완료 후 진행되며, 청소 완료 확인 후 청소자에게 정산됩니다.</li>
          <li>매칭 전 취소 시 전액 환불됩니다.</li>
          <li>청소 진행 중 또는 완료 후 분쟁 발생 시, 회사의 중재 절차를 통해 처리됩니다.</li>
          <li>A/S 재방문 요청은 청소 완료 확인 전에 가능합니다.</li>
        </ol>
      </Section>

      <Section title="제7조 (서비스 이용 제한)">
        회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다.
        <ol className="list-decimal list-inside space-y-1.5 ml-1 mt-2">
          <li>허위 정보 등록 또는 타인 정보 도용</li>
          <li>부적절한 콘텐츠 게시</li>
          <li>서비스 운영 방해 행위</li>
          <li>청소자의 반복적인 서비스 불이행</li>
        </ol>
      </Section>

      <Section title="제8조 (면책)">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>회사는 이용자 간 직접 거래에서 발생한 분쟁에 대해 개입 의무를 부담하지 않습니다.</li>
          <li>천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
        </ol>
      </Section>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">본 약관에 대한 문의: support@record365.com</p>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="bg-white mt-2 px-4 py-5 space-y-6 text-sm text-gray-700 leading-relaxed">
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Record 365 개인정보처리방침</h2>
        <p className="text-xs text-gray-400 mb-4">시행일: 2024년 1월 1일 | 최종 수정: 2025년 7월 1일</p>
      </div>

      <Section title="1. 수집하는 개인정보 항목">
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-800 mb-1">공통 (필수)</p>
            <p>이름, 이메일, 연락처, 서비스 이용 기록</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">분쟁해결 서비스</p>
            <p>음성 녹음 데이터, 기록 메모</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">슥싹 매칭 서비스 (추가)</p>
            <p>주소(청소 장소), 청소 전/후 사진, 결제 정보, 리뷰 내용, 채팅 메시지</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">청소자 추가 수집</p>
            <p>프로필 사진, 경력 정보, 서비스 가능 지역, 신분증 사본(본인 확인용)</p>
          </div>
        </div>
      </Section>

      <Section title="2. 개인정보의 수집 및 이용 목적">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>서비스 제공 및 회원 관리</li>
          <li>청소 의뢰 매칭 및 정산 처리</li>
          <li>Before/After 사진을 통한 청소 품질 확인</li>
          <li>서비스 개선 및 통계 분석</li>
          <li>고객 문의 및 분쟁 처리</li>
        </ol>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용 기간">
        <div className="space-y-2">
          <p>회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 아래 정보는 일정 기간 보관합니다.</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>계약 또는 청약철회에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
          </ul>
        </div>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우 예외로 합니다.</p>
        <ol className="list-decimal list-inside space-y-1.5 ml-1 mt-2">
          <li>이용자가 사전에 동의한 경우</li>
          <li>매칭된 의뢰자-청소자 간 서비스 제공에 필요한 최소 정보(이름, 연락처, 주소)</li>
          <li>법률에 의해 요구되는 경우</li>
        </ol>
      </Section>

      <Section title="5. 청소 사진의 관리">
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li>Before/After 사진은 해당 의뢰의 의뢰자와 담당 청소자만 열람할 수 있습니다.</li>
          <li>사진은 청소 품질 확인 및 분쟁 해결 목적으로만 사용됩니다.</li>
          <li>의뢰 완료 후 90일 경과 시 서버에서 자동 삭제됩니다.</li>
        </ol>
      </Section>

      <Section title="6. 개인정보의 파기 절차 및 방법">
        <p>보유 기간 경과 또는 처리 목적 달성 시 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로, 종이 문서는 분쇄기로 파기합니다.</p>
      </Section>

      <Section title="7. 이용자의 권리">
        <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제, 처리 정지를 요청할 수 있으며, 회사는 지체 없이 처리합니다.</p>
      </Section>

      <Section title="8. 개인정보 보호책임자">
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p><span className="text-gray-500">담당자:</span> Record 365 개인정보보호팀</p>
          <p><span className="text-gray-500">이메일:</span> privacy@record365.com</p>
          <p><span className="text-gray-500">전화:</span> 고객센터를 통해 문의</p>
        </div>
      </Section>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">본 방침에 대한 문의: privacy@record365.com</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  );
}
