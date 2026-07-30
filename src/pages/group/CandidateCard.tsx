const RANK_COLORS: Record<number, string> = {
  1: 'bg-pink-500 text-white',
  2: 'bg-gray-900 text-white',
  3: 'bg-gray-900 text-white',
}

interface CandidateCardProps {
  candidate: {
    giftName: string
    giftPrice: number
    giftImageUrl: string | null
    voteCount: number
  }
  rank: number
}

export default function CandidateCard({ candidate, rank }: CandidateCardProps) {
  const rankBadge = RANK_COLORS[rank]

  return (
    <div className="flex w-full flex-col items-center rounded-[18px] border border-gray-100 p-[10px]">
      {/* 이미지 */}
      <div className="relative flex size-[154px] shrink-0 items-center justify-center rounded-xl bg-background">
        {candidate.giftImageUrl ? (
          <img
            src={candidate.giftImageUrl}
            alt={candidate.giftName}
            className="size-full rounded-xl object-cover"
          />
        ) : (
          <div className="size-full rounded-xl bg-background" />
        )}
      </div>

      {/* 정보 */}
      <div className="mt-2 flex w-full flex-col gap-[3.5px]">
        <div className="flex items-center gap-2">
          {rankBadge && (
            <span className={`rounded-full px-[8px] py-[2px] text-caption2-m ${rankBadge}`}>
              {rank}위
            </span>
          )}
          <span className="text-caption2-m text-gray-600">{candidate.voteCount}명 투표</span>
        </div>
        <p className="text-caption1-m leading-snug text-black line-clamp-2">{candidate.giftName}</p>
        <p className="text-caption1-m text-black">{candidate.giftPrice.toLocaleString()}원</p>
      </div>
    </div>
  )
}
