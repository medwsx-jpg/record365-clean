import { useNavigate } from 'react-router-dom';

export default function ServiceSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto">
      {/* Logo & Title */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">
          <svg
            className="inline-block w-14 h-14 text-indigo-500"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <text x="24" y="30" textAnchor="middle" fontSize="18" fill="currentColor" fontWeight="bold">R</text>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Record 365
        </h1>
        <p className="text-gray-500 mt-2 text-sm">기록하고, 매칭하고, 해결하세요</p>
      </div>

      {/* Service Cards */}
      <div className="w-full space-y-4">
        {/* Cleaning Match */}
        <button
          onClick={() => navigate('/clean')}
          className="w-full bg-white rounded-2xl border-2 border-green-400 p-6 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="22" x2="14" y2="13" />
                <path d="M13 14l4-4c.8-.8 2-.8 2.8 0 .8.8.8 2 0 2.8l-4 4-2.8-2.8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">청소 매칭</h2>
              <p className="text-sm text-gray-500 mt-0.5">청소가 필요할 때, 전문가를 매칭</p>
            </div>
            <div className="ml-auto text-green-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </button>

        {/* Rental Dispute */}
        <button
          onClick={() => navigate('/rental')}
          className="w-full bg-white rounded-2xl border-2 border-blue-400 p-6 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">렌탈 분쟁 기록</h2>
              <p className="text-sm text-gray-500 mt-0.5">렌탈 전후 상태를 사진으로 기록</p>
            </div>
            <div className="ml-auto text-blue-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-300 mt-12">
        Record 365 &copy; 2026
      </p>
    </div>
  );
}
