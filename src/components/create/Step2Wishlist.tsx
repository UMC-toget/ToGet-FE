import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Trash2, ImagePlus, Gift } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import { MOCK_WISH_ITEMS } from '../../utils/wishData';
import type { WishCategory } from '../../utils/wishData';
import ImageCropper from './ImageCropper';

interface Props {
  onNext: () => void;
}

type View = 'list' | 'add';

interface AddFormState {
  name: string;
  price: string;
  link: string;
}

const emptyForm: AddFormState = { name: '', price: '', link: '' };

export default function Step2Wishlist({ onNext }: Props) {
  const { wishlist, addWishlistItem, removeWishlistItem } = useFundingCreateStore();
  const [view, setView] = useState<View>('list');

  // 새 선물 등록 폼
  const [form, setForm] = useState<AddFormState>(emptyForm);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [nameError, setNameError] = useState(false);
  const [priceError, setPriceError] = useState(false);

  // 위시 불러오기 바텀시트
  const [showWishSheet, setShowWishSheet] = useState(false);
  const [wishQuery, setWishQuery] = useState('');
  const [wishTab, setWishTab] = useState<'all' | WishCategory>('all');
  const [selectedWishIds, setSelectedWishIds] = useState<Set<string>>(new Set());

  const totalAmount = wishlist.reduce((sum, item) => sum + item.price, 0);
  const isFormValid = Boolean(form.name.trim() && Number(form.price) > 0);

  const handleAdd = () => {
    const hasNameErr = !form.name.trim();
    const hasPriceErr = !(Number(form.price) > 0);
    setNameError(hasNameErr);
    setPriceError(hasPriceErr);
    if (hasNameErr || hasPriceErr) return;

    addWishlistItem({
      id: crypto.randomUUID(),
      name: form.name,
      price: Number(form.price),
      link: form.link || undefined,
      imageUrl: formImage ? URL.createObjectURL(formImage) : undefined,
    });
    setForm(emptyForm);
    setFormImage(null);
    setNameError(false);
    setPriceError(false);
    setView('list');
  };

  const filteredWishItems = MOCK_WISH_ITEMS.filter((item) => {
    if (wishTab !== 'all' && item.category !== wishTab) return false;
    if (wishQuery && !item.name.includes(wishQuery) && !item.brand.includes(wishQuery)) return false;
    return true;
  });

  const toggleWishSelect = (id: string) => {
    setSelectedWishIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeWishSheet = () => {
    setShowWishSheet(false);
    setSelectedWishIds(new Set());
    setWishQuery('');
    setWishTab('all');
  };

  const confirmWishImport = () => {
    selectedWishIds.forEach((id) => {
      const item = MOCK_WISH_ITEMS.find((w) => w.id === id);
      if (!item) return;
      addWishlistItem({
        id: crypto.randomUUID(),
        name: item.name,
        price: item.price,
      });
    });
    closeWishSheet();
  };

  // ── 새 선물 등록 화면 ──────────────────────────────────────
  if (view === 'add') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setView('list')} className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-base font-bold text-gray-900">새로운 선물 등록하기</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <p className="text-xs text-gray-400">받고 싶은 선물을 등록해 주세요</p>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">선물 이름 *</label>
            <input
              type="text"
              placeholder="받고 싶은 선물 이름을 입력해주세요"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors
                ${nameError ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50 focus:border-gray-800 focus:bg-white'}`}
            />
            {nameError && <p className="text-xs text-red-400 mt-1">▲ 선물 이름을 입력해 주세요</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">가격 *</label>
            <div className="relative">
              <input
                type="number"
                placeholder="선물 가격을 입력해주세요"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none border transition-colors
                  ${priceError ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50 focus:border-gray-800 focus:bg-white'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
            {priceError && <p className="text-xs text-red-400 mt-1">▲ 가격을 입력해 주세요</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">선물 구매처 링크</label>
            <input
              type="url"
              placeholder="구매 가능한 링크를 입력해주세요"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-gray-50 border border-transparent focus:border-gray-800 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">상품 이미지</label>
            {formImage ? (
              <div className="relative w-24 h-24">
                <img src={URL.createObjectURL(formImage)} alt="상품 이미지" className="w-24 h-24 object-cover rounded-xl" />
                <button
                  onClick={() => setFormImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-xl text-gray-300 cursor-pointer border border-gray-100">
                <ImagePlus size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPendingCropFile(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!isFormValid}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          등록하기
        </button>

        {pendingCropFile && (
          <ImageCropper
            file={pendingCropFile}
            aspectRatio={1}
            onCancel={() => setPendingCropFile(null)}
            onConfirm={(croppedFile) => {
              setFormImage(croppedFile);
              setPendingCropFile(null);
            }}
          />
        )}
      </div>
    );
  }

  // ── 목록 화면 ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">받고 싶은 선물을 등록해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">여러 선물을 담을 수 있고, 입력한 금액으로 총액이 계산돼요</p>
        </div>

        <button
          onClick={() => setView('add')}
          className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">+</span> 새로운 선물 등록하기
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        <button
          onClick={() => setShowWishSheet(true)}
          className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Gift size={16} className="text-gray-400" /> 위시 불러오기
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        {wishlist.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">등록된 {wishlist.length}개 상품</p>
              <p className="text-xs font-semibold text-gray-700">총 {totalAmount.toLocaleString()}원</p>
            </div>
            {wishlist.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    상품
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.price.toLocaleString()}원</p>
                </div>
                <button onClick={() => removeWishlistItem(item.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={wishlist.length === 0}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        다음
      </button>

      {/* 위시 불러오기 바텀시트 */}
      {showWishSheet && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={closeWishSheet}>
          <div
            className="bg-white w-full max-w-sm mx-auto rounded-t-2xl p-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

            <div className="relative mb-3">
              <input
                autoFocus
                type="text"
                value={wishQuery}
                onChange={(e) => setWishQuery(e.target.value)}
                placeholder="상품 이름을 검색해보세요"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-gray-800 transition-colors"
              />
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex gap-2 mb-3">
              {(
                [
                  { key: 'all', label: '전체' },
                  { key: 'received', label: '받고 싶은' },
                  { key: 'given', label: '주고 싶은' },
                ] as { key: 'all' | WishCategory; label: string }[]
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setWishTab(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                    ${wishTab === t.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-2">선물 {filteredWishItems.length}개</p>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-2">
              {filteredWishItems.map((item) => {
                const selected = selectedWishIds.has(item.id);
                return (
                  <button key={item.id} onClick={() => toggleWishSelect(item.id)} className="text-left">
                    <div className="relative">
                      <div className="w-full aspect-square rounded-xl" style={{ background: item.color }} />
                      <span
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${selected ? 'bg-gray-900 text-white' : 'bg-white/80 text-gray-500'}`}
                      >
                        {selected ? '✓' : '+'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">{item.brand}</p>
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.price.toLocaleString()}원</p>
                  </button>
                );
              })}
              {filteredWishItems.length === 0 && (
                <p className="col-span-2 text-xs text-gray-400 text-center py-8">검색 결과가 없어요</p>
              )}
            </div>

            <button
              onClick={confirmWishImport}
              disabled={selectedWishIds.size === 0}
              className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedWishIds.size > 0 ? `${selectedWishIds.size}개 상품 등록하기` : '상품을 선택해주세요'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}