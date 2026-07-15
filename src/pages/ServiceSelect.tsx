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
      <div className="w-full grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/clean')}
          className="bg-gray-50 rounded-2xl p-5 active:bg-gray-100 transition-all text-center"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center overflow-hidden bg-orange-50">
            <img src="/clean-icon.png" alt="슥싹 매칭" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">슥싹 매칭</h2>
          <p className="text-xs text-gray-400 mt-1">청소 전문가 매칭</p>
        </button>

        <button
          onClick={() => navigate('/rental')}
          className="bg-gray-50 rounded-2xl p-5 active:bg-gray-100 transition-all text-center"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center overflow-hidden bg-violet-50">
            <img src="/rental-icon.png" alt="렌탈 분쟁 기록" className="w-12 h-12 object-contain" />
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
