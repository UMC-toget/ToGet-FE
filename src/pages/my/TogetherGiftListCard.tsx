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

/** 마이페이지 '함께 선물 페이지' 목록 카드 (Figma node 2929:138171 — 목표금액/게이지 대신 받는 사람·참여 인원 표시, 버튼은 상태와 무관하게 항상 초대장 공유) */
export default function TogetherGiftListCard({ funding, onOpen, onShareInvite }: TogetherGiftListCardProps) {
  const isEnded = funding.status === 'ENDED'
  const dimClass = isEnded ? 'opacity-60' : ''
  const participantLabel = `${funding.participantCount}명이 함께 준비 중`

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
        <div className="flex w-[246px] items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className={`flex w-[113px] shrink-0 flex-col gap-1 ${dimClass}`}>
              <p className="truncate text-b2-m text-black">{funding.title}</p>
              <p className="truncate text-caption1-r text-gray-700">
                선물 받는 사람 : <span className="text-caption1-m">{funding.recipientName}</span>
              </p>
              <p className="truncate text-caption1-r text-gray-700">{participantLabel}</p>
            </div>
            <FundingStatusBadge isEnded={isEnded} />
          </div>
          <ChevronRightIcon className="size-6 shrink-0 text-black" />
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
