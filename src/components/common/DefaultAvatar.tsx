interface DefaultAvatarProps {
  /** 원형 배경의 크기를 지정합니다 (예: "size-[90px]") */
  className?: string
}

/**
 * 기본 프로필 아바타: 연회색 원 (프로필 이미지 없을 때 placeholder).
 */
export default function DefaultAvatar({ className = 'size-full' }: DefaultAvatarProps) {
  return <span className={`inline-block rounded-full bg-background-2 ${className}`} />
}
