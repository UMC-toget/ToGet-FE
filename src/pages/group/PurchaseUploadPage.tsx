import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import PlusIcon from '../../components/icons/PlusIcon'
import PhotoActionSheet from '../../components/common/PhotoActionSheet'
import { getTogetherGiftDashboard, postGiftPurchase } from '../../api/groupFundings'
import { uploadImage } from '../../utils/uploadImage'
import { sanitizePurchaseUrl } from '../../utils/sanitizePurchaseUrl'
import { MOCK_DASHBOARD } from './groupMock'

const PURCHASE_IMAGE_PREFIX = 'purchases'

// 접근: 개설자 (HOST) | ENDED 상태에서 선물별 구매내역(링크·이미지) 업로드
export default function PurchaseUploadPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [link, setLink] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [giftId, setGiftId] = useState<number | null>(null)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 구매내역은 선물별로 등록 — 확정된 선물 id를 대시보드에서 가져옴
  useEffect(() => {
    if (!id) return
    getTogetherGiftDashboard(id)
      .then(d => setGiftId(d.confirmedGifts?.[0]?.fundingGiftId ?? null))
      .catch(() => {
        if (import.meta.env.DEV) setGiftId(MOCK_DASHBOARD.confirmedGifts?.[0]?.fundingGiftId ?? null)
      })
  }, [id])

  // BE 스펙상 구매링크·영수증 이미지 둘 다 필수 + 등록 대상 giftId가 있어야 함
  // (giftId 미로딩/조회 실패면 버튼 비활성 → 업로드 없이 뒤로가는 가짜 성공 방지)
  const canSubmit = link.trim().length > 0 && imageFile !== null && giftId !== null

  const handlePhotoSelect = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      if (!import.meta.env.DEV && id && giftId != null && imageFile) {
        const receiptImageUrl = await uploadImage(PURCHASE_IMAGE_PREFIX, imageFile)
        await postGiftPurchase(id, giftId, { purchaseUrl: link.trim(), receiptImageUrl })
      }
      navigate(-1)
    } catch (e) {
      console.error('구매내역 업로드 실패', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="구매내역 업로드" />

      <div className="flex flex-1 flex-col gap-6 px-[18px] pt-7">
        {/* 타이틀 */}
        <div className="flex flex-col gap-2">
          <h2 className="text-h3-sb text-black">구매내역 업로드</h2>
          <p className="text-caption1-r text-gray-600">펀딩금액으로 구매한 선물내역을 공유해주세요.</p>
        </div>

        {/* 구매링크 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">구매링크</p>
          <div className="flex h-12 items-center rounded-lg bg-background px-4">
            <input
              type="url"
              value={link}
              onChange={e => setLink(sanitizePurchaseUrl(e.target.value))}
              placeholder="상품을 구매한 구매처의 링크를 적어주세요."
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 구매내역 이미지 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">구매내역 이미지</p>
          <button
            type="button"
            onClick={() => setShowPhotoSheet(true)}
            className="flex size-[123px] items-center justify-center overflow-hidden rounded-2xl bg-background"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="구매내역 이미지" className="size-full object-cover" />
            ) : (
              <PlusIcon className="size-8 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* 하단 저장하기 */}
      <div className="px-[18px] pb-8">
        <Button disabled={!canSubmit || submitting} onClick={handleSubmit}>
          저장하기
        </Button>
      </div>

      {showPhotoSheet && (
        <PhotoActionSheet
          onClose={() => setShowPhotoSheet(false)}
          onSelect={handlePhotoSelect}
          aspectRatio={1}
        />
      )}
    </div>
  )
}
