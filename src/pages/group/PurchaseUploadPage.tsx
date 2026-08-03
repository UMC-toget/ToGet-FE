import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import PlusIcon from '../../components/icons/PlusIcon'
import PhotoActionSheet from '../../components/create/PhotoActionSheet'

// 접근: 개설자 (HOST) | ENDED 상태에서 선물별 구매내역(링크·이미지) 업로드
export default function PurchaseUploadPage() {
  const navigate = useNavigate()

  const [link, setLink] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)

  const canSubmit = link.trim().length > 0 || imagePreview !== null

  const handlePhotoSelect = (file: File) => {
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    // TODO: 구매내역 업로드 API 연동 (링크 + 이미지)
    navigate(-1)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="구매내역 업로드" />

      <div className="flex flex-1 flex-col gap-6 px-[18px] pt-7">
        {/* 타이틀 */}
        <div className="flex flex-col gap-1">
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
              onChange={e => setLink(e.target.value)}
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
        <Button disabled={!canSubmit} onClick={handleSubmit}>
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
