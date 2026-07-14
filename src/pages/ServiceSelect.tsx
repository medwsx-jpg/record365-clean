import { useNavigate } from 'react-router-dom';

export default function ServiceSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto">
      {/* Logo */}
      <div className="text-center mb-12">
        <img
          src="/record365-icon.png"
          alt="Record 365"
          className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-sm"
        />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Record 365
        </h1>
        <p className="text-gray-400 mt-1 text-sm">기록하고, 매칭하고, 해결하세요</p>
      </div>

      {/* Service Cards */}
      <div className="w-full space-y-3">
        {/* 슥싹 매칭 */}
        <button
          onClick={() => navigate('/clean')}
          className="w-full bg-gray-50 rounded-2xl p-5 active:bg-gray-100 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 6" />
                <path d="M8 4L16 4" />
                <path d="M10 6L10 14C10 14 6 16 6 20L18 20C18 16 14 14 14 14L14 6" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900">슥싹 매칭</h2>
              <p className="text-sm text-gray-400 mt-0.5">청소 전문가 매칭</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* 렌탈 분쟁 기록 */}
        <button
          onClick={() => navigate('/rental')}
          className="w-full bg-gray-50 rounded-2xl p-5 active:bg-gray-100 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900">렌탈 분쟁 기록</h2>
              <p className="text-sm text-gray-400 mt-0.5">렌탈 전후 상태를 사진으로 기록</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-300 mt-16">
        Record 365 &copy; 2026
      </p>
    </div>
  );
}
