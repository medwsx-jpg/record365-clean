import { useNavigate } from 'react-router-dom';

const RENTAL_URL = 'https://rental-dispute-app.vercel.app';

export default function RentalApp() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col max-w-[480px] mx-auto">
      {/* Header with back button */}
      <header className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 shrink-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">렌탈 분쟁 기록</h1>
      </header>

      {/* Iframe */}
      <iframe
        src={RENTAL_URL}
        className="flex-1 w-full border-0"
        title="렌탈 분쟁 기록"
        allow="camera;microphone"
      />
    </div>
  );
}
