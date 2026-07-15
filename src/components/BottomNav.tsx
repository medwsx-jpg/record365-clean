import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  disabled?: boolean;
  disabledLabel?: string;
}

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('cleanmatch_role') || 'client';

  const clientItems: NavItem[] = [
    {
      label: '홈',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: '/clean/client',
    },
    {
      label: '청소 의뢰',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      path: '/clean/client/create',
    },
    {
      label: '채팅',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      path: '#',
      disabled: true,
      disabledLabel: '(준비중)',
    },
    {
      label: '마이페이지',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      path: '/clean/mypage',
    },
  ];

  const cleanerItems: NavItem[] = [
    {
      label: '홈',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: '/clean/cleaner',
    },
    {
      label: '의뢰 목록',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
      path: '/clean/cleaner',
    },
    {
      label: '채팅',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      path: '#',
      disabled: true,
      disabledLabel: '(준비중)',
    },
    {
      label: '마이페이지',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      path: '/clean/mypage',
    },
  ];

  const items = role === 'cleaner' ? cleanerItems : clientItems;

  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 max-w-[480px] mx-auto">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => {
                if (!item.disabled) {
                  navigate(item.path);
                }
              }}
              disabled={item.disabled}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                item.disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : active
                  ? 'text-green-500'
                  : 'text-gray-500 active:text-green-400'
              }`}
            >
              <span className={active ? 'text-green-500' : ''}>{item.icon}</span>
              <span className="text-[10px] mt-1 leading-none">
                {item.label}
                {item.disabledLabel && (
                  <span className="block text-[8px] text-gray-300">{item.disabledLabel}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
