import { useState } from 'react'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import PhotoActionSheet from '../../components/common/PhotoActionSheet'
import Toast from '../../components/common/Toast'
import PhotoCropOverlay from './PhotoCropOverlay'
import plusIcon from '../../assets/icon-plus.svg'

const ERROR_TOAST_DURATION_MS = 2000
const LOAD_ERROR_MESSAGE = '사진을 불러오지 못했어요. 다시 시도해 주세요.'

interface ProfileAvatarProps {
  /** 이미 저장된 프로필 이미지 URL (있으면 초기 아바타로 표시) */
  imageUrl?: string | null
  /** 크롭 완료 후 File 객체 전달 */
  onSelect?: (file: File) => void
}

/**
 * 프로필 사진 선택 아바타. 클릭하면 사진 등록 방식을 고르는 바텀시트가 열리고,
 * 사진을 고르면 원형 자르기 화면으로 이동합니다. 자르기를 완료하면 즉시 미리보기로 반영됩니다.
 *
 * 바텀시트 자체는 공통 컴포넌트 PhotoActionSheet를 쓰지만, 자르기 화면만은 프로필 사진 전용
 * 원형 크롭(PhotoCropOverlay)을 renderCropper로 꽂아 넣어 그대로 유지합니다.
 */
export default function ProfileAvatar({ imageUrl, onSelect }: ProfileAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [errorToastMessage, setErrorToastMessage] = useState<string | null>(null)

  const showError = (message: string) => {
    setErrorToastMessage(message)
    setTimeout(() => setErrorToastMessage(null), ERROR_TOAST_DURATION_MS)
  }

  const handleSelect = (file: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    onSelect?.(file)
  }

  const displayUrl = previewUrl ?? imageUrl

  return (
    <>
      <button
        type="button"
        aria-label="프로필 사진 선택"
        onClick={() => setSheetOpen(true)}
        className="relative size-[90px]"
      >
        {displayUrl ? (
          <img src={displayUrl} alt="프로필 사진 미리보기" className="size-full rounded-full object-cover" />
        ) : (
          <DefaultAvatar className="size-[90px]" />
        )}
        <span className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-pink-500">
          <img src={plusIcon} alt="" className="w-2.5" />
        </span>
      </button>

      {sheetOpen && (
        <PhotoActionSheet
          onClose={() => setSheetOpen(false)}
          onSelect={handleSelect}
          renderCropper={({ file, onCancel, onConfirm }) => (
            <PhotoCropOverlay
              file={file}
              onCancel={onCancel}
              onConfirm={(blob) => onConfirm(new File([blob], 'profile.jpg', { type: 'image/jpeg' }))}
              onError={() => {
                onCancel()
                showError(LOAD_ERROR_MESSAGE)
              }}
            />
          )}
        />
      )}

      <Toast open={errorToastMessage !== null} message={errorToastMessage ?? ''} />
    </>
  )
}
