import fundingCardFallback from '../../assets/funding-card-empty.svg'

interface GiftPagePreviewCardProps {
  title: string
  /** YYYY.MM.DD 등 이미 포맷된 날짜 문자열 */
  date: string
  thumbnailUrl: string | null
}

/** 후기 작성 1단계 상단에 노출하는, 후기 대상 선물 페이지 요약 카드 (읽기전용) */
export default function GiftPagePreviewCard({ title, date, thumbnailUrl }: GiftPagePreviewCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3.5 py-3">
      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
        <img src={thumbnailUrl ?? fundingCardFallback} alt="" className="size-full object-cover" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-b2-m text-black">{title}</p>
        <p className="text-caption1-r text-gray-700">{date}</p>
      </div>
    </div>
  )
}
