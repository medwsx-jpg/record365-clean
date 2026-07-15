import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './store';
import { getGradeByJobs, getNextGrade, getProgressToNextGrade } from './utils/gradeSystem';

import ServiceSelect from './pages/ServiceSelect';
import RentalApp from './pages/rental/RentalApp';
import RoleSelect from './pages/RoleSelect';
import ClientHome from './pages/client/ClientHome';
import CreateRequest from './pages/client/CreateRequest';
import ClientFAQ from './pages/client/ClientFAQ';
import ClientReview from './pages/client/ClientReview';
import WriteReview from './pages/client/WriteReview';
import CleanerProfileView from './pages/client/CleanerProfileView';
import MatchWaiting from './pages/client/MatchWaiting';
import MatchComplete from './pages/client/MatchComplete';
import CleanerHome from './pages/cleaner/CleanerHome';
import RequestDetail from './pages/cleaner/RequestDetail';
import CleanerPrep from './pages/cleaner/CleanerPrep';
import CleaningProgress from './pages/cleaner/CleaningProgress';
import CleaningComplete from './pages/cleaner/CleaningComplete';
import CleanerProfile from './pages/cleaner/CleanerProfile';
import CleanerTraining from './pages/cleaner/CleanerTraining';
import CleanerGuide from './pages/cleaner/CleanerGuide';

function RoleGuard({ children, role }: { children: React.ReactNode; role: 'client' | 'cleaner' }) {
  const currentRole = api.getRole();
  if (!currentRole) return <Navigate to="/clean" replace />;
  if (currentRole !== role) return <Navigate to={`/clean/${currentRole}`} replace />;
  return <>{children}</>;
}

function CleanRootRedirect() { return <RoleSelect />; }

// ---------------------------------------------------------------------------
// 의뢰자 마이페이지
// ---------------------------------------------------------------------------
function ClientMyPage() {
  const handleReset = () => {
    sessionStorage.removeItem('cleanmatch_role');
    localStorage.removeItem('cleanmatch_requests');
    localStorage.removeItem('cleanmatch_reviews');
    window.location.href = '/clean';
  };
  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">의</div>
          <div><p className="font-bold text-gray-800">의뢰자</p><p className="text-sm text-gray-500">Record 365 회원</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        <a href="/" className="block w-full text-left px-4 py-3.5 text-gray-700 text-sm">서비스 선택으로 돌아가기</a>
        <a href="/clean/faq" className="flex items-center justify-between px-4 py-3.5 text-gray-700 text-sm">
          <span>자주 묻는 질문</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
        <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">알림 설정</button>
        <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">이용 약관</button>
        <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">고객센터</button>
      </div>
      <button onClick={handleReset} className="w-full bg-red-50 text-red-500 rounded-xl py-3 text-sm font-medium border border-red-100">역할 초기화 (데이터 삭제)</button>
    </>
  );
}

// ---------------------------------------------------------------------------
// 청소자 마이페이지
// ---------------------------------------------------------------------------
function CleanerMyPage() {
  const profileRaw = localStorage.getItem('cleanmatch_cleaner_profile');
  const profile = profileRaw ? JSON.parse(profileRaw) : null;
  const completedJobs = parseInt(localStorage.getItem('cleanmatch_completed_jobs') || '0', 10);
  const grade = getGradeByJobs(completedJobs);
  const nextGrade = getNextGrade(completedJobs);
  const progress = getProgressToNextGrade(completedJobs);
  const expLabels: Record<string, string> = { beginner: '입문 (1년 미만)', junior: '초급 (1~3년)', mid: '중급 (3~5년)', senior: '고급 (5년 이상)', expert: '전문가 (10년 이상)' };

  // 내 리뷰 평점
  const myRating = api.getCleanerAverageRating('self');
  const myReviews = api.getReviewsByCleanerId('self');

  const handleReset = () => {
    sessionStorage.removeItem('cleanmatch_role'); localStorage.removeItem('cleanmatch_requests');
    localStorage.removeItem('cleanmatch_cleaner_profile'); localStorage.removeItem('cleanmatch_completed_jobs');
    localStorage.removeItem('cleanmatch_training'); localStorage.removeItem('cleanmatch_reviews');
    window.location.href = '/clean';
  };
  return (
    <>
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-4">
          {profile?.photo ? (
            <img src={profile.photo} alt="프로필" className="w-16 h-16 rounded-full object-cover border-2 border-green-400 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl shrink-0">{profile?.name?.charAt(0) || '청'}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 truncate">{profile?.name || '프로필 미등록'}</h2>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${grade.bgColor} ${grade.color} border ${grade.borderColor}`}>{grade.emoji} {grade.label}</span>
            </div>
            {profile?.experience && <p className="text-xs text-gray-500 mt-0.5">{expLabels[profile.experience] || ''}</p>}
            <p className="text-xs text-gray-400 mt-0.5">완료 {completedJobs}건</p>
          </div>
        </div>
        {/* 평점 요약 */}
        {myReviews.length > 0 && (
          <div className="mt-3 bg-yellow-50 rounded-lg p-3 flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                  fill={s <= Math.round(myRating) ? '#facc15' : 'none'}
                  stroke={s <= Math.round(myRating) ? '#facc15' : '#d1d5db'}
                  strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">{myRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({myReviews.length}개 리뷰)</span>
          </div>
        )}
        {nextGrade && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-500">{grade.emoji} {grade.label}</span>
              <span className="text-[11px] text-gray-400">다음: {nextGrade.emoji} {nextGrade.label} ({nextGrade.minJobs}건)</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress.percent}%` }} /></div>
            <p className="text-[10px] text-gray-400 mt-1">{nextGrade.minJobs - completedJobs}건 더 완료하면 승급</p>
          </div>
        )}
        {grade.feeDiscount > 0 && (
          <div className="mt-3 bg-green-50 rounded-lg p-2 text-center"><span className="text-xs font-bold text-green-700">등급 혜택 적용 중</span></div>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        <a href="/clean/cleaner/profile" className="flex items-center justify-between px-4 py-3.5 text-gray-700 text-sm">
          <div className="flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg><span>프로필 수정</span></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
        <a href="/clean/cleaner/training" className="flex items-center justify-between px-4 py-3.5 text-gray-700 text-sm">
          <div className="flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg><span>교육 영상</span></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
        <a href="/clean/cleaner/guide" className="flex items-center justify-between px-4 py-3.5 text-gray-700 text-sm">
          <div className="flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg><span>준비물 / 가이드</span></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
        <a href="/clean/faq" className="flex items-center justify-between px-4 py-3.5 text-gray-700 text-sm">
          <div className="flex items-center gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg><span>자주 묻는 질문</span></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      </div>
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        <a href="/" className="block w-full text-left px-4 py-3.5 text-gray-700 text-sm">서비스 선택으로 돌아가기</a>
        <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">알림 설정</button>
        <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">이용 약관</button>
        <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">고객센터</button>
      </div>
      <button onClick={handleReset} className="w-full bg-red-50 text-red-500 rounded-xl py-3 text-sm font-medium border border-red-100">역할 초기화 (데이터 삭제)</button>
    </>
  );
}

// ---------------------------------------------------------------------------
// 마이페이지 (공통 레이아웃)
// ---------------------------------------------------------------------------
function MyPage() {
  const role = api.getRole();
  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <div className="bg-white border-b px-4 py-4"><h1 className="text-lg font-bold text-gray-800">마이페이지</h1></div>
      <div className="p-4 space-y-4">
        {role === 'cleaner' ? <CleanerMyPage /> : <ClientMyPage />}
        <p className="text-center text-xs text-gray-300 pt-4">Record 365 v2.0.0</p>
      </div>
      <div className="h-20" />
      <BottomNavInline />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 하단 네비게이션
// ---------------------------------------------------------------------------
function BottomNavInline() {
  const role = api.getRole();
  const loc = window.location.pathname;
  const clientTabs = [
    { label: '홈', path: '/clean/client', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>) },
    { label: '청소 의뢰', path: '/clean/client/create', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>) },
    { label: '채팅', path: '#', disabled: true, icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { label: '마이페이지', path: '/clean/mypage', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>) },
  ];
  const cleanerTabs = [
    { label: '홈', path: '/clean/cleaner', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>) },
    { label: '의뢰 목록', path: '/clean/cleaner', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" /></svg>) },
    { label: '채팅', path: '#', disabled: true, icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { label: '마이페이지', path: '/clean/mypage', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>) },
  ];
  const tabs = role === 'cleaner' ? cleanerTabs : clientTabs;
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around py-2">
        {tabs.map((tab: any) => {
          const active = loc === tab.path;
          return (
            <a key={tab.label} href={tab.disabled ? undefined : tab.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${tab.disabled ? 'text-gray-300 cursor-not-allowed' : active ? 'text-green-500' : 'text-gray-400'}`}
              onClick={(e: any) => { if (tab.disabled) e.preventDefault(); }}>
              {tab.icon}
              <span>{tab.label}</span>
              {tab.disabled && <span className="text-[8px]">(준비중)</span>}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ServiceSelect />} />
        <Route path="/rental" element={<RentalApp />} />
        <Route path="/clean" element={<CleanRootRedirect />} />
        <Route path="/clean/client" element={<RoleGuard role="client"><ClientHome /></RoleGuard>} />
        <Route path="/clean/client/create" element={<RoleGuard role="client"><CreateRequest /></RoleGuard>} />
        <Route path="/clean/client/matching/:id" element={<RoleGuard role="client"><MatchWaiting /></RoleGuard>} />
        <Route path="/clean/client/matched/:id" element={<RoleGuard role="client"><MatchComplete /></RoleGuard>} />
        <Route path="/clean/client/review/:id" element={<RoleGuard role="client"><ClientReview /></RoleGuard>} />
        <Route path="/clean/client/review/:id/write" element={<RoleGuard role="client"><WriteReview /></RoleGuard>} />
        <Route path="/clean/client/cleaner/:cleanerId" element={<RoleGuard role="client"><CleanerProfileView /></RoleGuard>} />
        <Route path="/clean/faq" element={<ClientFAQ />} />
        <Route path="/clean/cleaner" element={<RoleGuard role="cleaner"><CleanerHome /></RoleGuard>} />
        <Route path="/clean/cleaner/request/:id" element={<RoleGuard role="cleaner"><RequestDetail /></RoleGuard>} />
        <Route path="/clean/cleaner/prep/:id" element={<RoleGuard role="cleaner"><CleanerPrep /></RoleGuard>} />
        <Route path="/clean/cleaner/progress/:id" element={<RoleGuard role="cleaner"><CleaningProgress /></RoleGuard>} />
        <Route path="/clean/cleaner/complete/:id" element={<RoleGuard role="cleaner"><CleaningComplete /></RoleGuard>} />
        <Route path="/clean/cleaner/profile" element={<RoleGuard role="cleaner"><CleanerProfile /></RoleGuard>} />
        <Route path="/clean/cleaner/training" element={<RoleGuard role="cleaner"><CleanerTraining /></RoleGuard>} />
        <Route path="/clean/cleaner/guide" element={<RoleGuard role="cleaner"><CleanerGuide /></RoleGuard>} />
        <Route path="/clean/mypage" element={<MyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
