import { useRef } from 'react'
import type { MyFundingSummary } from '../../types/funding'
import { getDdayLabel } from '../../utils/formatDate'
import { truncateText } from '../../utils/truncateText'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import LinkIcon from '../../components/icons/LinkIcon'
import fundingCardFallback from '../../assets/funding-card-empty.svg'
import { useImageHasBackground } from '../../hooks/useImageHasBackground'

const TITLE_MAX_LENGTH = 12

interface MyFundingCardProps {
  funding: MyFundingSummary
  onOpen: () => void
  onShareInvite: () => void
}

/** 홈 '진행 중인 내 선물 모으기' 카드 (피그마 #1706:62326) */
export default function MyFundingCard({ funding, onOpen, onShareInvite }: MyFundingCardProps) {
  const dDayLabel = getDdayLabel(funding.anniversaryDate)
  const imgRef = useRef<HTMLImageElement>(null)
  const hasBackground = useImageHasBackground(imgRef, funding.thumbnailImage || null)

  return (
    <div className="flex w-full shrink-0 flex-col gap-5 rounded-xl border border-gray-100 bg-white px-3.5 py-3">
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 text-left">
        <span
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background"
        >
          {funding.thumbnailImage ? (
            <img
              ref={imgRef}
              src={funding.thumbnailImage}
              alt=""
              draggable={false}
              crossOrigin="anonymous"
              className={hasBackground ? 'size-full object-cover' : 'h-[52px] w-[48px] object-cover'}
            />
          ) : (
            <img src={fundingCardFallback} alt="" className="size-full object-cover" />
          )}
        </span>
        <div className="flex flex-1 flex-col gap-[18px]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex shrink-0 flex-col gap-[9px]">
              <div className="flex items-center gap-2">
                <p className="whitespace-nowrap text-b2-m text-black">
                  {truncateText(funding.title, TITLE_MAX_LENGTH)}
                </p>
                {dDayLabel && (
                  <span className="shrink-0 rounded-full bg-pink-100/50 px-2 py-1 text-caption2-m text-pink-500">
                    {dDayLabel}
                  </span>
                )}
              </div>
              <p className="whitespace-nowrap text-caption1-r text-gray-700">
                목표 {funding.targetAmount.toLocaleString()}원
              </p>
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
