import { useRef, useState } from 'react'
import DefaultAvatar from '../../components/common/DefaultAvatar'
import plusIcon from '../../assets/icon-plus.svg'

interface ProfileAvatarProps {
  /** 사진 선택 시 File 객체 전달 */
  onSelect?: (file: File) => void
}

/** 프로필 사진 선택 아바타. 클릭 시 파일 선택이 열리고 선택한 사진이 원형으로 표시됩니다. */
export default function ProfileAvatar({ onSelect }: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    onSelect?.(file)
  }

  return (
    <button
      type="button"
      aria-label="프로필 사진 선택"
      onClick={() => inputRef.current?.click()}
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
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </button>
  )
}
