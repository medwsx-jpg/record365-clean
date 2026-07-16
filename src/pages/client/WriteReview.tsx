import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CleaningRequest } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { api } from '../../store';

export default function WriteReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const req = await api.getRequestById(id);
      if (req) {
        setRequest(req);
        // 이미 리뷰가 있는지 확인
        const review = await api.getReviewByRequestId(id);
        if (review) {
          setExistingReview(true);
          setRating(review.rating);
          setComment(review.comment);
        }
      }
    })();
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-gray-400">의뢰를 찾을 수 없습니다</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!request.cleanerId || !request.cleanerName) return;
    await api.saveReview({
      requestId: request.id,
      cleanerId: request.cleanerId,
      cleanerName: request.cleanerName,
      clientId: request.clientId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4 text-4xl">
          ⭐
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">리뷰 작성 완료!</h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          {request.cleanerName} 청소자에게 {rating}점을 남겨주셨습니다.
        </p>
        <p className="text-xs text-gray-400 mb-8">소중한 리뷰 감사합니다.</p>
        <button onClick={() => navigate('/clean/client')}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors">
          홈으로
        </button>
      </div>
    );
  }

  const stars = [1, 2, 3, 4, 5];
  const ratingLabels: Record<number, string> = {
    1: '별로예요',
    2: '그저 그래요',
    3: '보통이에요',
    4: '만족해요',
    5: '아주 만족해요!',
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">{existingReview ? '작성한 리뷰' : '리뷰 작성'}</h1>
      </header>

      {/* 의뢰 요약 */}
      <section className="bg-white mt-2 p-4">
        <div className="flex items-center gap-3">
          {request.cleanerPhoto ? (
            <img src={request.cleanerPhoto} alt="청소자" className="w-12 h-12 rounded-full object-cover border-2 border-green-400" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
              {request.cleanerName?.charAt(0) || '청'}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-800">{request.cleanerName}</p>
            <p className="text-xs text-gray-500">{CATEGORY_LABELS[request.category]} · {request.date}</p>
          </div>
        </div>
      </section>

      {/* 별점 */}
      <section className="bg-white mt-2 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 text-center">청소 서비스는 어떠셨나요?</h2>
        <div className="flex justify-center gap-2 mb-3">
          {stars.map((star) => (
            <button key={star} onClick={() => !existingReview && setRating(star)}
              className={`transition-transform ${!existingReview ? 'active:scale-110' : ''}`}
              disabled={existingReview}>
              <svg width="40" height="40" viewBox="0 0 24 24"
                fill={star <= rating ? '#facc15' : 'none'}
                stroke={star <= rating ? '#facc15' : '#d1d5db'}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-medium text-gray-700">{ratingLabels[rating]}</p>
      </section>

      {/* 한줄평 */}
      <section className="bg-white mt-2 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">한줄 리뷰</h2>
        {existingReview ? (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">{comment || '(작성된 리뷰 없음)'}</p>
          </div>
        ) : (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="청소 서비스에 대한 후기를 남겨주세요"
            maxLength={200}
            rows={4}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        )}
        {!existingReview && (
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/200</p>
        )}
      </section>

      {/* 제출 버튼 */}
      {!existingReview && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
          <button onClick={handleSubmit}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl text-base active:bg-green-600 transition-colors">
            리뷰 제출
          </button>
        </div>
      )}
    </div>
  );
}
