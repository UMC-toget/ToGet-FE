import { useRef, useState } from 'react'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import Toast from '../../components/common/Toast'
import PhotoSourceSheet from './PhotoSourceSheet'
import PhotoCropOverlay from './PhotoCropOverlay'
import plusIcon from '../../assets/icon-plus.svg'

const ERROR_TOAST_DURATION_MS = 2500

interface ProfileAvatarProps {
  /** 크롭 완료 후 File 객체 전달 */
  onSelect?: (file: File) => void
}

/**
 * 프로필 사진 선택 아바타. 클릭하면 사진 등록 방식을 고르는 바텀시트가 열리고,
 * 사진을 고르면 원형 자르기 화면으로 이동합니다. 자르기를 완료하면 즉시 미리보기로 반영됩니다.
 */
export default function ProfileAvatar({ onSelect }: ProfileAvatarProps) {
  const libraryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [errorToastOpen, setErrorToastOpen] = useState(false)

  const showError = () => {
    setErrorToastOpen(true)
    setTimeout(() => setErrorToastOpen(false), ERROR_TOAST_DURATION_MS)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSheetOpen(false)
    setCropFile(file)
  }

  const handleCropConfirm = (blob: Blob) => {
    const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setCropFile(null)
    onSelect?.(file)
  }

  const handleCropError = () => {
    setCropFile(null)
    showError()
  }

  return (
    <>
      <button
        type="button"
        aria-label="프로필 사진 선택"
        onClick={() => setSheetOpen(true)}
        className="relative size-[90px]"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="프로필 사진 미리보기" className="size-full rounded-full object-cover" />
        ) : (
          <DefaultAvatar className="size-[90px]" />
        )}
        <span className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-pink-500">
          <img src={plusIcon} alt="" className="w-2.5" />
        </span>
      </button>

      <input ref={libraryInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <PhotoSourceSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectPhoto={() => libraryInputRef.current?.click()}
        onSelectCamera={() => cameraInputRef.current?.click()}
      />

      {cropFile && (
        <PhotoCropOverlay
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={handleCropConfirm}
          onError={handleCropError}
        />
      )}

      <Toast open={errorToastOpen} message="사진을 불러오지 못했어요. 다시 시도해 주세요." />
    </>
  )
}
