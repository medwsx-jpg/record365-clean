import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './store';

// Service selector (landing)
import ServiceSelect from './pages/ServiceSelect';

// Rental (iframe wrapper)
import RentalApp from './pages/rental/RentalApp';

// CleanMatch pages
import RoleSelect from './pages/RoleSelect';
import ClientHome from './pages/client/ClientHome';
import CreateRequest from './pages/client/CreateRequest';
import MatchWaiting from './pages/client/MatchWaiting';
import MatchComplete from './pages/client/MatchComplete';
import CleanerHome from './pages/cleaner/CleanerHome';
import RequestDetail from './pages/cleaner/RequestDetail';
import CleaningProgress from './pages/cleaner/CleaningProgress';
import CleaningComplete from './pages/cleaner/CleaningComplete';

// ---------------------------------------------------------------------------
// Guard: redirect to role select if no role is set
// ---------------------------------------------------------------------------

function RoleGuard({ children, role }: { children: React.ReactNode; role: 'client' | 'cleaner' }) {
  const currentRole = api.getRole();
  if (!currentRole) return <Navigate to="/clean" replace />;
  if (currentRole !== role) return <Navigate to={`/clean/${currentRole}`} replace />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Clean role redirect
// ---------------------------------------------------------------------------

function CleanRootRedirect() {
  const role = api.getRole();
  if (role === 'client') return <Navigate to="/clean/client" replace />;
  if (role === 'cleaner') return <Navigate to="/clean/cleaner" replace />;
  return <RoleSelect />;
}

// ---------------------------------------------------------------------------
// Simple MyPage
// ---------------------------------------------------------------------------

function MyPage() {
  const role = api.getRole();

  const handleReset = () => {
    localStorage.removeItem('cleanmatch_role');
    localStorage.removeItem('cleanmatch_requests');
    window.location.href = '/clean';
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-lg font-bold text-gray-800">마이페이지</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
              {role === 'client' ? '의' : '청'}
            </div>
            <div>
              <p className="font-bold text-gray-800">
                {role === 'client' ? '의뢰자' : '청소자'}
              </p>
              <p className="text-sm text-gray-500">Record 365 회원</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border divide-y">
          <a href="/" className="block w-full text-left px-4 py-3.5 text-gray-700 text-sm">
            서비스 선택으로 돌아가기
          </a>
          <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">
            알림 설정
          </button>
          <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">
            이용 약관
          </button>
          <button className="w-full text-left px-4 py-3.5 text-gray-700 text-sm">
            고객센터
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full bg-red-50 text-red-500 rounded-xl py-3 text-sm font-medium border border-red-100"
        >
          역할 초기화 (데이터 삭제)
        </button>

        <p className="text-center text-xs text-gray-300 pt-4">Record 365 v2.0.0</p>
      </div>

      <div className="h-20" />
      <BottomNavInline />
    </div>
  );
}

// Inline BottomNav for MyPage
function BottomNavInline() {
  const role = api.getRole();
  const loc = window.location.pathname;

  const tabs = [
    {
      label: '홈',
      path: role === 'client' ? '/clean/client' : '/clean/cleaner',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: '의뢰',
      path: role === 'client' ? '/clean/client/create' : '/clean/cleaner',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      label: '채팅',
      path: '#',
      disabled: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      label: '마이페이지',
      path: '/clean/mypage',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active = loc === tab.path || (tab.path !== '#' && loc.startsWith(tab.path) && tab.label === '홈');
          return (
            <a
              key={tab.label}
              href={tab.disabled ? undefined : tab.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                tab.disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : active
                  ? 'text-green-500'
                  : 'text-gray-400'
              }`}
              onClick={(e) => {
                if (tab.disabled) e.preventDefault();
              }}
            >
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

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing: service selector */}
        <Route path="/" element={<ServiceSelect />} />

        {/* Rental dispute (iframe) */}
        <Route path="/rental" element={<RentalApp />} />

        {/* CleanMatch routes */}
        <Route path="/clean" element={<CleanRootRedirect />} />
        <Route path="/clean/client" element={<RoleGuard role="client"><ClientHome /></RoleGuard>} />
        <Route path="/clean/client/create" element={<RoleGuard role="client"><CreateRequest /></RoleGuard>} />
        <Route path="/clean/client/matching/:id" element={<RoleGuard role="client"><MatchWaiting /></RoleGuard>} />
        <Route path="/clean/client/matched/:id" element={<RoleGuard role="client"><MatchComplete /></RoleGuard>} />
        <Route path="/clean/cleaner" element={<RoleGuard role="cleaner"><CleanerHome /></RoleGuard>} />
        <Route path="/clean/cleaner/request/:id" element={<RoleGuard role="cleaner"><RequestDetail /></RoleGuard>} />
        <Route path="/clean/cleaner/progress/:id" element={<RoleGuard role="cleaner"><CleaningProgress /></RoleGuard>} />
        <Route path="/clean/cleaner/complete/:id" element={<RoleGuard role="cleaner"><CleaningComplete /></RoleGuard>} />
        <Route path="/clean/mypage" element={<MyPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
