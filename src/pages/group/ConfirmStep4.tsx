import type { ConfirmedGift } from './ConfirmPage'
import type { FundingAccount } from '../../api/fundings'
import { BANK_NAME_LABELS } from '../../api/userAccounts'

interface Props {
  confirmedGifts: ConfirmedGift[]
  includedCount: number
  account: FundingAccount | null
}

export default function ConfirmStep4({ confirmedGifts, includedCount, account }: Props) {
  const totalAmount = confirmedGifts.reduce((sum, g) => sum + g.price, 0)
  const myShare = includedCount > 0 ? Math.ceil(totalAmount / includedCount) : 0
  const bankLabel = account ? (BANK_NAME_LABELS[account.bankName] ?? account.bankName) : '-'

  return (
    <div className="flex flex-col gap-5 px-[18px] pb-4">
      <h2 className="text-h3-sb text-black">4. 정산 시작하기</h2>

      {/* 최종 선물 목록 */}
      <div className="flex flex-col gap-3">
        <p className="text-b1-m text-black">최종 선물 목록</p>
        <div className="flex flex-col gap-2">
          {confirmedGifts.map(gift => (
            <div
              key={gift.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
            >
              <div className="size-[48px] shrink-0 overflow-hidden rounded-md bg-background">
                {gift.imageUrl ? (
                  <img src={gift.imageUrl} alt={gift.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-gray-100" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-b2-m text-black line-clamp-1">{gift.name}</span>
                <span className="text-caption1-r text-gray-700">{gift.price.toLocaleString()}원</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 정산 금액 */}
      <div className="flex flex-col gap-3">
        <p className="text-b1-m text-black">정산 금액</p>
        <div className="rounded-xl border border-gray-100 px-4 py-3">
          <div className="flex flex-col gap-3">
            <SettleRow label="총 금액" value={`${totalAmount.toLocaleString()}원`} />
            <div className="h-px bg-gray-100" />
            <SettleRow label="정산 인원" value={`${includedCount}명`} />
            <SettleRow label="내 입금 금액" value={`${myShare.toLocaleString()}원`} highlight />
          </div>
        </div>
      </div>

      {/* 입금 계좌 */}
      <div className="flex flex-col gap-3">
        <p className="text-b1-m text-black">입금계좌</p>
        <div className="rounded-xl border border-gray-100 px-4 py-3">
          <div className="flex flex-col gap-3">
            <AccountRow label="은행" value={bankLabel} />
            <div className="h-px bg-gray-100" />
            <AccountRow label="계좌번호" value={account?.account ?? '-'} />
            <AccountRow label="예금주" value={account?.accountOwner ?? '-'} />
          </div>
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
    <div className="flex items-center justify-between">
      <span className="text-b2-m text-gray-500">{label}</span>
      <span className={`text-b2-m ${highlight ? 'text-pink-500' : 'text-gray-700'}`}>{value}</span>
    </div>
  )
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-b2-m text-gray-500">{label}</span>
      <span className="text-b2-m text-black">{value}</span>
    </div>
  )
}
