import { useRef } from 'react'
import BottomSheet from '../../components/common/BottomSheet'

export type ImageSourceType = 'web' | 'library' | 'camera' | 'file'

interface ImageSelectSheetProps {
  open: boolean
  onClose: () => void
  onSelectOption?: (option: ImageSourceType) => void
  onFileSelect: (file: File) => void
}

const OPTIONS: { type: ImageSourceType; label: string }[] = [
  { type: 'web', label: '웹 사진 검색' },
  { type: 'library', label: '사진 보관함' },
  { type: 'camera', label: '사진 찍기' },
  { type: 'file', label: '파일 선택' },
]

/** 이미지 등록 방식 선택 바텀시트 (피그마 1753:107550 / 1859:39019 기준) */
export default function ImageSelectSheet({
  open,
  onClose,
  onSelectOption,
  onFileSelect,
}: ImageSelectSheetProps) {
  const libraryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOptionClick = (type: ImageSourceType) => {
    onSelectOption?.(type)
    if (type === 'web') {
      // 웹 사진 검색 클릭 시 아직은 아무런 동작도 하지 않음
      onClose()
    } else if (type === 'library') {
      libraryInputRef.current?.click()
    } else if (type === 'camera') {
      cameraInputRef.current?.click()
    } else if (type === 'file') {
      fileInputRef.current?.click()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
      onClose()
    }
    e.target.value = ''
  }

  return (
    <>
      {/* Hidden native inputs */}
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <BottomSheet open={open} onClose={onClose}>
        <div className="flex w-full flex-col items-start gap-1 pb-4">
          {OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleOptionClick(option.type)}
              className="flex h-12 w-full items-center justify-between px-2 text-left transition-colors hover:bg-gray-50 rounded-xl"
            >
              <span className="text-b1-m text-black font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
