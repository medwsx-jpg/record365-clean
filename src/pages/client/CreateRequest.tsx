import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CleaningRequest, Photo, CleaningCategory } from '../../types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types';
import { api } from '../../store';

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEP_LABELS = ['기본 정보', '사진 등록', '최종 확인'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i <= current
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[10px] mt-1 ${
                i <= current ? 'text-green-600 font-medium' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`w-10 h-0.5 mb-4 ${
                i < current ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category selector
// ---------------------------------------------------------------------------

const ALL_CATEGORIES: CleaningCategory[] = ['home', 'office', 'store', 'move', 'appliance', 'other'];

function CategorySelector({
  selected,
  onSelect,
}: {
  selected: CleaningCategory | null;
  onSelect: (cat: CleaningCategory) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        청소 종류 선택
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-sm ${
              selected === cat
                ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
            <span>{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Free-form photo uploader
// ---------------------------------------------------------------------------

function FreePhotoUploader({
  photos,
  onPhotosChange,
}: {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}) {
  const [areas, setAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');

  const addArea = () => {
    const trimmed = newArea.trim();
    if (!trimmed || areas.includes(trimmed)) return;
    setAreas([...areas, trimmed]);
    setNewArea('');
  };

  const removeArea = (area: string) => {
    setAreas(areas.filter((a) => a !== area));
    onPhotosChange(photos.filter((p) => p.zone !== area));
  };

  const handleFile = (zone: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto: Photo = {
        id: api.generateId(),
        zone,
        dataUrl: reader.result as string,
        memo: '',
        type: 'before',
        createdAt: new Date().toISOString(),
      };
      onPhotosChange([...photos, newPhoto]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
          placeholder="예: 화장실, 주방, 베란다..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addArea}
          disabled={!newArea.trim()}
          className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          추가
        </button>
      </div>

      {areas.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <svg className="mx-auto mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm">중요하게 생각하는 구역을 추가하고</p>
          <p className="text-sm">해당 구역의 사진을 찍어주세요</p>
        </div>
      )}

      {areas.map((area) => {
        const areaPhotos = photos.filter((p) => p.zone === area);
        return (
          <div key={area} className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">{area}</h4>
              <button
                type="button"
                onClick={() => removeArea(area)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                구역 삭제
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {areaPhotos.map((photo) => (
                <div key={photo.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-[10px] mt-0.5">촬영</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile(area)}
                />
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CreateRequest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [category, setCategory] = useState<CleaningCategory | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const priceNum = parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
  const step1Valid = category && date && time && address && priceNum > 0;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPrice(raw);
  };

  const handleSubmit = () => {
    if (!category) return;
    const request: CleaningRequest = {
      id: api.generateId(),
      clientId: 'user-1',
      category,
      date,
      time,
      address,
      price: priceNum,
      notes,
      photos,
      status: 'matching',
      createdAt: new Date().toISOString(),
    };
    api.saveRequest(request);
    navigate(`/clean/client/matching/${request.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto">
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">새 청소 의뢰</h1>
      </header>

      <StepIndicator current={step} />

      <div className="px-4 pb-8">
        {step === 0 && (
          <div className="space-y-4">
            <CategorySelector selected={category} onSelect={setCategory} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜 선택</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시간 선택</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주소 입력</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="예: 서울시 강남구 역삼동 123-45" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">희망 가격</label>
              <div className="relative">
                <input type="text" inputMode="numeric" value={priceNum > 0 ? priceNum.toLocaleString('ko-KR') : ''} onChange={handlePriceChange} placeholder="50,000" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">추가 요청사항</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="청소 시 참고할 사항을 적어주세요" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
            </div>
            <button onClick={() => setStep(1)} disabled={!step1Valid} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors mt-2">다음</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">중요하게 생각하는 구역을 추가하고 사진을 등록해 주세요.</p>
            <FreePhotoUploader photos={photos} onPhotosChange={setPhotos} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl transition-colors">이전</button>
              <button onClick={() => setStep(2)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">다음</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">의뢰 요약</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">청소 종류</span>
                <span className="text-gray-800 font-medium">{category && `${CATEGORY_ICONS[category]} ${CATEGORY_LABELS[category]}`}</span>
                <span className="text-gray-500">날짜</span>
                <span className="text-gray-800 font-medium">{date}</span>
                <span className="text-gray-500">시간</span>
                <span className="text-gray-800 font-medium">{time}</span>
                <span className="text-gray-500">주소</span>
                <span className="text-gray-800 font-medium col-span-1 truncate">{address}</span>
                <span className="text-gray-500">희망 가격</span>
                <span className="text-green-600 font-bold">{priceNum.toLocaleString('ko-KR')}원</span>
              </div>
              {notes && (
                <div>
                  <span className="text-sm text-gray-500">요청사항</span>
                  <p className="text-sm text-gray-800 mt-0.5">{notes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">등록된 사진</h3>
              {photos.length === 0 ? (
                <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[...new Set(photos.map((p) => p.zone))].map((zone) => {
                      const count = photos.filter((p) => p.zone === zone).length;
                      return (
                        <span key={zone} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{zone} {count}장</span>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl transition-colors">이전</button>
              <button onClick={handleSubmit} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">의뢰 등록</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
