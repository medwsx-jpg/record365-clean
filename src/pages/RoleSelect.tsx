import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../store';
import CleanerOnboarding, { shouldShowOnboarding } from './cleaner/CleanerOnboarding';

export default function RoleSelect() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSelect = (role: 'client' | 'cleaner') => {
    api.setRole(role);
    if (role === 'cleaner' && shouldShowOnboarding()) {
      setShowOnboarding(true);
    } else {
      navigate(role === 'client' ? '/clean/client' : '/clean/cleaner');
    }
  };

  if (showOnboarding) {
    return <CleanerOnboarding onComplete={() => navigate('/clean/cleaner')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">
          <svg className="inline-block w-14 h-14 text-green-500" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4l2.5 7.5L34 14l-7.5 2.5L24 24l-2.5-7.5L14 14l7.5-2.5L24 4z" fill="currentColor" opacity="0.8" />
            <path d="M36 20l1.5 4.5L42 26l-4.5 1.5L36 32l-1.5-4.5L30 26l4.5-1.5L36 20z" fill="currentColor" opacity="0.5" />
            <line x1="10" y1="44" x2="28" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 28l6-6c1-1 3-1 4 0l0 0c1 1 1 3 0 4l-6 6-4-4z" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-500 tracking-tight">CleanMatch</h1>
        <p className="text-gray-500 mt-2 text-sm">깨끗한 공간, 쉬운 매칭</p>
      </div>

      <div className="w-full space-y-4">
        <button onClick={() => handleSelect('client')} className="w-full bg-white rounded-2xl border-2 border-green-400 p-6 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">의뢰자</h2>
              <p className="text-sm text-gray-500 mt-0.5">청소를 맡기고 싶어요</p>
            </div>
            <div className="ml-auto text-green-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </button>

        <button onClick={() => handleSelect('cleaner')} className="w-full bg-white rounded-2xl border-2 border-blue-400 p-6 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="22" x2="14" y2="13" />
                <path d="M13 14l4-4c.8-.8 2-.8 2.8 0 .8.8.8 2 0 2.8l-4 4-2.8-2.8z" />
                <line x1="3" y1="20" x2="7" y2="20" />
                <line x1="5" y1="18" x2="5" y2="22" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">청소자</h2>
              <p className="text-sm text-gray-500 mt-0.5">청소를 하고 싶어요</p>
            </div>
            <div className="ml-auto text-blue-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-300 mt-12">CleanMatch &copy; 2026</p>
    </div>
  );
}
