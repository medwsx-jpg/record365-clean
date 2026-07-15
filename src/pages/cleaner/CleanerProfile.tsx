import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADES, getGradeByJobs, getNextGrade, getProgressToNextGrade } from '../../utils/gradeSystem';

interface CleanerProfileData {
  name: string;
  phone: string;
  photo: string;
  experience: string;
  intro: string;
}

export default function CleanerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CleanerProfileData>({
    name: '',
    phone: '',
    photo: '',
    experience: '',
    intro: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAllGrades, setShowAllGrades] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cleanmatch_cleaner_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      setIsEditing(true);
    }
  }, []);

  const completedJobs = parseInt(localStorage.getItem('cleanmatch_completed_jobs') || '0', 10);
  const grade = getGradeByJobs(completedJobs);
  const nextGrade = getNextGrade(completedJobs);
  const progress = getProgressToNextGrade(completedJobs);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!profile.name || !profile.phone) return;
    localStorage.setItem('cleanmatch_cleaner_profile', JSON.stringify(profile));
    setIsEditing(false);
  };

  const isValid = profile.name.trim() && profile.phone.trim();

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto">
        <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">프로필 등록</h1>
        </header>
        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center">
            <label className="cursor-pointer">
              {profile.photo ? (
                <img src={profile.photo} alt="프로필" className="w-24 h-24 rounded-full object-cover border-2 border-green-400" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            <p className="text-xs text-gray-400 mt-2">사진을 탭하여 업로드</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="실명을 입력하세요" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="010-0000-0000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <p className="text-xs text-gray-400 mt-1">전화번호는 관리자만 볼 수 있습니다</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">청소 경력</label>
            <select value={profile.experience} onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
              <option value="">선택하세요</option>
              <option value="beginner">입문 (1년 미만)</option>
              <option value="junior">초급 (1~3년)</option>
              <option value="mid">중급 (3~5년)</option>
              <option value="senior">고급 (5년 이상)</option>
              <option value="expert">전문가 (10년 이상)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
            <textarea value={profile.intro} onChange={(e) => setProfile((p) => ({ ...p, intro: e.target.value }))} placeholder="의뢰자에게 보여질 자기소개를 작성하세요" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
          </div>
          <button onClick={handleSave} disabled={!isValid} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors mt-4">
            프로필 저장
          </button>
        </div>
      </div>
    );
  }

  const expLabels: Record<string, string> = {
    beginner: '입문 (1년 미만)',
    junior: '초급 (1~3년)',
    mid: '중급 (3~5년)',
    senior: '고급 (5년 이상)',
    expert: '전문가 (10년 이상)',
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">내 프로필</h1>
        </div>
        <button onClick={() => setIsEditing(true)} className="text-sm text-green-500 font-medium">수정</button>
      </header>

      <div className="p-4 space-y-4">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col items-center">
          {profile.photo ? (
            <img src={profile.photo} alt="프로필" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-2xl mb-3">
              {profile.name.charAt(0)}
            </div>
          )}
          <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
          <span className={`text-xs font-medium px-3 py-1 rounded-full mt-1 ${grade.bgColor} ${grade.color} border ${grade.borderColor}`}>
            {grade.emoji} {grade.label}
          </span>
        </div>

        {/* 등급 진행 상황 */}
        <div className={`rounded-xl p-4 border ${grade.borderColor} ${grade.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${grade.color}`}>{grade.emoji} {grade.label}</span>
            {nextGrade && (
              <span className="text-xs text-gray-500">다음: {nextGrade.emoji} {nextGrade.label}</span>
            )}
          </div>
          {nextGrade ? (
            <>
              <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
              </div>
              <p className="text-[11px] text-gray-500">
                {nextGrade.label}까지 {nextGrade.minJobs - completedJobs}건 남음 ({completedJobs}/{nextGrade.minJobs}건)
              </p>
            </>
          ) : (
            <p className="text-[11px] text-gray-500">최고 등급 달성! 총 {completedJobs}건 완료</p>
          )}
        </div>

        {/* 현재 혜택 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">현재 등급 혜택</h3>
          <div className="space-y-2">
            {grade.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
          {grade.feeDiscount > 0 && (
            <div className="mt-3 bg-green-50 rounded-lg p-2.5 text-center">
              <span className="text-sm font-bold text-green-700">등급 혜택 적용 중</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-3 flex justify-between">
            <span className="text-sm text-gray-500">전화번호</span>
            <span className="text-sm text-gray-400">관리자만 열람 가능</span>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <span className="text-sm text-gray-500">경력</span>
            <span className="text-sm text-gray-800 font-medium">{profile.experience ? expLabels[profile.experience] : '미등록'}</span>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <span className="text-sm text-gray-500">완료 건수</span>
            <span className="text-sm text-gray-800 font-medium">{completedJobs}건</span>
          </div>
        </div>

        {/* 자기소개 */}
        {profile.intro && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">자기소개</h3>
            <p className="text-sm text-gray-600">{profile.intro}</p>
          </div>
        )}

        {/* 전체 등급 안내 */}
        <button
          onClick={() => setShowAllGrades(!showAllGrades)}
          className="w-full text-center text-sm text-green-600 font-medium py-2"
        >
          {showAllGrades ? '등급 안내 접기' : '전체 등급 안내 보기'}
        </button>

        {showAllGrades && (
          <div className="space-y-3">
            {GRADES.map((g) => {
              const isCurrent = g.key === grade.key;
              return (
                <div key={g.key} className={`rounded-xl p-4 border ${isCurrent ? `${g.borderColor} ${g.bgColor} ring-2 ring-green-400` : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${g.color}`}>{g.emoji} {g.label}</span>
                    <span className="text-xs text-gray-400">{g.minJobs}건 이상</span>
                  </div>
                  <div className="space-y-1">
                    {g.benefits.map((b, i) => (
                      <p key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-green-500">-</span> {b}
                      </p>
                    ))}
                  </div>
                  {isCurrent && (
                    <span className="inline-block mt-2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">현재 등급</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
