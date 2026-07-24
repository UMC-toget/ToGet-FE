import type { MyFundingSummary } from '../../types/funding'
import { getDdayLabel } from '../../utils/formatDate'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import LinkIcon from '../../components/icons/LinkIcon'

interface MyFundingCardProps {
  funding: MyFundingSummary
  onOpen: () => void
  onShareInvite: () => void
}

/** 홈 '진행 중인 내 선물 모으기' 카드 (피그마 #1706:62326) */
export default function MyFundingCard({ funding, onOpen, onShareInvite }: MyFundingCardProps) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-5 rounded-xl border border-gray-100 bg-white px-3.5 py-3">
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-background">
          <img src={funding.thumbnailImage} alt="" className="h-[52px] w-[48px] object-contain" />
        </span>
        <div className="flex flex-1 flex-col gap-[18px]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-b2-m text-black">{funding.title}</p>
                <p className="text-caption1-r text-gray-700">목표 {funding.targetAmount.toLocaleString()}원</p>
              </div>
              <span className="shrink-0 rounded-full bg-pink-100/50 px-2 py-0.5 text-caption2-m text-pink-500">
                {getDdayLabel(funding.anniversaryDate)}
              </span>
            </div>
            <ChevronRightIcon className="size-6 shrink-0 text-black" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-[5px] w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-pink-400"
                style={{ width: `${Math.min(funding.gaugePercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption2-r text-gray-700">{funding.gaugePercent}% 달성</span>
              <span className="text-caption2-r text-gray-700">
                <span className="font-semibold">{funding.currentAmount.toLocaleString()}</span>원 모였어요
              </span>
            </div>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onShareInvite}
        className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-2.5 py-2"
      >
        <LinkIcon className="size-5 text-black" />
        <span className="text-caption1-m text-black">초대장 공유</span>
      </button>
    </div>
  )
}
