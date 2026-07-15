import React, { useState, useMemo } from 'react';
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
// Category selector (with image icons)
// ---------------------------------------------------------------------------

const ALL_CATEGORIES: CleaningCategory[] = ['home', 'office', 'store', 'move', 'appliance', 'other'];

// 이미지가 있는 카테고리는 이미지 사용, 없으면 이모지 폴백
const CATEGORY_IMAGE: Partial<Record<CleaningCategory, string>> = {
  home: '/icon-home.png',
  office: '/icon-office.png',
  store: '/icon-store.png',
  move: '/icon-move.png',
  appliance: '/icon-appliance.png',
};

function CategoryIcon({ cat, size = 'normal' }: { cat: CleaningCategory; size?: 'normal' | 'small' }) {
  const imgSrc = CATEGORY_IMAGE[cat];
  const imgClass = size === 'small' ? 'w-5 h-5' : 'w-10 h-10';
  const emojiClass = size === 'small' ? 'text-base' : 'text-2xl';

  if (imgSrc) {
    return <img src={imgSrc} alt={CATEGORY_LABELS[cat]} className={`${imgClass} object-contain`} />;
  }
  return <span className={emojiClass}>{CATEGORY_ICONS[cat]}</span>;
}

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
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm ${
              selected === cat
                ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            <CategoryIcon cat={cat} />
            <span>{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 기타 서브옵션 선택
// ---------------------------------------------------------------------------

const OTHER_SUB_OPTIONS = [
  { key: 'dishes', label: '설거지', icon: '🍽️' },
  { key: 'fridge', label: '냉장고 청소', icon: '🧊' },
  { key: 'laundry', label: '빨래/다림질', icon: '👕' },
  { key: 'window', label: '창문/유리', icon: '🪟' },
  { key: 'bathroom_deep', label: '욕실 특수청소', icon: '🚿' },
  { key: 'organize', label: '정리정돈', icon: '📦' },
  { key: 'other_custom', label: '기타 (직접입력)', icon: '✏️' },
];

function OtherSubSelector({
  selected,
  onSelect,
  customText,
  onCustomTextChange,
}: {
  selected: string[];
  onSelect: (items: string[]) => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
}) {
  const toggleItem = (key: string) => {
    if (selected.includes(key)) {
      onSelect(selected.filter((k) => k !== key));
    } else {
      onSelect([...selected, key]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        세부 항목 선택 <span className="text-xs text-gray-400 font-normal">(복수 선택 가능)</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {OTHER_SUB_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggleItem(opt.key)}
            className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 transition-all text-sm text-left ${
              selected.includes(opt.key)
                ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            <span className="text-lg shrink-0">{opt.icon}</span>
            <span className="truncate">{opt.label}</span>
            {selected.includes(opt.key) && (
              <svg className="w-4 h-4 ml-auto text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
      {selected.includes('other_custom') && (
        <input
          type="text"
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder="청소 내용을 입력하세요"
          className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Space composition selector (for home cleaning)
// ---------------------------------------------------------------------------

interface SpaceConfig {
  rooms: number;
  livingRooms: number;
  bathrooms: number;
  kitchens: number;
  verandas: number;
}

const SPACE_ITEMS: { key: keyof SpaceConfig; label: string; icon: string; max: number }[] = [
  { key: 'rooms', label: '방', icon: '🛏️', max: 6 },
  { key: 'livingRooms', label: '거실', icon: '🛋️', max: 3 },
  { key: 'bathrooms', label: '화장실', icon: '🚿', max: 4 },
  { key: 'kitchens', label: '주방', icon: '🍳', max: 2 },
  { key: 'verandas', label: '베란다', icon: '🌿', max: 3 },
];

const PRICE_PER = {
  rooms: 15000,
  livingRooms: 20000,
  bathrooms: 18000,
  kitchens: 15000,
  verandas: 10000,
  base: 30000,
};

const CATEGORY_BASE_PRICE: Record<CleaningCategory, number> = {
  home: 0,
  office: 0,
  store: 0,
  move: 200000,
  appliance: 50000,
  other: 100000,
};

const PRICE_PER_PYEONG: Record<string, number> = {
  office: 5000,
  store: 5500,
};
const AREA_BASE: Record<string, number> = {
  office: 50000,
  store: 50000,
};

// 기타 서브옵션별 가격
const OTHER_SUB_PRICES: Record<string, number> = {
  dishes: 30000,
  fridge: 50000,
  laundry: 40000,
  window: 40000,
  bathroom_deep: 60000,
  organize: 50000,
  other_custom: 50000,
};

// 평수 입력 컴포넌트
function AreaInput({
  value,
  onChange,
  category,
}: {
  value: number;
  onChange: (v: number) => void;
  category: string;
}) {
  const label = category === 'office' ? '사무실 면적' : '매장 면적';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <span className="text-lg">📐</span>
        <input
          type="number"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          placeholder="평수 입력"
          className="flex-1 text-sm focus:outline-none"
        />
        <span className="text-sm text-gray-400">평</span>
      </div>
      <div className="flex gap-2 mt-2">
        {[10, 20, 30, 50, 100].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              value === p
                ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                : 'border-gray-200 text-gray-500 active:bg-gray-100'
            }`}
          >
            {p}평
          </button>
        ))}
      </div>
    </div>
  );
}

function SpaceSelector({
  config,
  onChange,
}: {
  config: SpaceConfig;
  onChange: (config: SpaceConfig) => void;
}) {
  const adjust = (key: keyof SpaceConfig, delta: number) => {
    const item = SPACE_ITEMS.find((s) => s.key === key)!;
    const next = Math.max(0, Math.min(item.max, config[key] + delta));
    onChange({ ...config, [key]: next });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">공간 구성</label>
      <div className="space-y-2">
        {SPACE_ITEMS.map(({ key, label, icon }) => (
          <div
            key={key}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjust(key, -1)}
                disabled={config[key] === 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:text-gray-200 disabled:border-gray-200 active:bg-gray-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span className="w-6 text-center text-sm font-bold text-gray-800">{config[key]}</span>
              <button
                type="button"
                onClick={() => adjust(key, 1)}
                className="w-8 h-8 rounded-full border border-green-400 flex items-center justify-center text-green-500 active:bg-green-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Price guide
// ---------------------------------------------------------------------------

function PriceGuide({
  category,
  spaceConfig,
  areaPyeong,
  otherSubs,
  price,
  onPriceChange,
}: {
  category: CleaningCategory;
  spaceConfig: SpaceConfig;
  areaPyeong: number;
  otherSubs: string[];
  price: number;
  onPriceChange: (price: number) => void;
}) {
  const guidePrice = useMemo(() => {
    if (category === 'home') {
      return (
        PRICE_PER.base +
        spaceConfig.rooms * PRICE_PER.rooms +
        spaceConfig.livingRooms * PRICE_PER.livingRooms +
        spaceConfig.bathrooms * PRICE_PER.bathrooms +
        spaceConfig.kitchens * PRICE_PER.kitchens +
        spaceConfig.verandas * PRICE_PER.verandas
      );
    }
    if ((category === 'office' || category === 'store') && areaPyeong > 0) {
      return (AREA_BASE[category] || 50000) + areaPyeong * (PRICE_PER_PYEONG[category] || 5000);
    }
    if (category === 'other' && otherSubs.length > 0) {
      return otherSubs.reduce((sum, key) => sum + (OTHER_SUB_PRICES[key] || 50000), 0);
    }
    return CATEGORY_BASE_PRICE[category];
  }, [category, spaceConfig, areaPyeong, otherSubs]);

  const diff = price - guidePrice;
  const diffLabel =
    diff > 0
      ? `가이드보다 +${diff.toLocaleString('ko-KR')}원`
      : diff < 0
      ? `가이드보다 ${diff.toLocaleString('ko-KR')}원`
      : '가이드 금액과 동일';

  const adjust = (amount: number) => {
    const next = Math.max(10000, price + amount);
    onPriceChange(next);
  };

  const useGuide = () => onPriceChange(guidePrice);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">희망 가격</label>

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-green-600 font-medium">예상 가이드 금액</p>
            <p className="text-lg font-bold text-green-700">
              {guidePrice.toLocaleString('ko-KR')}원
            </p>
          </div>
          <button
            type="button"
            onClick={useGuide}
            className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg active:bg-green-600"
          >
            이 금액으로
          </button>
        </div>
        {category === 'home' && (
          <p className="text-[11px] text-green-500 mt-1">
            기본료 {PRICE_PER.base.toLocaleString()}원 + 공간 구성 기반 산출
          </p>
        )}
        {(category === 'office' || category === 'store') && (
          <p className="text-[11px] text-green-500 mt-1">
            기본료 {(AREA_BASE[category] || 50000).toLocaleString()}원 + {areaPyeong}평 × {(PRICE_PER_PYEONG[category] || 5000).toLocaleString()}원
          </p>
        )}
        {category === 'other' && otherSubs.length > 0 && (
          <p className="text-[11px] text-green-500 mt-1">
            선택 항목 {otherSubs.length}개 기반 산출
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => adjust(-10000)}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 active:bg-gray-100 text-lg font-bold"
          >
            -
          </button>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {price.toLocaleString('ko-KR')}
            </p>
            <p className="text-xs text-gray-400">원</p>
          </div>
          <button
            type="button"
            onClick={() => adjust(10000)}
            className="w-10 h-10 rounded-full border-2 border-green-400 flex items-center justify-center text-green-500 active:bg-green-50 text-lg font-bold"
          >
            +
          </button>
        </div>
        <p className={`text-center text-xs ${diff < 0 ? 'text-red-400' : diff > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
          {diffLabel}
        </p>
        <div className="flex justify-center gap-2 mt-2">
          {[-30000, -10000, 10000, 30000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => adjust(amt)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 active:bg-gray-100"
            >
              {amt > 0 ? '+' : ''}{(amt / 10000).toFixed(0)}만
            </button>
          ))}
        </div>
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
              <button type="button" onClick={() => removeArea(area)} className="text-xs text-red-400 hover:text-red-600">
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
                <input type="file" accept="image/*" className="hidden" onChange={handleFile(area)} />
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
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig>({
    rooms: 2,
    livingRooms: 1,
    bathrooms: 1,
    kitchens: 1,
    verandas: 1,
  });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [price, setPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [area, setArea] = useState(20);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [otherSubs, setOtherSubs] = useState<string[]>([]);
  const [otherCustomText, setOtherCustomText] = useState('');

  const handleCategorySelect = (cat: CleaningCategory) => {
    setCategory(cat);
    if (cat !== 'other') {
      setOtherSubs([]);
      setOtherCustomText('');
    }
    if (!priceInitialized) {
      if (cat === 'home') {
        const guide =
          PRICE_PER.base +
          spaceConfig.rooms * PRICE_PER.rooms +
          spaceConfig.livingRooms * PRICE_PER.livingRooms +
          spaceConfig.bathrooms * PRICE_PER.bathrooms +
          spaceConfig.kitchens * PRICE_PER.kitchens +
          spaceConfig.verandas * PRICE_PER.verandas;
        setPrice(guide);
      } else if (cat === 'office' || cat === 'store') {
        const guide = (AREA_BASE[cat] || 50000) + area * (PRICE_PER_PYEONG[cat] || 5000);
        setPrice(guide);
      } else {
        setPrice(CATEGORY_BASE_PRICE[cat]);
      }
      setPriceInitialized(true);
    }
  };

  const handleOtherSubsChange = (subs: string[]) => {
    setOtherSubs(subs);
    if (subs.length > 0) {
      const total = subs.reduce((sum, key) => sum + (OTHER_SUB_PRICES[key] || 50000), 0);
      setPrice(total);
    } else {
      setPrice(CATEGORY_BASE_PRICE['other']);
    }
  };

  const handleSpaceChange = (config: SpaceConfig) => {
    setSpaceConfig(config);
    if (category === 'home') {
      const guide =
        PRICE_PER.base +
        config.rooms * PRICE_PER.rooms +
        config.livingRooms * PRICE_PER.livingRooms +
        config.bathrooms * PRICE_PER.bathrooms +
        config.kitchens * PRICE_PER.kitchens +
        config.verandas * PRICE_PER.verandas;
      setPrice(guide);
    }
  };

  const handleAreaChange = (newArea: number) => {
    setArea(newArea);
    if (category === 'office' || category === 'store') {
      const guide = (AREA_BASE[category] || 50000) + newArea * (PRICE_PER_PYEONG[category] || 5000);
      setPrice(guide);
    }
  };

  const spaceLabel = category === 'home'
    ? `방 ${spaceConfig.rooms} / 거실 ${spaceConfig.livingRooms} / 화장실 ${spaceConfig.bathrooms} / 주방 ${spaceConfig.kitchens} / 베란다 ${spaceConfig.verandas}`
    : '';

  const otherSubsLabel = otherSubs.map((key) => {
    if (key === 'other_custom') return otherCustomText || '기타';
    const opt = OTHER_SUB_OPTIONS.find((o) => o.key === key);
    return opt ? opt.label : key;
  }).join(', ');

  const openAddressSearch = () => {
    const daum = (window as any).daum;
    if (!daum?.Postcode) return;
    new daum.Postcode({
      oncomplete: (data: any) => {
        setAddress(data.roadAddress || data.jibunAddress);
      },
    }).open();
  };

  const fullAddress = addressDetail ? `${address} ${addressDetail}` : address;
  const step1Valid = category && date && time && address && price > 0;

  const handleSubmit = () => {
    if (!category) return;
    let notesWithInfo = notes;
    if (category === 'home') {
      notesWithInfo = `[공간] ${spaceLabel}\n${notes}`.trim();
    } else if (category === 'office' || category === 'store') {
      notesWithInfo = `[면적] ${area}평\n${notes}`.trim();
    } else if (category === 'other' && otherSubs.length > 0) {
      notesWithInfo = `[기타 항목] ${otherSubsLabel}\n${notes}`.trim();
    }

    const request: CleaningRequest = {
      id: api.generateId(),
      clientId: 'user-1',
      category,
      date,
      time,
      address: fullAddress,
      price,
      notes: notesWithInfo,
      photos,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    api.saveRequest(request);
    navigate('/clean/client');
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
            <CategorySelector selected={category} onSelect={handleCategorySelect} />

            {category === 'home' && (
              <SpaceSelector config={spaceConfig} onChange={handleSpaceChange} />
            )}

            {(category === 'office' || category === 'store') && (
              <AreaInput value={area} onChange={handleAreaChange} category={category} />
            )}

            {category === 'other' && (
              <OtherSubSelector
                selected={otherSubs}
                onSelect={handleOtherSubsChange}
                customText={otherCustomText}
                onCustomTextChange={setOtherCustomText}
              />
            )}

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
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={address}
                  readOnly
                  placeholder="주소를 검색하세요"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50 cursor-pointer"
                  onClick={openAddressSearch}
                />
                <button
                  type="button"
                  onClick={openAddressSearch}
                  className="px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg whitespace-nowrap active:bg-green-600"
                >
                  검색
                </button>
              </div>
              {address && (
                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="상세 주소 입력 (동/호수)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
            </div>

            {category && (
              <PriceGuide
                category={category}
                spaceConfig={spaceConfig}
                areaPyeong={area}
                otherSubs={otherSubs}
                price={price}
                onPriceChange={setPrice}
              />
            )}

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
                <span className="text-gray-800 font-medium flex items-center gap-1.5">
                  {category && <CategoryIcon cat={category} size="small" />}
                  {category && CATEGORY_LABELS[category]}
                </span>
                {category === 'home' && (
                  <>
                    <span className="text-gray-500">공간 구성</span>
                    <span className="text-gray-800 font-medium text-xs">{spaceLabel}</span>
                  </>
                )}
                {(category === 'office' || category === 'store') && (
                  <>
                    <span className="text-gray-500">면적</span>
                    <span className="text-gray-800 font-medium">{area}평</span>
                  </>
                )}
                {category === 'other' && otherSubs.length > 0 && (
                  <>
                    <span className="text-gray-500">세부 항목</span>
                    <span className="text-gray-800 font-medium text-xs">{otherSubsLabel}</span>
                  </>
                )}
                <span className="text-gray-500">날짜</span>
                <span className="text-gray-800 font-medium">{date}</span>
                <span className="text-gray-500">시간</span>
                <span className="text-gray-800 font-medium">{time}</span>
                <span className="text-gray-500">주소</span>
                <span className="text-gray-800 font-medium col-span-1 truncate">{fullAddress}</span>
                <span className="text-gray-500">희망 가격</span>
                <span className="text-green-600 font-bold">{price.toLocaleString('ko-KR')}원</span>
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
