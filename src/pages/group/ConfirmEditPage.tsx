import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import BottomSheet from '../../components/common/BottomSheet'
import ConfirmModal from '../../components/common/ConfirmModal'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import GiftIcon from '../../components/icons/GiftIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import CheckIcon from '../../components/icons/CheckIcon'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import { useWishedProducts } from '../wish/hooks/useWishedProducts'
import type { WishType } from '../../store/wishStore'
import type { Product } from '../home/products'
import type { ConfirmedGift } from './ConfirmPage'

// 접근: 개설자 전용 | 선물 목록 수정하기 — ConfirmPage 3단계에서 "수정하기" 버튼으로 진입
export default function ConfirmEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const passedState = location.state as {
    confirmedGifts: ConfirmedGift[]
    step: number
    selectedGiftId: number | null
    includedMemberIds: number[]
  }

  const [gifts, setGifts] = useState<ConfirmedGift[]>(passedState?.confirmedGifts ?? [])
  const [showExitModal, setShowExitModal] = useState(false)

  // 선물 추가 플로우 (서버 등록 아님 — 로컬 목록에 append)
  const [addStep, setAddStep] = useState<null | 'select' | 'direct'>(null)
  const [showWishSheet, setShowWishSheet] = useState(false)
  const [wishSearch, setWishSearch] = useState('')
  const [wishFilter, setWishFilter] = useState<'all' | WishType>('all')
  const [selectedWishId, setSelectedWishId] = useState<number | null>(null)
  const [showOverflowToast, setShowOverflowToast] = useState(false)
  const [inputName, setInputName] = useState('')
  const [inputPrice, setInputPrice] = useState('')

  // 위시 불러오기 — dev 실 API(useWishedProducts). 받고/주고 필터는 훅에 tab으로 넘겨 서버에서 거른다
  const { wishedProducts } = useWishedProducts(wishFilter, 'latest')

  // 로컬 추가 항목 id — 서버 giftId(양수)와 겹치지 않게 음수로 발급
  const localIdRef = useRef(-1)

  const totalAmount = gifts.reduce((sum, g) => sum + g.price, 0)
  const parsedPrice = parseInt(inputPrice.replace(/[^0-9]/g, ''), 10)
  const directCanSubmit = inputName.trim().length > 0 && parsedPrice > 0

  const handleRemove = (giftId: number) => {
    setGifts(prev => prev.filter(g => g.id !== giftId))
  }

  const appendGift = (gift: Omit<ConfirmedGift, 'id'>) => {
    setGifts(prev => [...prev, { id: localIdRef.current--, ...gift }])
  }

  const closeAdd = () => {
    setAddStep(null)
    setInputName('')
    setInputPrice('')
  }

  const closeWishSheet = () => {
    setShowWishSheet(false)
    setWishSearch('')
    setWishFilter('all')
    setSelectedWishId(null)
    setShowOverflowToast(false)
  }

  const filteredWishItems = wishedProducts.filter(item => {
    const q = wishSearch.trim().toLowerCase()
    return q === '' || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q)
  })

  const handleWishToggle = (item: Product) => {
    if (selectedWishId === item.id) {
      setSelectedWishId(null)
    } else if (selectedWishId !== null) {
      setShowOverflowToast(true)
      setTimeout(() => setShowOverflowToast(false), 2000)
    } else {
      setSelectedWishId(item.id)
    }
  }

  const handleWishConfirm = () => {
    const item = wishedProducts.find(i => i.id === selectedWishId)
    if (!item) return
    appendGift({ name: item.name, price: item.price, imageUrl: item.image })
    closeWishSheet()
    closeAdd()
  }

  const handleDirectSubmit = () => {
    if (!directCanSubmit) return
    appendGift({ name: inputName.trim(), price: parsedPrice, imageUrl: null })
    closeAdd()
  }

  const handleComplete = () => {
    navigate(`/group/${id}/confirm`, {
      replace: true,
      state: { ...passedState, confirmedGifts: gifts },
    })
  }

  const handleBack = () => {
    setShowExitModal(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="선물 목록 수정하기" onBack={handleBack} />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 헤더 텍스트 */}
        <div className="px-[18px] pt-5">
          <p className="text-h3-sb text-black">기본 정보를 입력해 주세요</p>
          <p className="mt-2 text-caption1-r text-[#797378]">친구들에게 보여질 선물 페이지 정보를 작성해 주세요</p>
        </div>

        {/* 선물 추가하기 카드 */}
        <div className="px-[18px] pt-5 pb-5">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-[14px] py-3"
            onClick={() => setAddStep('select')}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gray-100">
              <PlusIcon className="size-5 text-black" />
            </div>
            <span className="flex-1 text-left text-b2-m text-black">선물 추가하기</span>
            <ChevronRightIcon className="size-6 shrink-0 text-black" />
          </button>
        </div>

        {/* 선물 목록 */}
        <div className="flex-1 bg-[#F5F4F5] px-[18px] pt-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-b1-m text-black">등록된 {gifts.length}개 상품</span>
            <span className="text-b1-m font-semibold text-pink-500">
              총 {totalAmount.toLocaleString()}원
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {gifts.map(gift => (
              <div
                key={gift.id}
                className="relative flex items-stretch gap-3 rounded-xl border border-gray-100 bg-white px-[14px] py-3"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-md bg-background">
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gray-100" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-[10px]">
                  <span
                    className="line-clamp-1 leading-normal text-[#191919]"
                    style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 500 }}
                  >
                    {gift.name}
                  </span>
                  <span className="text-caption1-r text-[#5B565A]">
                    {gift.price.toLocaleString()}원
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(gift.id)}
                  className="absolute right-[16px] top-[24px] flex size-6 items-center justify-center rounded-full bg-[#EAE9EA] shadow-[0px_8.57px_107.14px_0px_rgba(0,0,0,0.04)]"
                >
                  <CloseIcon className="size-4 text-[#797378]" />
                </button>
              </div>
            ))}

            {gifts.length === 0 && (
              <p className="py-6 text-center text-caption1-r text-gray-400">선물을 추가해 주세요</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-[18px] pb-8 pt-4">
        <Button disabled={gifts.length === 0} onClick={handleComplete}>
          수정 완료
        </Button>
      </div>

      {/* 선물 추가 — 선택 / 직접 입력 오버레이 */}
      {addStep !== null && (
        <div className="fixed inset-0 z-40 mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
          {addStep === 'select' ? (
            <Header title="선물 추가하기" onBack={closeAdd} />
          ) : (
            <Header title="선물 추가하기" onBack={() => setAddStep('select')} />
          )}

          {addStep === 'select' && (
            <div className="flex flex-col gap-6 px-[18px] pt-7">
              <div className="flex flex-col gap-2">
                <h2 className="text-h3-sb text-black">추가할 선물을 등록해주세요</h2>
                <p className="text-caption1-r text-gray-600">
                  새로운 선물로 등록할 수 있고, 위시를 불러올 수도 있어요.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setAddStep('direct')}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-background">
                    <PlusIcon className="size-6 text-gray-900" />
                  </div>
                  <span className="flex-1 text-left text-b2-m text-black">새로운 선물 등록하기</span>
                  <ChevronRightIcon className="size-6 text-black" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowWishSheet(true)}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-background">
                    <GiftIcon className="size-6 text-gray-900" />
                  </div>
                  <span className="flex-1 text-left text-b2-m text-black">위시 불러오기</span>
                  <ChevronRightIcon className="size-6 text-black" />
                </button>
              </div>
            </div>
          )}

          {addStep === 'direct' && (
            <div className="flex flex-1 flex-col overflow-y-auto px-[18px] pb-8 pt-7">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-h3-sb text-black">추가할 선물을 등록해주세요</h2>
                </div>

                <div className="flex flex-col gap-4">
                  {/* 선물 이름 */}
                  <div className="flex flex-col gap-2">
                    <p className="text-b1-m text-black">
                      선물 이름 <span className="text-pink-500">*</span>
                    </p>
                    <div className="flex h-12 items-center rounded-lg bg-background px-4">
                      <input
                        type="text"
                        value={inputName}
                        onChange={e => setInputName(e.target.value)}
                        placeholder="추가할 선물 이름을 입력하세요."
                        className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="flex flex-col gap-2">
                    <p className="text-b1-m text-black">
                      가격 <span className="text-pink-500">*</span>
                    </p>
                    <div className="flex h-12 items-center rounded-lg bg-background px-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputPrice}
                        onChange={e => setInputPrice(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="직접입력하기(원)"
                        className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                      />
                      <span className="ml-1 text-b1-r text-gray-500">원</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!directCanSubmit}
                onClick={handleDirectSubmit}
                className={`mt-8 flex h-[52px] w-full items-center justify-center rounded-xl text-[14px] font-semibold text-white ${
                  directCanSubmit ? 'bg-gray-900' : 'bg-[#C1BCC0]'
                }`}
              >
                추가하기
              </button>
            </div>
          )}

          {/* 위시 불러오기 바텀시트 */}
          <BottomSheet open={showWishSheet} size="half" onClose={closeWishSheet}>
            <div className="relative flex h-full w-full flex-col gap-4 pt-2">
              <div className="flex h-12 items-center gap-4 rounded-lg bg-background px-4">
                <input
                  type="text"
                  value={wishSearch}
                  onChange={e => setWishSearch(e.target.value)}
                  placeholder="상품 이름을 검색해보세요"
                  className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                />
                <SearchIcon className="size-6 shrink-0 text-gray-400" />
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'receive', 'give'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setWishFilter(f)}
                    className={`rounded-full px-4 py-2 text-b2-m ${
                      wishFilter === f ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {f === 'all' ? '전체' : f === 'receive' ? '받고 싶은' : '주고 싶은'}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-caption1-r text-gray-500">선물 {filteredWishItems.length}개</span>
                <div className="flex items-center gap-1">
                  <span className="text-caption1-m text-black">최신순</span>
                  <CaretDownIcon className="size-6 text-black" />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className={`grid grid-cols-2 gap-5 ${selectedWishId !== null || showOverflowToast ? 'pb-28' : ''}`}>
                  {filteredWishItems.map(item => {
                    const isSelected = selectedWishId === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleWishToggle(item)}
                        className="flex flex-col gap-3 text-left"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-background">
                          <img src={item.image} alt={item.name} className="size-full object-cover" />
                          {isSelected && <div className="absolute inset-0 rounded-xl bg-gray-900/10" />}
                          <div className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-900">
                            {isSelected ? (
                              <CheckIcon className="size-3 text-white" />
                            ) : (
                              <PlusIcon className="size-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="mb-[10px] text-caption1-r text-gray-600">{item.brand}</span>
                          <span className="mb-3 line-clamp-2 text-b2-m text-black">{item.name}</span>
                          <span className="font-semibold text-b2-m text-black">{item.price.toLocaleString()}원</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {(selectedWishId !== null || showOverflowToast) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white/0 to-white pb-2 pt-10">
                  {showOverflowToast && (
                    <div className="mb-[11.25px] flex h-11 items-center gap-[10px] rounded-lg bg-[rgba(255,227,237,0.9)] px-[18px]">
                      <p className="text-caption1-m text-black">1개의 상품만 등록할 수 있어요.</p>
                    </div>
                  )}
                  {selectedWishId !== null && (
                    <button
                      type="button"
                      onClick={handleWishConfirm}
                      className="flex h-[52px] w-full items-center justify-center gap-[10px] rounded-xl bg-gray-900 px-[37px] py-[11px] text-[14px] font-semibold text-white"
                    >
                      상품 등록하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </BottomSheet>
        </div>
      )}

      <ConfirmModal
        open={showExitModal}
        title="수정을 그만 두시겠어요?"
        description="변경 내용이 저장되지 않아요"
        confirmText="나가기"
        cancelText="계속 수정하기"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate(`/group/${id}/confirm`, { replace: true, state: passedState })}
      />
    </div>
  )
}
