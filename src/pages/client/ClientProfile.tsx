import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../store';

export default function ClientProfile() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = api.getClientProfile();
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setAddress(profile.address);
      setPhoto(profile.photo);
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 사진만 등록 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    api.saveClientProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      photo,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/[^0-9]/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">프로필 편집</h1>
      </header>

      {/* 프로필 사진 */}
      <section className="bg-white mt-2 py-6 flex flex-col items-center">
        <div className="relative">
          {photo ? (
            <img src={photo} alt="프로필" className="w-24 h-24 rounded-full object-cover border-2 border-green-400" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md active:bg-green-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>
        <p className="text-xs text-gray-400 mt-2">사진을 탭하여 변경</p>
      </section>

      {/* 정보 입력 */}
      <section className="bg-white mt-2 px-4 py-4 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-300 border border-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">연락처</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            maxLength={13}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-300 border border-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">기본 주소</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="청소 의뢰 시 기본으로 사용될 주소"
            maxLength={100}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-300 border border-gray-200"
          />
          <p className="text-[11px] text-gray-400 mt-1">의뢰 작성 시 자동으로 입력됩니다</p>
        </div>
      </section>

      {/* 계정 정보 */}
      <section className="bg-white mt-2 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">계정 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">이메일</span>
            <span className="text-gray-400">로그인 후 표시</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">가입일</span>
            <span className="text-gray-400">로그인 후 표시</span>
          </div>
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-50">
        <button
          onClick={handleSave}
          className={`w-full py-4 font-bold rounded-xl text-base transition-colors ${
            saved
              ? 'bg-green-100 text-green-600'
              : 'bg-green-500 text-white active:bg-green-600'
          }`}
        >
          {saved ? '저장되었습니다 ✓' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
