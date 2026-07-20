import envelopeHeart from '../../assets/envelope-heart.svg'

interface EnvelopeButtonProps {
  /** 봉투 아래 표시할 이름 (지은 / 익명 / 비공개). null이면 라벨 미표시 (이름 공개 OFF) */
  label: string | null
  /** 탭해서 편지를 열 수 있는지 (내용 공개 OFF·비공개 편지는 참여자가 못 엶) */
  canOpen: boolean
  onOpen: () => void
}

/** 축하 메세지 봉투 (탭하면 편지 팝업) */
export default function EnvelopeButton({ label, canOpen, onOpen }: EnvelopeButtonProps) {
  return (
    <button
      type="button"
      disabled={!canOpen}
      onClick={onOpen}
      className="flex w-[60px] shrink-0 flex-col gap-1"
    >
      <img src={envelopeHeart} alt="" className="h-[45px] w-full" />
      {label != null && <span className="w-full text-center text-caption2-m leading-normal text-gray-600">{label}</span>}
    </button>
  )
}
