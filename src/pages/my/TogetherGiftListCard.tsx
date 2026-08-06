import type { MyFunding } from '../../api/users'
import togetLogo from '../../assets/toget-logo.svg'
import LinkIcon from '../../components/icons/LinkIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import FundingStatusBadge from './FundingStatusBadge'

interface TogetherGiftListCardProps {
  funding: MyFunding
  onOpen: () => void
  onShareInvite: () => void
}

/** 마이페이지 '함께 선물 페이지' 목록 카드 (MyGiftListCard와 동일 규격, 버튼은 상태와 무관하게 항상 초대장 공유) */
export default function TogetherGiftListCard({ funding, onOpen, onShareInvite }: TogetherGiftListCardProps) {
  const isEnded = funding.status === 'ENDED'
  const gaugePercent = Math.min(funding.progressRate, 100)
  const dimClass = isEnded ? 'opacity-60' : ''

  return (
    <div className="flex w-full shrink-0 flex-col gap-5 rounded-xl border border-gray-100 bg-white px-3.5 py-3">
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <span
          className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background ${dimClass}`}
        >
          <img
            src={funding.thumbnailImageUrl ?? togetLogo}
            alt=""
            className={funding.thumbnailImageUrl ? 'size-full object-cover' : 'h-[52px] w-[48px] object-contain'}
          />
        </span>
        <div className="flex w-[246px] flex-col gap-[18px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className={`flex min-w-0 flex-col gap-1 ${dimClass}`}>
                <p className="truncate text-b2-m text-black">{funding.title}</p>
                <p className="truncate text-caption1-r text-gray-700">
                  목표 {funding.targetAmount.toLocaleString()}원
                </p>
              </div>
              <FundingStatusBadge isEnded={isEnded} />
            </div>
            <ChevronRightIcon className="size-6 shrink-0 text-black" />
          </div>
          <div className={`flex flex-col gap-1 ${dimClass}`}>
            <div className="h-[5px] w-full rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-pink-500" style={{ width: `${gaugePercent}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption2-r text-gray-700">{gaugePercent}% 달성</span>
              <span className="text-caption2-r text-gray-700">
                <span className="font-semibold">{funding.collectedAmount.toLocaleString()}</span>원 모였어요
              </span>
            </div>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onShareInvite}
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-100 px-2.5 py-2"
      >
        <LinkIcon className="size-5 text-black" />
        <span className="text-caption1-m text-black">초대장 공유</span>
      </button>
    </div>
  )
}
