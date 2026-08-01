import type { GiftCandidateItem } from '../../api/groupFundings'

interface Props {
  candidates: GiftCandidateItem[]
  selectedGiftId: number | null
  onSelect: (id: number) => void
}

export default function ConfirmStep1({ candidates, selectedGiftId, onSelect }: Props) {
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="flex flex-col gap-4 px-[18px] pb-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3-sb text-black">1. 선물 확정하기</h2>
        <p className="text-b1-m text-black">최종 선물</p>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map(candidate => {
          const isSelected = selectedGiftId === candidate.fundingGiftId
          return (
            <button
              key={candidate.fundingGiftId}
              type="button"
              onClick={() => onSelect(candidate.fundingGiftId)}
              className={`flex items-center gap-3 rounded-xl border px-[14px] py-3 transition-colors ${
                isSelected ? 'border-gray-900' : 'border-gray-100'
              }`}
            >
              {/* 선물 이미지 */}
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

              {/* 선물 정보 */}
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-caption1-r text-gray-700">{candidate.voteCount}표</span>
                <span className="text-left text-b2-m text-black line-clamp-1">{candidate.giftName}</span>
                <span className="text-b2-m text-pink-500">{candidate.giftPrice.toLocaleString()}원</span>
              </div>

              {/* 라디오 버튼 */}
              <div className="shrink-0">
                {isSelected ? (
                  <div className="flex size-4 items-center justify-center rounded-full border border-gray-900 bg-white">
                    <div className="size-2.5 rounded-full bg-gray-900" />
                  </div>
                ) : (
                  <div className="size-4 rounded-full border border-gray-300 bg-background-2" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
