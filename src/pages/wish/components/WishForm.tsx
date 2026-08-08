import Header from '../../../components/common/Header'
import TextField from '../../../components/common/TextField'
import Button from '../../../components/common/Button'
import CloseIcon from '../../../components/icons/CloseIcon'
import PhotoActionSheet from '../../../components/common/PhotoActionSheet'
import type { WishType } from '../../../store/wishStore'

const WISH_TYPE_OPTIONS: { type: WishType; label: string }[] = [
  { type: 'receive', label: '받고 싶은' },
  { type: 'give', label: '주고 싶은' },
]

const NAME_MAX_LENGTH = 30
const PRICE_MAX_LENGTH = 15

interface WishFormProps {
  title: string
  submitText: string
  wishType: WishType
  onWishTypeChange: (type: WishType) => void
  name: string
  onNameChange: (name: string) => void
  price: string
  onPriceChange: (price: string) => void
  purchaseUrl: string
  onPurchaseUrlChange: (url: string) => void
  image: string | null
  onImageRemove: () => void
  onImageClick: () => void
  selectSheetOpen: boolean
  onSelectSheetClose: () => void
  onFileSelect: (file: File) => void
  isValid: boolean
  onSubmit: () => void
}

export function WishForm({
  title,
  submitText,
  wishType,
  onWishTypeChange,
  name,
  onNameChange,
  price,
  onPriceChange,
  purchaseUrl,
  onPurchaseUrlChange,
  image,
  onImageRemove,
  onImageClick,
  selectSheetOpen,
  onSelectSheetClose,
  onFileSelect,
  isValid,
  onSubmit,
}: WishFormProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title={title} />

      <div className="flex flex-col gap-5 px-[18px] pt-4">
        {/* 위시 유형 */}
        <div className="flex flex-col gap-2">
          <label className="text-b1-m text-black">
            위시 유형 <span className="text-pink-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {WISH_TYPE_OPTIONS.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => onWishTypeChange(option.type)}
                className={`rounded-full px-4 py-3 text-b2-m ${
                  wishType === option.type
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 bg-white text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 선물 이름 */}
        <TextField
          label={
            <>
              선물 이름 <span className="text-pink-500">*</span>
            </>
          }
          value={name}
          maxLength={NAME_MAX_LENGTH}
          hideCounter
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={
            wishType === 'receive'
              ? '받고 싶은 선물 이름을 입력해 주세요'
              : '주고 싶은 선물 이름을 입력해 주세요'
          }
        />

        {/* 선물 가격 */}
        <TextField
          label={
            <>
              선물 가격 <span className="text-pink-500">*</span>
            </>
          }
          value={price ? Number(price).toLocaleString() : ''}
          maxLength={PRICE_MAX_LENGTH}
          hideCounter
          onChange={(e) => onPriceChange(e.target.value.replace(/\D/g, ''))}
          suffix="원"
          inputMode="numeric"
          placeholder="선물 가격을 입력해 주세요"
        />

        {/* 선물 구매처 링크 */}
        <TextField
          label={
            <>
              선물 구매처 링크 <span className="text-pink-500">*</span>
            </>
          }
          value={purchaseUrl}
          onChange={(e) => onPurchaseUrlChange(e.target.value)}
          placeholder="구매처 링크를 입력해 주세요"
        />

        {/* 선물 이미지 */}
        <div className="flex flex-col gap-3">
          <label className="text-b1-m text-black">선물 이미지</label>

          {image ? (
            <div className="relative size-[123px] overflow-hidden rounded-2xl bg-background">
              <img
                src={image}
                alt="선물 이미지 미리보기"
                onClick={onImageClick}
                className="size-full cursor-pointer object-cover"
              />
              {/* 전면 딤드 오버레이 & 중앙 화이트 원형 fill x 버튼 */}
              <div
                onClick={onImageClick}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40"
              >
                <button
                  type="button"
                  aria-label="이미지 삭제"
                  onClick={(e) => {
                    e.stopPropagation()
                    onImageRemove()
                  }}
                  className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-sm transition-transform hover:scale-105"
                >
                  <CloseIcon className="size-5 text-gray-700" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onImageClick}
              className="flex size-[123px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-gray-300 bg-background text-gray-500 transition-colors hover:border-gray-400"
            >
              <span className="text-xl">+</span>
              <span className="text-caption1-r">이미지 추가</span>
            </button>
          )}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="mt-auto px-[18px] pb-8 pt-4">
        <Button disabled={!isValid} onClick={onSubmit}>
          {submitText}
        </Button>
      </div>

      {/* Modals & Sheets */}
      {selectSheetOpen && (
        <PhotoActionSheet onClose={onSelectSheetClose} onSelect={onFileSelect} aspectRatio={1} />
      )}
    </div>
  )
}
