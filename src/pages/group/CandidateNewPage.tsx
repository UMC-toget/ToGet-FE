import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import BottomSheet from '../../components/common/BottomSheet'
import Toast from '../../components/common/Toast'
import EmojiPopup from '../../components/common/EmojiPopup'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import GiftIcon from '../../components/icons/GiftIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import CheckIcon from '../../components/icons/CheckIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import PhotoActionSheet from '../../components/common/PhotoActionSheet'
import { postGiftCandidate } from '../../api/groupFundings'
import { useWishedProducts, type SortOrder } from '../wish/hooks/useWishedProducts'
import type { WishType } from '../../store/wishStore'
import type { Product } from '../home/products'
import type { ConfirmedGift } from './ConfirmPage'
import { sanitizePurchaseUrl } from '../../utils/sanitizePurchaseUrl'

// 접근: 공동관리자 · 개설자 (CO_HOST 이상) | H06 선물 후보 등록하기
const MEMO_MAX_LENGTH = 60

type PageStep = 'select' | 'direct' | 'form'

// 후보 등록 임시저장(로컬). BE에 후보 draft 엔드포인트가 없어 클라이언트에 보관한다.
// '저장하고 나가기' 시 저장하고, 등록 완료되면 지운다. 펀딩별로 키를 나눈다.
interface CandidateDraft {
  pageStep: PageStep
  selectedWishItem: Product | null
  memo: string
}

const draftKey = (fundingId: string | undefined) => `candidate-draft:${fundingId ?? 'unknown'}`

function readCandidateDraft(fundingId: string | undefined): CandidateDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(fundingId))
    return raw ? (JSON.parse(raw) as CandidateDraft) : null
  } catch {
    return null
  }
}

export default function CandidateNewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // 다른 화면(선물 목록 수정 등)에서 넘어온 진입 정보
  const navState = location.state as { openWish?: boolean; giftMode?: boolean; returnTo?: string; returnState?: unknown } | null
  // '위시 불러오기'로 진입하면 도착 즉시 위시 시트를 연다
  const openWishOnEnter = navState?.openWish ?? false
  // 확정 선물 추가 진입(선물 목록 수정)이면 문구를 '후보' 대신 '선물' 버전으로 표시한다
  const isGiftMode = navState?.giftMode ?? false
  // 등록/나가기 후 이동할 곳. 진입 출처(returnTo)가 있으면 그 화면으로 상태 복원하며 복귀, 없으면 후보 목록으로.
  // newGift가 있으면(등록 성공) 복귀 화면의 확정 선물 목록에 추가해서 넘긴다.
  const goAfterDone = (newGift?: ConfirmedGift) => {
    if (!navState?.returnTo) {
      navigate(`/group/${id}/candidates`)
      return
    }
    const prev = navState.returnState as { confirmedGifts?: ConfirmedGift[] } | null
    const state = newGift
      ? { ...prev, confirmedGifts: [...(prev?.confirmedGifts ?? []), newGift] }
      : navState.returnState
    navigate(navState.returnTo, { state })
  }

  // 임시저장된 내용이 있으면 그 값으로 폼을 복원한다 (없으면 기본값)
  const [initialDraft] = useState(() => readCandidateDraft(id))
  const [pageStep, setPageStep] = useState<PageStep>(initialDraft?.pageStep ?? 'select')
  const [selectedWishItem, setSelectedWishItem] = useState<Product | null>(initialDraft?.selectedWishItem ?? null)

  const [showWishSheet, setShowWishSheet] = useState(openWishOnEnter)
  const [wishSearch, setWishSearch] = useState('')
  const [wishFilter, setWishFilter] = useState<'all' | WishType>('all')
  const [selectedWishId, setSelectedWishId] = useState<number | null>(null)
  const [showOverflowToast, setShowOverflowToast] = useState(false)
  const [wishSort, setWishSort] = useState<SortOrder>('latest')
  const { wishedProducts, isLoading: wishLoading } = useWishedProducts(wishFilter, wishSort)

  // 직접 입력 폼 상태
  const [inputName, setInputName] = useState('')
  const [inputPrice, setInputPrice] = useState('')
  const [inputLink, setInputLink] = useState('')
  const [directImagePreview, setDirectImagePreview] = useState<string | null>(null)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)

  // 메모 (direct / form 공용)
  const [memo, setMemo] = useState(initialDraft?.memo ?? '')

  const [showLeavePopup, setShowLeavePopup] = useState(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [showCompletePopup, setShowCompletePopup] = useState(false)
  // 위시 등록 성공 시 방금 등록한 선물을 담아두고, 완료 팝업 버튼에서 복귀할 때 확정 목록에 추가한다
  const [registeredGift, setRegisteredGift] = useState<ConfirmedGift | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  const parsedPrice = parseInt(inputPrice.replace(/[^0-9]/g, ''), 10)
  const directCanSubmit = inputName.trim().length > 0 && parsedPrice > 0 && memo.trim().length > 0
  const formCanSubmit = memo.trim().length > 0

  const showError = (msg: string) => {
    setErrorToast(msg)
    setTimeout(() => setErrorToast(null), 3000)
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
    setShowWishSheet(false)
    setWishSearch('')
    setWishFilter('all')
    setSelectedWishId(null)
    setShowOverflowToast(false)

    // 어느 경로(메인/직접 등록)에서 불러왔든 위시를 불러오면 항상 같은 화면(form)으로 간다
    setSelectedWishItem(item)
    setMemo('')
    setPageStep('form')
  }

  const closeWishSheet = () => {
    setShowWishSheet(false)
    setWishSearch('')
    setWishFilter('all')
    setSelectedWishId(null)
    setShowOverflowToast(false)
  }

  const openWishFromDirect = () => {
    setShowWishSheet(true)
  }

  const handlePhotoSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    setDirectImagePreview(url)
  }

  const goToDirectStep = () => {
    setInputName('')
    setInputPrice('')
    setInputLink('')
    setDirectImagePreview(null)
    setMemo('')
    setPageStep('direct')
  }

  const handleRemoveWishItem = () => {
    setSelectedWishItem(null)
    setMemo('')
    setPageStep('select')
  }

  const handleFormSubmit = () => {
    if (!formCanSubmit) return
    setShowConfirmPopup(true)
  }

  // 임시저장(로컬) 후 나가기. 다음에 들어오면 초기값에서 복원된다.
  const handleSaveAndLeave = () => {
    const draft: CandidateDraft = { pageStep, selectedWishItem, memo }
    try {
      localStorage.setItem(draftKey(id), JSON.stringify(draft))
    } catch {
      // 저장 실패해도 이동은 막지 않는다
    }
    setShowLeavePopup(false)
    goAfterDone()
  }

  // 등록이 끝나면 임시저장을 비운다
  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey(id))
    } catch {
      // 무시
    }
  }

  const handleConfirmRegister = async () => {
    if (!selectedWishItem || submitting) return
    setSubmitting(true)
    setShowConfirmPopup(false)
    try {
      const res = await postGiftCandidate(id!, {
        giftName: selectedWishItem.name,
        giftPrice: selectedWishItem.price,
        note: memo.trim(),
      })
      clearDraft()
      setRegisteredGift({
        id: res.fundingGiftId,
        name: selectedWishItem.name,
        price: selectedWishItem.price,
        imageUrl: selectedWishItem.image || null,
      })
      setShowCompletePopup(true)
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401) showError('로그인이 필요해요')
      else if (status === 403) showError('후보 등록은 공동관리자 이상만 가능해요')
      else showError('등록에 실패했어요. 다시 시도해주세요')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDirectSubmit = async () => {
    if (!directCanSubmit || submitting) return
    setSubmitting(true)
    try {
      const res = await postGiftCandidate(id!, {
        giftName: inputName.trim(),
        giftPrice: parsedPrice,
        note: memo.trim(),
      })
      clearDraft()
      goAfterDone({
        id: res.fundingGiftId,
        name: inputName.trim(),
        price: parsedPrice,
        imageUrl: directImagePreview,
      })
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401) showError('로그인이 필요해요')
      else if (status === 403) showError('후보 등록은 공동관리자 이상만 가능해요')
      else showError('등록에 실패했어요. 다시 시도해주세요')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {/* 헤더 — direct 단계는 나가기 없이 뒤로가기만 */}
      {pageStep === 'direct' ? (
        <Header title={isGiftMode ? '선물 등록하기' : '선물 후보 등록하기'} onBack={() => setPageStep('select')} />
      ) : (
        <Header
          title={isGiftMode ? '선물 등록하기' : '선물 후보 등록하기'}
          right={
            <button type="button" onClick={() => setShowLeavePopup(true)} className="text-b2-m text-[#797378]">
              나가기
            </button>
          }
        />
      )}

      {/* 선택 단계 */}
      {pageStep === 'select' && (
        <div className="flex flex-col gap-6 px-[18px] pt-7">
          <div className="flex flex-col gap-2">
            <h2 className="text-h3-sb text-black">{isGiftMode ? '추가할 선물을 등록해주세요' : '후보 선물을 등록해주세요'}</h2>
            <p className="text-caption1-r text-gray-600">
              새로운 선물로 등록할 수 있고, 위시를 불러올 수도 있어요.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={goToDirectStep}
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

      {/* 직접 입력 단계 */}
      {pageStep === 'direct' && (
        <div className="flex flex-1 flex-col overflow-y-auto px-[18px] pb-8 pt-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-h3-sb text-black">{isGiftMode ? '추가할 선물을 등록해주세요' : '후보 선물을 등록해주세요'}</h2>
              <p className="text-caption1-r text-[#797378]">등록자 이름이 함께 표시돼요</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* 위시 불러오기 카드 */}
              <button
                type="button"
                onClick={openWishFromDirect}
                className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-background">
                  <GiftIcon className="size-6 text-gray-900" />
                </div>
                <span className="flex-1 text-left text-b2-m text-black">위시 불러오기</span>
                <ChevronRightIcon className="size-6 text-black" />
              </button>

              {/* 선물 이름 */}
              <div className="flex flex-col gap-2">
                <p className="text-b1-m text-black">
                  선물 이름 <span className="text-pink-500">*</span>
                </p>
                <div className="flex h-12 items-center rounded-lg bg-background px-4">
                  <input
                    type="text"
                    value={inputName}
                    maxLength={30}
                    onChange={e => setInputName(e.target.value.slice(0, 30))}
                    placeholder={isGiftMode ? '등록할 선물 이름을 입력하세요.' : '등록할 선물 후보 이름을 입력하세요.'}
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
                    maxLength={15}
                    onChange={e => setInputPrice(e.target.value.replace(/[^0-9]/g, '').slice(0, 15))}
                    placeholder="직접입력하기(원)"
                    className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                  />
                  <span className="ml-1 text-b1-r text-gray-500">원</span>
                </div>
              </div>

              {/* 링크 (선택) */}
              <div className="flex flex-col gap-2">
                <p className="text-b1-m text-black">
                  링크 <span className="text-gray-400">(선택)</span>
                </p>
                <div className="flex h-12 items-center rounded-lg bg-background px-4">
                  <input
                    type="url"
                    value={inputLink}
                    onChange={e => setInputLink(sanitizePurchaseUrl(e.target.value))}
                    placeholder="등록할 상품의 구매 링크를 입력하세요."
                    className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 소개글 또는 메모 */}
              <div className="flex flex-col gap-2">
                <p className="text-b1-m text-black">
                  소개글 또는 메모 <span className="text-pink-500">*</span>
                </p>
                <div className="rounded-lg bg-background px-4 py-3">
                  <textarea
                    value={memo}
                    onChange={e => {
                      if (e.target.value.length <= MEMO_MAX_LENGTH) setMemo(e.target.value)
                    }}
                    placeholder="이 선물을 추천하는 이유를 적어주세요"
                    rows={3}
                    className="w-full resize-none bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                  />
                  <p className="text-right text-b2-r text-gray-400">
                    ({memo.length}/{MEMO_MAX_LENGTH})
                  </p>
                </div>
              </div>

              {/* 선물 이미지 (선택) */}
              <div className="flex flex-col gap-2">
                <p className="text-b1-m text-black">
                  선물 이미지 <span className="text-gray-400">(선택)</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowPhotoSheet(true)}
                  className="flex size-[123px] items-center justify-center overflow-hidden rounded-2xl bg-background"
                >
                  {directImagePreview ? (
                    <img src={directImagePreview} alt="선물 이미지" className="size-full object-cover" />
                  ) : (
                    <PlusIcon className="size-8 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!directCanSubmit || submitting}
            onClick={handleDirectSubmit}
            className={`mt-8 flex h-[52px] w-full items-center justify-center rounded-xl text-[14px] font-semibold text-white ${
              directCanSubmit ? 'bg-gray-900' : 'bg-[#C1BCC0]'
            }`}
          >
            {isGiftMode ? '선물 등록하기' : '후보 등록하기'}
          </button>
        </div>
      )}

      {/* 위시 폼 단계 */}
      {pageStep === 'form' && selectedWishItem && (
        <div className="flex flex-1 flex-col px-[18px] pb-8 pt-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-h3-sb text-black">{isGiftMode ? '추가할 선물을 등록해주세요' : '후보 선물을 등록해주세요'}</h2>
              <p className="text-caption1-r text-[#797378]">등록자 이름이 함께 표시돼요</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* 선택된 상품 카드 */}
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-[6px] bg-background">
                  {selectedWishItem.image ? (
                    <img src={selectedWishItem.image} alt={selectedWishItem.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <GiftIcon className="size-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-b2-m text-black">{selectedWishItem.name}</span>
                  <span className="text-caption1-r text-[#5B565A]">
                    {selectedWishItem.price.toLocaleString()}원
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveWishItem}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100"
                >
                  <CloseIcon className="size-4 text-[#797378]" />
                </button>
              </div>

              {/* 메모 */}
              <div className="flex flex-col gap-2">
                <p className="text-b1-m text-black">
                  소개글 또는 메모 <span className="text-pink-500">*</span>
                </p>
                <div className="rounded-lg bg-background px-4 py-3">
                  <textarea
                    value={memo}
                    onChange={e => {
                      if (e.target.value.length <= MEMO_MAX_LENGTH) setMemo(e.target.value)
                    }}
                    placeholder="이 선물을 추천하는 이유를 적어주세요"
                    rows={3}
                    className="w-full resize-none bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
                  />
                  <p className="text-right text-b2-r text-gray-400">
                    ({memo.length}/{MEMO_MAX_LENGTH})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!formCanSubmit || submitting}
            onClick={handleFormSubmit}
            className={`mt-auto flex h-[52px] w-full items-center justify-center rounded-xl text-[14px] font-semibold text-white ${
              formCanSubmit ? 'bg-gray-900' : 'bg-[#C1BCC0]'
            }`}
          >
            {isGiftMode ? '선물 등록하기' : '후보 등록하기'}
          </button>
        </div>
      )}

      {/* 나가기 확인 팝업 */}
      <EmojiPopup
        open={showLeavePopup}
        title={isGiftMode ? '작성 중인 선물 등록 페이지를\n나가시겠어요?' : '작성 중인 후보 등록 페이지를\n나가시겠어요?'}
        titleClassName="whitespace-pre-line text-center text-h3-sb leading-[1.4]"
        description={'지금 나가면 현재까지 입력한 내용이 저장되고,\n다음에 다시 이어서 작성할 수 있어요'}
        buttons={[
          { label: '계속 작성하기', variant: 'secondary', onClick: () => setShowLeavePopup(false) },
          { label: '저장하고 나가기', variant: 'primary', onClick: handleSaveAndLeave },
        ]}
        onDimClick={() => setShowLeavePopup(false)}
      />

      {/* 후보 등록 확인 팝업 */}
      <EmojiPopup
        open={showConfirmPopup}
        title={isGiftMode ? '등록을 완료하시겠어요?' : '후보 등록을 완료하시겠어요?'}
        description="등록 버튼을 누르면, 수정이 불가해요."
        buttons={[
          { label: '수정하기', variant: 'secondary', onClick: () => setShowConfirmPopup(false) },
          { label: '등록하기', variant: 'primary', onClick: handleConfirmRegister },
        ]}
        onDimClick={() => setShowConfirmPopup(false)}
      />

      {/* 완료 팝업 */}
      {showCompletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative w-[320px] rounded-[20px] bg-white px-6 py-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-5">
                <div className="flex size-12 items-center justify-center rounded-full bg-pink-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-center text-[18px] font-semibold text-black">{isGiftMode ? '선물 등록이 완료되었습니다' : '선물 후보 등록이 완료되었습니다'}</p>
              </div>
              <button
                type="button"
                onClick={() => goAfterDone(registeredGift ?? undefined)}
                className="flex h-[42px] w-full items-center justify-center rounded-lg bg-gray-900 text-[14px] font-semibold text-white"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
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
            <SearchIcon className="size-6 shrink-0 text-gray-900" />
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWishSort(prev => (prev === 'latest' ? 'oldest' : 'latest'))}
                className="flex items-center gap-1"
              >
                <span className="text-caption1-m text-black">{wishSort === 'latest' ? '최신순' : '오래된순'}</span>
                <CaretDownIcon className="size-6 text-black" />
              </button>
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
              {filteredWishItems.length === 0 && (
                <p className="col-span-2 py-8 text-center text-caption1-r text-gray-400">
                  {wishLoading ? '불러오는 중...' : '검색 결과가 없어요'}
                </p>
              )}
            </div>
          </div>

          {(selectedWishId !== null || showOverflowToast) && (
            <div className="absolute bottom-0 left-0 right-0 pb-2">
              {showOverflowToast && (
                <div className="mb-5 flex h-11 items-center justify-center rounded-[5px] bg-[rgba(30,29,30,0.8)] px-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] backdrop-blur-[30px]">
                  <p className="text-b2-m text-white">1개의 상품만 등록할 수 있어요.</p>
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

      {showPhotoSheet && (
        <PhotoActionSheet
          onClose={() => setShowPhotoSheet(false)}
          onSelect={handlePhotoSelect}
          aspectRatio={1}
        />
      )}

      <Toast open={errorToast !== null} message={errorToast ?? ''} />
    </div>
  )
}
