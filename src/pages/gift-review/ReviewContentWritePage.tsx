import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import TextField from '../../components/common/TextField'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import PhotoActionSheet from '../../components/common/PhotoActionSheet'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import CloseIcon from '../../components/icons/CloseIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import { uploadImage } from '../../utils/uploadImage'
import { REVIEW_WRITE_TYPES, REVIEW_TITLE_MAX_LENGTH, REVIEW_CONTENT_MAX_LENGTH } from './reviewTypes'
import type { ReviewWriteType, ReviewContentState } from './reviewTypes'

const REVIEW_IMAGE_PREFIX = 'reviews'
const TOAST_DURATION_MS = 2000

// TODO: E·H 진입점(펀딩 상세/함께 참여)에서 fundingId를 넘겨주기 전까지, 라우트 직접 접근 시 사용할 임시값
const FALLBACK_FUNDING_ID = '1'

/** J파트 작성물 3종 공용 본문 작성 화면 (1단계, /gift/review/write/:type, 피그마 "J01) 후기: 작성" 외) */
export default function ReviewContentWritePage() {
  useRequireAuth()

  const { type, fundingId } = useParams<{ type: string; fundingId?: string }>()
  const resolvedFundingId = fundingId ?? FALLBACK_FUNDING_ID
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toastMessage === null) return
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // images가 바뀔 때만 새로 생성하고, 이전 URL은 해제해서 blob 메모리가 쌓이지 않게 함
  const imageUrls = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images])
  useEffect(() => {
    return () => imageUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [imageUrls])

  const config = type && type in REVIEW_WRITE_TYPES ? REVIEW_WRITE_TYPES[type as ReviewWriteType] : null
  if (!config) return <Navigate to="/home" replace />

  const canSubmit = (!config.showFrom || title.trim() !== '') && content.trim() !== '' && !uploading

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index))

  const handleExit = () => setShowExitModal(true)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setUploading(true)
    try {
      const uploadedImageUrls = await Promise.all(images.map((file) => uploadImage(REVIEW_IMAGE_PREFIX, file)))
      const contentState: ReviewContentState = {
        title: config.showFrom ? title : '',
        content,
        images: uploadedImageUrls,
      }
      navigate(`/gift/review/write/${config.key}/${resolvedFundingId}/invitation`, { state: contentState })
    } catch {
      setToastMessage('이미지 업로드에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header
        title={config.headerTitle}
        onBack={handleExit}
        right={
          <button type="button" onClick={handleExit} className="text-b2-m text-black">
            나가기
          </button>
        }
      />

      <div className="flex flex-col gap-6 px-[18px] pt-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3-sb text-black">{config.guideTitle}</h2>
          <p className="text-caption1-r text-gray-600">{config.guideDescription}</p>
        </div>

        {config.showFrom && (
          <TextField
            label={config.titleLabel}
            placeholder={config.titlePlaceholder}
            value={title}
            maxLength={REVIEW_TITLE_MAX_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}

        <TextField
          label={config.contentLabel}
          placeholder={config.contentPlaceholder}
          value={content}
          maxLength={REVIEW_CONTENT_MAX_LENGTH}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <p className="text-b1-m text-black">{config.imageLabel}</p>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {images.map((_, i) => (
              <div key={i} className="relative size-[123px] shrink-0 overflow-hidden rounded-2xl">
                <img src={imageUrls[i]} alt={`${config.imageLabel} ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={`${config.imageLabel} 삭제`}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <CloseIcon className="size-3.5" />
                </button>
              </div>
            ))}
            {images.length < config.maxImages && (
              <button
                type="button"
                onClick={() => setShowPhotoSheet(true)}
                aria-label={`${config.imageLabel} 추가`}
                className="flex size-[123px] shrink-0 items-center justify-center rounded-2xl bg-background"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                  <PlusIcon className="size-5 text-gray-600" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button className="pointer-events-auto" disabled={!canSubmit} onClick={handleSubmit}>
          후기 작성 완료
        </Button>
      </div>

      {showPhotoSheet && (
        <PhotoActionSheet
          aspectRatio={1}
          onClose={() => setShowPhotoSheet(false)}
          onSelect={(file) => setImages((prev) => [...prev, file])}
        />
      )}

      {/* 피그마 상 좌측이 나가기, 우측이 이어서 작성하기라 cancel/confirm이 평소와 반대로 매핑됨 (참여 흐름과 동일한 관례) */}
      <ConfirmModal
        open={showExitModal}
        title="페이지를 나가시겠어요?"
        description={'지금 나가면, 작성 중인 내용이\n사라질 수 있어요'}
        cancelText="나가기"
        confirmText="이어서 작성하기"
        onCancel={() => navigate('/home')}
        onConfirm={() => setShowExitModal(false)}
      />

      <Toast open={toastMessage !== null} message={toastMessage ?? ''} standalone />
    </div>
  )
}
