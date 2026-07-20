import avatarCat from '../../assets/avatar-cat.svg'

interface DefaultAvatarProps {
  /** 원형 배경의 크기를 지정합니다 (예: "size-[90px]") */
  className?: string
}

/**
 * 기본 프로필 아바타: 그라데이션 원 배경 + 리본 로고.
 * 리본 로고는 피그마 배치 그대로 비균등 스트레치로 렌더링해야 좌우 중앙이 정확히 맞습니다
 * (SVG 원본 비율을 그대로 유지하면 살짝 오른쪽으로 치우쳐 보입니다).
 */
export default function DefaultAvatar({ className = 'size-full' }: DefaultAvatarProps) {
  return (
    <span
      className={`relative flex overflow-hidden rounded-full bg-gradient-to-t from-[#1e1d1e] from-[76.6%] to-[#3c393c] ${className}`}
    >
      <img
        src={avatarCat}
        alt=""
        className="absolute"
        style={{ top: '30.49%', right: '15.92%', bottom: '27.66%', left: '14.6%' }}
      />
    </span>
  )
}
