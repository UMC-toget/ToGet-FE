import type { GiftCandidateItem } from '../../api/groupFundings'

// ConfirmPage 서브 컴포넌트 (개설자 전용) | 1단계 선물 확정하기 — 투표 결과 보고 최종 선물 선택
interface Props {
  candidates: GiftCandidateItem[]
  selectedGiftId: number | null
  onSelect: (id: number) => void
}

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) return null
  return (
    <span
      className={`inline-flex h-4 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white ${
        rank === 1 ? 'bg-pink-500' : 'bg-gray-900'
      }`}
    >
      {rank}위
    </span>
  )
}

export default function ConfirmStep1({ candidates, selectedGiftId, onSelect }: Props) {
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="flex flex-col px-[18px] pb-4">
      <h2 className="text-h3-sb text-black">1. 선물 확정하기</h2>
      <p className="mt-5 text-b1-m text-black">최종 선물</p>

      <div className="mt-3 flex flex-col gap-3">
        {sorted.map((candidate, index) => {
          const rank = index + 1
          const isSelected = selectedGiftId === candidate.fundingGiftId
          return (
            <button
              key={candidate.fundingGiftId}
              type="button"
              onClick={() => onSelect(candidate.fundingGiftId)}
              className="relative flex items-center gap-3 rounded-xl border border-gray-100 py-3 pl-3 pr-[52px]"
            >
              <div className="size-[63px] shrink-0 overflow-hidden rounded-md bg-background">
                {candidate.giftImageUrl ? (
                  <img
                    src={candidate.giftImageUrl}
                    alt={candidate.giftName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gray-100" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <RankBadge rank={rank} />
                  <span className="text-caption1-r text-gray-700">{candidate.voteCount}표</span>
                </div>
                <span className="text-left text-b2-m text-black line-clamp-1">{candidate.giftName}</span>
                <span className="text-left text-b2-m text-black">{candidate.giftPrice.toLocaleString()}원</span>
              </div>

              {isSelected ? (
                <div className="absolute right-[22px] top-[18px] flex size-6 items-center justify-center rounded-full border border-pink-500 bg-background">
                  <div className="size-3 rounded-full bg-pink-500" />
                </div>
              ) : (
                <div className="absolute right-[22px] top-[18px] flex size-6 items-center justify-center rounded-full bg-gray-100">
                  <div className="size-4 rounded-full bg-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
