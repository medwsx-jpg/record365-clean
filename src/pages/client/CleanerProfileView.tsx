import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Review } from '../../types';
import { api } from '../../store';

export default function CleanerProfileView() {
  const { cleanerId } = useParams<{ cleanerId: string }>();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cleanerInfo, setCleanerInfo] = useState<{ name: string; photo: string; completedJobs: number; rating: number } | null>(null);

  useEffect(() => {
    if (!cleanerId) return;
    (async () => {
      // 청소자 정보 가져오기 — 프로필 또는 의뢰 데이터에서 조합
      const profile = localStorage.getItem('cleanmatch_cleaner_profile');
      const parsed = profile ? JSON.parse(profile) : null;
      const cleanerReviews = await api.getReviewsByCleanerId(cleanerId);
      setReviews(cleanerReviews);

      // 완료 건수 계산
      const allRequests = await api.getRequests();
      const completedCount = allRequests.filter(
        (r) => r.cleanerId === cleanerId && r.status === 'completed'
      ).length;

      const avgRating = await api.getCleanerAverageRating(cleanerId);

      if (parsed && (cleanerId === 'self' || cleanerId === parsed.id)) {
        setCleanerInfo({
          name: parsed.name || '청소자',
          photo: parsed.photo || '',
          completedJobs: completedCount,
          rating: avgRating,
        });
      } else {
        // mock cleaner 또는 의뢰에서 이름 추출
        const req = allRequests.find((r) => r.cleanerId === cleanerId);
        setCleanerInfo({
          name: req?.cleanerName || '청소자',
          photo: req?.cleanerPhoto || '',
          completedJobs: completedCount,
          rating: avgRating,
        });
      }
    })();
  }, [cleanerId]);

  if (!cleanerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">청소자 정보를 찾을 수 없습니다</p>
      </div>
    );
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="18" height="18" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#facc15' : 'none'}
          stroke={s <= Math.round(rating) ? '#facc15' : '#d1d5db'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-8">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">청소자 프로필</h1>
      </header>

      {/* 프로필 카드 */}
      <section className="bg-white mt-2 p-6">
        <div className="flex flex-col items-center">
          {cleanerInfo.photo ? (
            <img src={cleanerInfo.photo} alt="프로필" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-2xl mb-3">
              {cleanerInfo.name.charAt(0)}
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-1">{cleanerInfo.name}</h2>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(cleanerInfo.rating)}
            <span className="text-sm font-bold text-gray-700">
              {cleanerInfo.rating > 0 ? cleanerInfo.rating.toFixed(1) : '-'}
            </span>
          </div>
          <div className="flex gap-6 mt-2">
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{cleanerInfo.completedJobs}</p>
              <p className="text-xs text-gray-500">완료 건수</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-500">{reviews.length}</p>
              <p className="text-xs text-gray-500">리뷰 수</p>
            </div>
          </div>
        </div>
      </section>

      {/* 리뷰 목록 */}
      <section className="bg-white mt-2 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">리뷰 ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">아직 리뷰가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                        fill={s <= review.rating ? '#facc15' : 'none'}
                        stroke={s <= review.rating ? '#facc15' : '#d1d5db'}
                        strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
