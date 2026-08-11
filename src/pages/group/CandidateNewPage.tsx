import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import BottomSheet from '../../components/common/BottomSheet'
import Toast from '../../components/common/Toast'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import GiftIcon from '../../components/icons/GiftIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import CheckIcon from '../../components/icons/CheckIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import PhotoActionSheet from '../../components/common/PhotoActionSheet'
import { postGiftCandidate } from '../../api/groupFundings'
import { useWishedProducts } from '../wish/hooks/useWishedProducts'
import type { WishType } from '../../store/wishStore'
import type { Product } from '../home/products'

// 접근: 공동관리자 · 개설자 (CO_HOST 이상) | H06 선물 후보 등록하기
const MEMO_MAX_LENGTH = 60

type PageStep = 'select' | 'direct' | 'form'

export default function CandidateNewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pageStep, setPageStep] = useState<PageStep>('select')
  const [selectedWishItem, setSelectedWishItem] = useState<Product | null>(null)

  const [showWishSheet, setShowWishSheet] = useState(false)
  const [wishCalledFrom, setWishCalledFrom] = useState<'select' | 'direct'>('select')
  const [wishSearch, setWishSearch] = useState('')
  const [wishFilter, setWishFilter] = useState<'all' | WishType>('all')
  const [selectedWishId, setSelectedWishId] = useState<number | null>(null)
  const [showOverflowToast, setShowOverflowToast] = useState(false)
  const { wishedProducts, isLoading: wishLoading } = useWishedProducts(wishFilter, 'latest')

  // 직접 입력 폼 상태
  const [inputName, setInputName] = useState('')
  const [inputPrice, setInputPrice] = useState('')
  const [inputLink, setInputLink] = useState('')
  const [directImagePreview, setDirectImagePreview] = useState<string | null>(null)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)

  // 메모 (direct / form 공용)
  const [memo, setMemo] = useState('')

  const [showLeavePopup, setShowLeavePopup] = useState(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [showCompletePopup, setShowCompletePopup] = useState(false)
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

    if (wishCalledFrom === 'direct') {
      setInputName(item.name)
      setInputPrice(String(item.price))
    } else {
      setSelectedWishItem(item)
      setMemo('')
      setPageStep('form')
    }
  }

  const closeWishSheet = () => {
    setShowWishSheet(false)
    setWishSearch('')
    setWishFilter('all')
    setSelectedWishId(null)
    setShowOverflowToast(false)
  }

  const openWishFromDirect = () => {
    setWishCalledFrom('direct')
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

  const handleConfirmRegister = async () => {
    if (!selectedWishItem || submitting) return
    setSubmitting(true)
    setShowConfirmPopup(false)
    try {
      await postGiftCandidate(id!, {
        giftName: selectedWishItem.name,
        giftPrice: selectedWishItem.price,
        note: memo.trim(),
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
      await postGiftCandidate(id!, {
        giftName: inputName.trim(),
        giftPrice: parsedPrice,
        note: memo.trim(),
      })
      navigate(`/group/${id}/candidates`)
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401) showError('로그인이 필요해요')
      else if (status === 403) showError('후보 등록은 공동관리자 이상만 가능해요')
      else showError('등록에 실패했어요. 다시 시도해주세요')
    } finally {
      setSubmitting(false)
    }
  }

  const leaveIcon = (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z" fill="#FE71A5"/>
      <path d="M21.6211 15.1016L22.261 28.035H25.1912L25.7975 15.1016L25.9322 10.7568H21.4863L21.6211 15.1016Z" fill="white"/>
      <path d="M26.8164 31.2056C27.5784 31.1356 28.1437 31.3466 28.4727 31.7876C28.7757 32.1942 28.7877 32.6803 28.7266 32.9907L28.7236 33.0073L28.7188 33.0239C28.4911 33.8816 27.7671 34.3401 27.1055 34.5757C26.4881 34.7953 25.8213 34.8611 25.3496 34.8569C25.3726 34.8988 25.3985 34.9414 25.4277 34.9819C25.5642 35.1707 25.7816 35.3505 26.1436 35.4263L26.3076 35.4526L26.3213 35.4536C26.572 35.4873 26.972 35.4706 27.3174 35.3208C27.6382 35.1813 27.9098 34.9324 28.0049 34.4575L28.5137 34.5591L29.0225 34.6616C28.8504 35.5206 28.3127 36.0201 27.7305 36.2729C27.1792 36.5122 26.5881 36.5343 26.1963 36.4839V36.4849C26.1933 36.4844 26.1894 36.4832 26.1865 36.4829C26.1854 36.4829 26.1836 36.483 26.1826 36.4829V36.4819C25.4227 36.3957 24.905 36.031 24.5859 35.5893C24.4132 35.3501 24.3031 35.0934 24.2373 34.856H23.9883C24.0299 34.6626 24.0503 34.4908 24.0537 34.356C24.0584 34.1682 24.0484 33.9889 24.0273 33.8179H24.1846C24.2882 33.0327 24.6647 32.4421 25.125 32.0259C25.6676 31.5356 26.3203 31.2905 26.7744 31.2114L26.7949 31.2075L26.8164 31.2056ZM26.9297 32.2378C26.6353 32.2936 26.1854 32.4664 25.8203 32.7964C25.5532 33.0381 25.3267 33.3671 25.2363 33.8179H25.2695C25.648 33.8316 26.2396 33.782 26.7568 33.5981C27.2754 33.4136 27.6046 33.1383 27.709 32.7739C27.7296 32.6488 27.71 32.5009 27.6406 32.4077C27.594 32.3454 27.4418 32.1946 26.9297 32.2378Z" fill="white"/>
      <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="url(#leave0)"/>
      <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="url(#leave1)"/>
      <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="url(#leave2)"/>
      <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="white"/>
      <defs>
        <linearGradient id="leave0" x1="21.4029" y1="31.1919" x2="21.4029" y2="37.2417" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FE8DB7"/><stop offset="1" stopColor="#FE8DB7"/>
        </linearGradient>
        <linearGradient id="leave1" x1="21.4029" y1="31.1919" x2="21.4029" y2="37.2417" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FE71A5"/><stop offset="1" stopColor="#FBFCEE"/>
        </linearGradient>
        <linearGradient id="leave2" x1="21.4029" y1="31.1919" x2="21.4029" y2="40.3183" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FE71A5"/><stop offset="1" stopColor="#FBFCEE"/>
        </linearGradient>
      </defs>
    </svg>
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {/* 헤더 — direct 단계는 나가기 없이 뒤로가기만 */}
      {pageStep === 'direct' ? (
        <Header title="선물 후보 등록하기" onBack={() => setPageStep('select')} />
      ) : (
        <Header
          title="선물 후보 등록하기"
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
            <h2 className="text-h3-sb text-black">후보 선물을 등록해주세요</h2>
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
              onClick={() => { setWishCalledFrom('select'); setShowWishSheet(true) }}
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
              <h2 className="text-h3-sb text-black">후보 선물을 등록해주세요</h2>
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
                    onChange={e => setInputName(e.target.value)}
                    placeholder="등록할 선물 후보 이름을 입력하세요."
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

              {/* 링크 (선택) */}
              <div className="flex flex-col gap-2">
                <p className="text-b1-m text-black">
                  링크 <span className="text-gray-400">(선택)</span>
                </p>
                <div className="flex h-12 items-center rounded-lg bg-background px-4">
                  <input
                    type="url"
                    value={inputLink}
                    onChange={e => setInputLink(e.target.value)}
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
            후보 등록하기
          </button>
        </div>
      )}

      {/* 위시 폼 단계 */}
      {pageStep === 'form' && selectedWishItem && (
        <div className="flex flex-1 flex-col px-[18px] pb-8 pt-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-h3-sb text-black">후보 선물을 등록해주세요</h2>
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
            후보 등록하기
          </button>
        </div>
      )}

      {/* 나가기 확인 팝업 */}
      {showLeavePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative w-[320px] rounded-[20px] bg-white px-6 py-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center gap-5">
                  {leaveIcon}
                  <p className="text-center text-[18px] font-semibold text-black">페이지를 나가시겠어요?</p>
                </div>
                <p className="text-center text-[14px] font-normal text-[#797378]">
                  페이지를 나가면,<br />작성한 내용이 모두 사라져요
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeavePopup(false)}
                  className="flex h-[42px] flex-1 items-center justify-center rounded-lg bg-gray-100 text-[14px] font-semibold text-[#797378]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/group/${id}/candidates`)}
                  className="flex h-[42px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[14px] font-semibold text-white"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 후보 등록 확인 팝업 */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative w-[320px] rounded-[20px] bg-white px-6 py-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center gap-5">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z" fill="#FE71A5"/>
                    <path d="M21.6211 15.1016L22.261 28.035H25.1912L25.7975 15.1016L25.9322 10.7568H21.4863L21.6211 15.1016Z" fill="white"/>
                    <path d="M26.8164 31.2056C27.5784 31.1356 28.1437 31.3466 28.4727 31.7876C28.7757 32.1942 28.7877 32.6803 28.7266 32.9907L28.7236 33.0073L28.7188 33.0239C28.4911 33.8816 27.7671 34.3401 27.1055 34.5757C26.4881 34.7953 25.8213 34.8611 25.3496 34.8569C25.3726 34.8988 25.3985 34.9414 25.4277 34.9819C25.5642 35.1707 25.7816 35.3505 26.1436 35.4263L26.3076 35.4526L26.3213 35.4536C26.572 35.4873 26.972 35.4706 27.3174 35.3208C27.6382 35.1813 27.9098 34.9324 28.0049 34.4575L28.5137 34.5591L29.0225 34.6616C28.8504 35.5206 28.3127 36.0201 27.7305 36.2729C27.1792 36.5122 26.5881 36.5343 26.1963 36.4839V36.4849C26.1933 36.4844 26.1894 36.4832 26.1865 36.4829C26.1854 36.4829 26.1836 36.483 26.1826 36.4829V36.4819C25.4227 36.3957 24.905 36.031 24.5859 35.5893C24.4132 35.3501 24.3031 35.0934 24.2373 34.856H23.9883C24.0299 34.6626 24.0503 34.4908 24.0537 34.356C24.0584 34.1682 24.0484 33.9889 24.0273 33.8179H24.1846C24.2882 33.0327 24.6647 32.4421 25.125 32.0259C25.6676 31.5356 26.3203 31.2905 26.7744 31.2114L26.7949 31.2075L26.8164 31.2056ZM26.9297 32.2378C26.6353 32.2936 26.1854 32.4664 25.8203 32.7964C25.5532 33.0381 25.3267 33.3671 25.2363 33.8179H25.2695C25.648 33.8316 26.2396 33.782 26.7568 33.5981C27.2754 33.4136 27.6046 33.1383 27.709 32.7739C27.7296 32.6488 27.71 32.5009 27.6406 32.4077C27.594 32.3454 27.4418 32.1946 26.9297 32.2378Z" fill="white"/>
                    <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="url(#paint0_linear_4400_29964)"/>
                    <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="url(#paint1_linear_4400_29964)"/>
                    <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="url(#paint2_linear_4400_29964)"/>
                    <path d="M21.168 31.2051L21.1895 31.207L21.21 31.2109C21.6642 31.2899 22.3175 31.5348 22.8604 32.0254C23.4194 32.5307 23.8535 33.2932 23.8271 34.3496C23.8188 34.6775 23.6963 35.2747 23.373 35.8408C23.0423 36.4198 22.4738 37.0092 21.5635 37.2002C21.23 37.2701 20.7222 37.267 20.2295 37.0713C19.7157 36.8671 19.2185 36.4515 18.9775 35.7217L19.4707 35.5586L19.9639 35.3965C20.0972 35.8 20.3495 36.0016 20.6133 36.1064C20.898 36.2195 21.1962 36.2169 21.3506 36.1846C21.8912 36.0711 22.2428 35.7268 22.4717 35.3262C22.5628 35.1666 22.63 35.0041 22.6787 34.8564C22.2049 34.8653 21.5158 34.8019 20.8789 34.5752C20.2172 34.3396 19.4931 33.8814 19.2656 33.0234L19.2578 32.9902C19.1968 32.6798 19.2087 32.1936 19.5117 31.7871C19.8407 31.3462 20.4061 31.1351 21.168 31.2051ZM21.0547 32.2373C20.5429 32.1941 20.3904 32.3449 20.3438 32.4072C20.2749 32.4996 20.2556 32.646 20.2754 32.7705C20.3788 33.1364 20.7075 33.4125 21.2275 33.5976C21.7448 33.7817 22.3363 33.8311 22.7148 33.8174H22.748C22.6576 33.3664 22.4314 33.0376 22.1641 32.7959C21.7987 32.4657 21.349 32.293 21.0547 32.2373Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_4400_29964" x1="21.4029" y1="31.1919" x2="21.4029" y2="37.2417" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FE8DB7"/><stop offset="1" stopColor="#FE8DB7"/>
                      </linearGradient>
                      <linearGradient id="paint1_linear_4400_29964" x1="21.4029" y1="31.1919" x2="21.4029" y2="37.2417" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FE71A5"/><stop offset="1" stopColor="#FBFCEE"/>
                      </linearGradient>
                      <linearGradient id="paint2_linear_4400_29964" x1="21.4029" y1="31.1919" x2="21.4029" y2="40.3183" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FE71A5"/><stop offset="1" stopColor="#FBFCEE"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="text-center text-[18px] font-semibold text-black">후보 등록을 완료하시겠어요?</p>
                </div>
                <p className="text-center text-[14px] font-normal text-[#797378]">
                  등록 버튼을 누르면, 수정이 불가해요.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmRegister}
                  className="flex h-[42px] flex-1 items-center justify-center rounded-lg bg-gray-100 text-[14px] font-semibold text-[#797378]"
                >
                  등록하기
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmPopup(false)}
                  className="flex h-[42px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[14px] font-semibold text-white"
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-center text-[18px] font-semibold text-black">선물 후보 등록이 완료되었습니다</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/home')}
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-caption1-m text-black">최신순</span>
                <CaretDownIcon className="size-6 text-black" />
              </div>
              <span className="text-caption1-m text-black">편집</span>
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white/0 to-white pb-2 pt-10">
              {showOverflowToast && (
                <div className="mb-[11.25px] flex h-11 items-center gap-[10px] rounded-lg bg-[rgba(255,227,237,0.9)] px-[18px]">
                  <div className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-pink-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <path d="M7.09361 3.69895L7.4269 10.4351H8.95306L9.26882 3.69895L9.33898 1.43604H7.02344L7.09361 3.69895Z" fill="white"/>
                      <path d="M9.7998 12.0864C10.1964 12.0501 10.4908 12.1605 10.6621 12.3901C10.8197 12.6019 10.8258 12.8555 10.7939 13.0171L10.793 13.0249L10.79 13.0337C10.6715 13.4803 10.2947 13.7196 9.9502 13.8422C9.62891 13.9566 9.28181 13.9889 9.03613 13.9868C9.04818 14.0088 9.06079 14.0319 9.07617 14.0532C9.15739 14.1655 9.29345 14.272 9.53418 14.2983L9.54199 14.2993L9.65234 14.3071C9.77433 14.3084 9.92562 14.2885 10.0605 14.2299C10.2275 14.1573 10.3694 14.0278 10.4189 13.7807L10.6836 13.8335L10.9492 13.8862C10.8596 14.3337 10.5787 14.5943 10.2754 14.726C9.98837 14.8506 9.68062 14.8616 9.47656 14.8354V14.8364C9.47482 14.8362 9.47246 14.8356 9.4707 14.8354H9.46973V14.8344C9.07386 14.7896 8.80396 14.5996 8.6377 14.3696C8.54797 14.2452 8.49229 14.1112 8.45801 13.9878H8.32324C8.34483 13.887 8.35851 13.7982 8.36035 13.728C8.3628 13.6297 8.35584 13.5362 8.34473 13.4467H8.43066C8.48476 13.0382 8.67844 12.7308 8.91797 12.5141C9.20078 12.2585 9.54174 12.1304 9.77832 12.0893L9.78906 12.0874L9.7998 12.0864ZM9.86035 12.6245C9.70709 12.6532 9.47218 12.7429 9.28125 12.9155C9.14206 13.0413 9.02372 13.212 8.97656 13.4467H8.99414V13.4477C9.19134 13.4548 9.49933 13.4283 9.76855 13.3325C10.0388 13.2363 10.2095 13.0928 10.2637 12.9028C10.2742 12.8378 10.2644 12.7608 10.2285 12.7124C10.204 12.6798 10.1244 12.6026 9.86035 12.6245Z" fill="white"/>
                      <path d="M6.85742 12.0859L6.86816 12.0869L6.87891 12.0889C7.11544 12.1299 7.45543 12.2581 7.73828 12.5137C8.02946 12.7768 8.25583 13.1735 8.24219 13.7236C8.23786 13.8945 8.17427 14.2061 8.00586 14.501C7.83357 14.8025 7.53755 15.1096 7.06348 15.209C6.88975 15.2454 6.62475 15.2435 6.36816 15.1416C6.10074 15.0352 5.84224 14.8184 5.7168 14.4385L5.97363 14.3535L6.22949 14.2686C6.29888 14.4787 6.43105 14.584 6.56836 14.6387C6.71647 14.6975 6.87159 14.6965 6.95215 14.6797C7.23386 14.6206 7.41689 14.4412 7.53613 14.2324C7.58381 14.1489 7.61715 14.0636 7.64258 13.9863C7.39591 13.9907 7.03796 13.9595 6.70703 13.8418C6.36242 13.7191 5.98467 13.48 5.86621 13.0332L5.86426 13.0244L5.8623 13.0166C5.8305 12.855 5.8366 12.6013 5.99414 12.3896C6.16544 12.1599 6.46053 12.0495 6.85742 12.0859ZM6.7959 12.624C6.53122 12.6022 6.45192 12.6796 6.42773 12.7119C6.39171 12.7602 6.38206 12.8373 6.39258 12.9023C6.44665 13.0923 6.61762 13.2358 6.8877 13.332C7.15714 13.4279 7.46583 13.4544 7.66309 13.4473V13.4463H7.68066C7.6335 13.2117 7.51509 13.0408 7.37598 12.915C7.18476 12.7423 6.94909 12.6526 6.7959 12.624Z" fill="white"/>
                    </svg>
                  </div>
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
