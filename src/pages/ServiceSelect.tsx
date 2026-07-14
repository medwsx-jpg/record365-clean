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

      {/* Service Cards - 좌우 배치 */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* 슥싹 매칭 */}
        <button
          onClick={() => navigate('/clean')}
          className="bg-gray-50 rounded-2xl p-5 active:bg-gray-100 transition-all text-center"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.278L21 12l-5.816 1.91a2 2 0 00-1.272 1.277L12 21l-1.912-5.813a2 2 0 00-1.272-1.278L3 12l5.816-1.91a2 2 0 001.272-1.277L12 3z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900">슥싹 매칭</h2>
          <p className="text-xs text-gray-400 mt-1">청소 전문가 매칭</p>
        </button>

        {/* 렌탈 분쟁 기록 */}
        <button
          onClick={() => navigate('/rental')}
          className="bg-gray-50 rounded-2xl p-5 active:bg-gray-100 transition-all text-center"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#7c3aed' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a12 12 0 008.5 3A12 12 0 0112 21 12 12 0 013.5 6 12 12 0 0012 3" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900">렌탈 분쟁 기록</h2>
          <p className="text-xs text-gray-400 mt-1">전후 상태를 사진 기록</p>
        </button>
      </div>

      <p className="text-xs text-gray-300 mt-16">
        Record 365 &copy; 2026
      </p>
    </div>
  );
}
