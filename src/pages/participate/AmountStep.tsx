import type { FundingDetail } from '../../types/funding'
import { getRecommendedAmounts } from '../../utils/recommendAmounts'
import ProgressCard from '../funding/ProgressCard'

interface AmountStepProps {
  funding: FundingDetail
  /** 선택/입력된 금액. null=미선택, 0=금액 없이 참여 */
  amount: number | null
  onAmountChange: (amount: number | null) => void
}

/** E03 3단계: 참여 금액 선택 (피그마 #1714:68406) */
export default function AmountStep({ funding, amount, onAmountChange }: AmountStepProps) {
  const recommended = getRecommendedAmounts(new Date(funding.anniversaryDate))
  // 직접 입력 중에는 '원' 없이 숫자만 표시 (디자인 기준)
  const formatted = amount != null && amount > 0 ? amount.toLocaleString() : ''

  const handleInput = (value: string) => {
    // 앞자리 0 제거 (D 섹션 가격 입력의 '첫 숫자 1~9' 규칙과 동일) — '0'만 입력해도 미선택 유지
    const digits = value.replace(/[^0-9]/g, '').replace(/^0+/, '')
    onAmountChange(digits === '' ? null : Number(digits))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3-sb leading-normal text-black">3. 참여 금액 선택</h2>
          <p className="text-caption1-r leading-normal text-gray-600">
            선택한 금액은 {funding.hostName}님의 선물 준비에 사용돼요
          </p>
        </div>
        <ProgressCard funding={funding} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-b1-m leading-normal text-black">참여 금액</p>
          <input
            inputMode="numeric"
            value={formatted}
            placeholder="직접 입력하기(원)"
            onChange={(e) => handleInput(e.target.value)}
            className="h-12 rounded-lg bg-background px-4 text-b1-m text-black caret-pink-500 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-b1-m leading-normal text-gray-800">금액추천</p>
            <p className="text-caption1-r leading-normal text-gray-600">특별한 날의 숫자를 담았어요</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-1">
              {recommended.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onAmountChange(value)}
                  className={`flex h-[42px] items-center justify-center rounded-lg border text-caption1-m font-semibold ${
                    amount === value
                      ? 'border-gray-700 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {value.toLocaleString()}원
                </button>
              ))}
            </div>
            {/* TODO: 금액 없이 참여 시 4단계 스킵 여부 기획 확인 필요 — 현재는 4단계에서 계좌 섹션만 숨김 */}
            <button
              type="button"
              onClick={() => onAmountChange(0)}
              className={`flex h-[42px] items-center justify-center rounded-lg border text-caption1-m font-semibold ${
                amount === 0 ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              금액 없이 축하 메세지만 남기기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
