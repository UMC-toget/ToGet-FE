import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import TextField from '../../components/common/TextField'
import Button from '../../components/common/Button'
import CloseIcon from '../../components/icons/CloseIcon'
import { MOCK_PRODUCTS } from '../home/products'
import { useWishStore } from '../../store/wishStore'
import type { WishType } from '../../store/wishStore'

const WISH_TYPE_OPTIONS: { type: WishType; label: string }[] = [
  { type: 'receive', label: '받고 싶은' },
  { type: 'give', label: '주고 싶은' },
]

const NAME_MAX_LENGTH = 20

/**
 * 위시 수정하기 (피그마 기준). 지금은 API 연동 전이라 mock 상품 데이터로 초기값을 채우고,
 * "수정 완료"를 눌러도 실제로 저장되지는 않습니다 (TODO: API 연동 후 실제 수정 요청으로 교체).
 */
export default function WishEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const product = MOCK_PRODUCTS.find((p) => p.id === Number(id))
  // TODO: 위시 등록 자체가 아직 API 연동 전이라(useWishStore 참고) 여기서 읽어오는 위시 유형도 로컬 상태 기준입니다.
  const { wishes } = useWishStore()

  const initialWishType = wishes[Number(id)] ?? 'receive'
  const initialName = product?.name ?? ''
  const initialPrice = product ? String(product.price) : ''
  const initialPurchaseUrl = ''
  const initialImage = product?.image ?? null

  const [wishType, setWishType] = useState<WishType>(initialWishType)
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice)
  const [purchaseUrl, setPurchaseUrl] = useState(initialPurchaseUrl)
  const [image, setImage] = useState<string | null>(initialImage)

  // 피그마 기준: 필수값이 채워져 있어도 실제로 바뀐 내용이 없으면 "수정 완료"는 비활성 상태를 유지합니다.
  const hasChanges =
    wishType !== initialWishType ||
    name !== initialName ||
    price !== initialPrice ||
    purchaseUrl !== initialPurchaseUrl ||
    image !== initialImage
  const isValid = name.length > 0 && price.length > 0 && hasChanges

  const handleSubmit = () => {
    // TODO: 위시 수정 API 연동 후 실제 저장 요청으로 교체 (wishType 변경분은 위시 등록 API와도 함께 연동 필요)
    navigate(-1)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="위시 수정하기" />

      <div className="flex flex-col gap-4 px-[18px] pt-4">
        <div className="flex flex-col gap-2">
          <label className="text-b1-m text-black">
            위시 유형 <span className="text-pink-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {WISH_TYPE_OPTIONS.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => setWishType(option.type)}
                className={`rounded-full px-4 py-2 text-b2-m ${
                  wishType === option.type ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <TextField
          label={
            <>
              선물 이름 <span className="text-pink-500">*</span>
            </>
          }
          value={name}
          maxLength={NAME_MAX_LENGTH}
          onChange={(e) => setName(e.target.value)}
          placeholder="선물 이름을 입력해 주세요"
        />

        <TextField
          label={
            <>
              선물 가격 <span className="text-pink-500">*</span>
            </>
          }
          value={price ? Number(price).toLocaleString() : ''}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
          suffix="원"
          inputMode="numeric"
          placeholder="선물 가격을 입력해 주세요"
        />

        <TextField
          label="선물 구매처 링크"
          value={purchaseUrl}
          onChange={(e) => setPurchaseUrl(e.target.value)}
          placeholder="구매처 링크를 입력해 주세요"
        />

        <div className="flex flex-col gap-2">
          <label className="text-b1-m text-black">선물 이미지</label>
          {image ? (
            <div className="relative size-[123px] overflow-hidden rounded-2xl bg-background">
              <img src={image} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <button
                  type="button"
                  aria-label="이미지 삭제"
                  onClick={() => setImage(null)}
                  className="flex size-8 items-center justify-center rounded-2xl bg-gray-100 shadow-md"
                >
                  <CloseIcon className="size-[21px] text-black" />
                </button>
              </div>
            </div>
          ) : (
            // TODO: 이미지 업로드 API가 없어 지금은 다시 추가하는 UI를 만들지 않았습니다.
            <div className="flex size-[123px] items-center justify-center rounded-2xl bg-background text-caption1-r text-gray-400">
              이미지 없음
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto px-[18px] pb-8 pt-4">
        <Button disabled={!isValid} onClick={handleSubmit}>
          수정 완료
        </Button>
      </div>
    </div>
  )
}
