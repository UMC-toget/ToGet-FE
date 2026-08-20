import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Search, X, Gift } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import { useWishedProducts } from '../../pages/wish/hooks/useWishedProducts';
import type { WishType } from '../../store/wishStore';
import PhotoActionSheet from '../common/PhotoActionSheet';
import Header from '../common/Header';
import { sanitizePurchaseUrl } from '../../utils/sanitizePurchaseUrl';

interface Props {
  onNext: () => void;
  submitLabel?: string;
  disabled?: boolean;
  /** "새로운 선물 등록하기" 같은 서브 화면으로 전환됐는지 알려줌 — 부모가 자기 Header/StepIndicator를 숨길 때 씀 */
  onSubViewChange?: (isSubView: boolean) => void;
}

type View = 'list' | 'add';

const SORT_OPTIONS = [
  { key: 'latest', label: '최신순' },
  { key: 'priceAsc', label: '낮은 가격순' },
  { key: 'priceDesc', label: '높은 가격순' },
] as const;
type SortOrder = (typeof SORT_OPTIONS)[number]['key'];

interface AddFormState {
  name: string;
  price: string;
  link: string;
}

const emptyForm: AddFormState = { name: '', price: '', link: '' };
const NAME_MAX = 20;

export default function Step2Wishlist({ onNext, submitLabel = '다음', disabled = false, onSubViewChange }: Props) {
  const navigate = useNavigate();
  const { wishlist, addWishlistItem, updateWishlistItem, removeWishlistItem } = useFundingCreateStore();
  const [view, setView] = useState<View>('list');

  useEffect(() => {
    onSubViewChange?.(view === 'add');
    return () => onSubViewChange?.(false);
  }, [view, onSubViewChange]);

  // 새 선물 등록 폼
  const [form, setForm] = useState<AddFormState>(emptyForm);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [priceError, setPriceError] = useState(false);

  // 위시 불러오기 바텀시트
  const [showWishSheet, setShowWishSheet] = useState(false);
  const [wishQuery, setWishQuery] = useState('');
  const [wishTab, setWishTab] = useState<'all' | WishType>('all');
  const [selectedWishIds, setSelectedWishIds] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { wishedProducts, isLoading: isWishLoading } = useWishedProducts(wishTab, 'latest');

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
      imageFile: formImage ?? undefined,
    });
    setForm(emptyForm);
    setFormImage(null);
    setNameError(false);
    setPriceError(false);
    setView('list');
  };

  const filteredWishItems = wishedProducts.filter((item) => {
    if (wishQuery && !item.name.includes(wishQuery) && !item.brand.includes(wishQuery)) return false;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'priceAsc') return a.price - b.price;
    if (sortOrder === 'priceDesc') return b.price - a.price;
    return 0; // 최신순: 서버가 이미 LATEST 정렬로 내려준 순서를 그대로 사용
  });

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortOrder)?.label ?? '최신순';

  const toggleWishSelect = (id: number) => {
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
    setSortOrder('latest');
    setShowSortMenu(false);
  };

  const handleEditWishlist = () => {
    closeWishSheet();
    navigate('/wish');
  };

  const confirmWishImport = () => {
    selectedWishIds.forEach((id) => {
      const item = wishedProducts.find((w) => w.id === id);
      if (!item) return;
      addWishlistItem({
        id: crypto.randomUUID(),
        name: item.name,
        price: item.price,
        imageUrl: item.image,
      });
    });
    closeWishSheet();
  };

  // ── 새 선물 등록 화면 (독립된 페이지처럼 랜딩) ──────────────────
  if (view === 'add') {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="-mx-4">
          <Header title="새로운 선물 등록하기" onBack={() => setView('list')} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pt-4">
          <p className="text-xs text-gray-400">선물을 등록하면, 입력한 금액으로 총액이 계산돼요.</p>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              선물 이름 <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={NAME_MAX}
                placeholder="받고 싶은 선물 이름을 입력해 주세요"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, NAME_MAX) })}
                className={`w-full rounded-xl px-4 py-3 pr-16 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none border transition-colors
                  ${nameError ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-100/70 focus:border-gray-800 focus:bg-white'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                ({form.name.length}/{NAME_MAX})
              </span>
            </div>
            {nameError && <p className="text-xs text-red-400 mt-1">▲ 선물 이름을 입력해 주세요</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              선물 가격 <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="선물 가격을 입력해 주세요"
                value={form.price ? Number(form.price).toLocaleString() : ''}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) })}
                className={`w-full rounded-xl px-4 py-3 pr-12 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none border transition-colors
                  ${priceError ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-100/70 focus:border-gray-800 focus:bg-white'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">(원)</span>
            </div>
            {priceError && <p className="text-xs text-red-400 mt-1">▲ 가격을 입력해 주세요</p>}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">선물 구매처 링크</label>
            <input
              type="url"
              placeholder="구매 가능한 링크를 입력해 주세요"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: sanitizePurchaseUrl(e.target.value) })}
              className="w-full rounded-xl px-4 py-3 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none bg-gray-100/70 border border-transparent focus:border-gray-800 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">선물 이미지</label>
            {formImage ? (
              <div className="relative w-24 h-24">
                <img src={URL.createObjectURL(formImage)} alt="선물 이미지" className="w-24 h-24 object-cover rounded-xl" />
                <button
                  onClick={() => setFormImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhotoSheet(true)}
                className="w-24 h-24 flex items-center justify-center bg-gray-100/70 rounded-xl text-gray-400"
              >
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg leading-none">
                  +
                </span>
              </button>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!isFormValid}
            className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            등록하기
          </button>
        </div>

        {showPhotoSheet && (
          <PhotoActionSheet
            aspectRatio={1}
            onClose={() => setShowPhotoSheet(false)}
            onSelect={(file) => {
              setFormImage(file);
              setShowPhotoSheet(false);
            }}
          />
        )}
      </div>
    );
  }

  // ── 목록 화면 ──────────────────────────────────────────────
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="space-y-5 pb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">받고 싶은 선물을 등록해 주세요</h2>
            <p className="text-xs text-gray-400 mt-1">여러 선물을 담을 수 있고, 입력한 금액으로 총액이 계산돼요</p>
          </div>

          <button
            onClick={() => setView('add')}
            className="w-full flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg text-gray-500 shrink-0">
                +
              </span>
              <span className="text-left">새로운 선물 등록하기</span>
            </span>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </button>

          <button
            onClick={() => setShowWishSheet(true)}
            className="w-full flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <Gift size={16} />
              </span>
              <span className="text-left">위시 불러오기</span>
            </span>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </button>
        </div>

        {wishlist.length > 0 && (
          <div className="flex-1 -mx-4.5 bg-background px-4.5 pb-6">
            <div className="px-3">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-background pb-5 pt-5">
                <p className="text-sm font-medium text-black">등록된 {wishlist.length}개 상품</p>
                <p className="text-sm font-semibold text-pink-500">총 {totalAmount.toLocaleString()}원</p>
              </div>
              <div className="space-y-2">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#F5F4F5]/50">
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-full object-cover"
                            onError={() => updateWishlistItem(item.id, { imageUrl: undefined, imageFile: undefined })}
                          />
                          <button
                            type="button"
                            aria-label={`${item.name} 이미지 삭제`}
                            onClick={() => updateWishlistItem(item.id, { imageUrl: undefined, imageFile: undefined })}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white"
                          >
                            <X size={16} className="rounded-full bg-white/80 p-0.5 text-gray-600" />
                          </button>
                        </>
                      ) : (
                        <label className="flex size-full cursor-pointer items-center justify-center text-gray-400">
                          <span className="flex size-5 items-center justify-center rounded-full bg-gray-200 text-sm">+</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              updateWishlistItem(item.id, { imageUrl: URL.createObjectURL(file), imageFile: file });
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.price.toLocaleString()}원</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`${item.name} 선물 삭제`}
                      onClick={() => removeWishlistItem(item.id)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={wishlist.length === 0 || disabled}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>

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
                className="w-full rounded-xl px-4 py-3 pr-10 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none bg-gray-100 border border-transparent focus:border-gray-800 focus:bg-white transition-colors"
              />
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex gap-2 mb-3">
              {(
                [
                  { key: 'all', label: '전체' },
                  { key: 'receive', label: '받고 싶은' },
                  { key: 'give', label: '주고 싶은' },
                ] as { key: 'all' | WishType; label: string }[]
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setWishTab(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${wishTab === t.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">선물 {filteredWishItems.length}개</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSortMenu((prev) => !prev)}
                  className="flex items-center gap-0.5 text-xs text-black font-medium"
                >
                  {currentSortLabel} <ChevronDown size={12} />
                </button>
                <button type="button" onClick={handleEditWishlist} className="text-xs text-black font-medium">
                  편집
                </button>
              </div>

              {showSortMenu && (
                <>
                  <button
                    type="button"
                    aria-label="정렬 메뉴 닫기"
                    onClick={() => setShowSortMenu(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 top-6 z-40 w-28 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setSortOrder(option.key);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors
                          ${sortOrder === option.key ? 'text-black font-semibold bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-2">
              {!isWishLoading && filteredWishItems.map((item) => {
                const selected = selectedWishIds.has(item.id);
                return (
                  <button key={item.id} onClick={() => toggleWishSelect(item.id)} className="text-left">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                      <Gift className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="absolute inset-0 size-full object-contain p-3"
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                        />
                      )}
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
              {isWishLoading && (
                <p className="col-span-2 text-xs text-gray-400 text-center py-8">위시를 불러오는 중이에요</p>
              )}
              {!isWishLoading && filteredWishItems.length === 0 && (
                <p className="col-span-2 text-xs text-gray-400 text-center py-8">
                  {wishQuery || wishTab !== 'all' ? '검색 결과가 없어요' : '등록된 위시가 없어요'}
                </p>
              )}
            </div>

            <button
              onClick={confirmWishImport}
              disabled={selectedWishIds.size === 0}
              className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {selectedWishIds.size > 0 ? `${selectedWishIds.size}개 상품 등록하기` : '상품을 선택해주세요'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
