import envelopeHeart from '../../assets/envelope-heart.svg'

interface EnvelopeButtonProps {
  /** 봉투 아래 표시할 이름 (지은 / 익명 / 비공개). null이면 라벨 미표시 (이름 공개 OFF) */
  label: string | null
  /** 탭해서 편지를 열 수 있는지 (내용 공개 OFF·비공개 편지는 참여자가 못 엶) */
  canOpen: boolean
  onOpen: () => void
  /** sm: 홈 미리보기(60×45, 10px) / lg: 전체보기(74.8×56.1, 12px) */
  size?: 'sm' | 'lg'
}

/** 축하 메세지 봉투 (탭하면 편지 팝업) */
export default function EnvelopeButton({ label, canOpen, onOpen, size = 'sm' }: EnvelopeButtonProps) {
  const isLg = size === 'lg'
  return (
    <button
      type="button"
      disabled={!canOpen}
      onClick={onOpen}
      className={`flex shrink-0 flex-col gap-1 ${isLg ? 'w-[74.8px]' : 'w-[60px]'}`}
    >
      <img src={envelopeHeart} alt="" className={`w-full ${isLg ? 'h-[56.1px]' : 'h-[45px]'}`} />
      {label != null && (
        <span className={`w-full text-center leading-normal text-gray-600 ${isLg ? 'text-caption1-m' : 'text-caption2-m'}`}>{label}</span>
      )}
    </button>
  )
}
