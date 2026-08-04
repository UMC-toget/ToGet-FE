import type { ConfirmedGift } from './ConfirmPage'

// ConfirmPage 서브 컴포넌트 (개설자 전용) | 3단계 금액 확정하기 — 인당 정산 금액 확인
interface Props {
  confirmedGifts: ConfirmedGift[]
  includedCount: number
  onEditGifts: () => void
}

export default function ConfirmStep3({ confirmedGifts, includedCount, onEditGifts }: Props) {
  const totalAmount = confirmedGifts.reduce((sum, g) => sum + g.price, 0)
  const myShare = includedCount > 0 ? Math.ceil(totalAmount / includedCount) : 0

  return (
    <div className="flex flex-col gap-5 px-[18px] pb-4">
      <h2 className="text-h3-sb text-black">3. 금액 확정하기</h2>

      {/* 최종 선물 목록 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-b1-m text-black">최종 선물 목록</p>
          <button
            type="button"
            onClick={onEditGifts}
            className="flex h-5 items-center rounded px-[10px] text-caption2-m text-white bg-gray-900"
          >
            수정하기
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {confirmedGifts.map(gift => (
            <div
              key={gift.id}
              className="flex flex-col items-start gap-[10px] rounded-xl border border-gray-100 px-[14px] py-3"
            >
              <div className="flex h-[48px] items-center gap-3 self-stretch">
                <div className="size-[48px] shrink-0 overflow-hidden rounded-md bg-background">
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gray-100" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-[10px]">
                  <span
                    className="line-clamp-1 leading-normal text-[#191919]"
                    style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 500 }}
                  >
                    {gift.name}
                  </span>
                  <span className="text-caption1-r text-[#5B565A]">{gift.price.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 정산 금액 */}
      <div className="flex flex-col gap-3">
        <p className="text-b1-m text-black">정산 금액</p>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
          <SettleRow label="총 금액" value={`${totalAmount.toLocaleString()}원`} />
          <div className="h-px w-full bg-gray-100" />
          <SettleRow label="정산 인원" value={`${includedCount}명`} />
          <div className="h-px w-full bg-gray-100" />
          <SettleRow label="내 입금 금액" value={`${myShare.toLocaleString()}원`} highlight />
        </div>
      </div>
    </div>
  )
}

function SettleRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <span className="text-b2-m font-semibold text-[#7F7779]">{label}</span>
      <span className={`text-b2-m font-semibold ${highlight ? 'text-pink-500' : 'text-[#5B565A]'}`}>
        {value}
      </span>
    </div>
  )
}
