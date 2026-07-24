import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MyFundingSummary } from '../../types/funding'
import MyFundingCard from './MyFundingCard'

interface MyFundingsSectionProps {
  fundings: MyFundingSummary[]
  onShareInvite: (funding: MyFundingSummary) => void
}

/**
 * 홈 '진행 중인 내 선물 모으기' 섹션 (피그마 #1706:62306, #1706:62596)
 * 로그인 사용자에게만 노출, 홈에서는 최대 3개까지 노출. 2개 이상이면 한 장씩 스와이프 + 페이지네이션 점 표시.
 */
export default function MyFundingsSection({ fundings, onShareInvite }: MyFundingsSectionProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (fundings.length === 0) return null

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h3-sb text-black">진행 중인 내 선물 모으기</h2>
      <div className="flex flex-col items-center gap-2">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {fundings.map((funding) => (
            <div key={funding.id} className="w-full shrink-0 snap-center">
              <MyFundingCard
                funding={funding}
                // TODO: 개설자 전용 관리 화면이 따로 없어 우선 FundingDetailPage를 owner 모드(?owner=1)로 재사용
                onOpen={() => navigate(`/funding/${funding.id}?owner=1`)}
                onShareInvite={() => onShareInvite(funding)}
              />
            </div>
          ))}
        </div>
        {fundings.length > 1 && (
          <div className="flex items-center gap-1">
            {fundings.map((funding, index) => (
              <span
                key={funding.id}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-8 bg-pink-500' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
