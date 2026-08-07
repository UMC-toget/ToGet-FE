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
  // 웹(마우스)에서 Shift+휠 없이도 클릭+드래그로 가로 스크롤할 수 있게 합니다. 드래그로 확정되기
  // 전(=아직 클릭일 수도 있는 상태)에는 pointer capture를 걸지 않아야 카드 클릭이 그대로 통과합니다.
  const dragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; dragging: boolean } | null>(
    null,
  )
  const draggedRef = useRef(false)

  if (fundings.length === 0) return null

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || fundings.length <= 1) return
    const el = scrollRef.current
    if (!el) return
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startScrollLeft: el.scrollLeft, dragging: false }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const el = scrollRef.current
    if (!drag || !el) return
    const deltaX = e.clientX - drag.startX

    if (!drag.dragging) {
      if (Math.abs(deltaX) <= 3) return
      // 드래그로 확정되는 순간에만 pointer capture + 스냅 없이 1:1로 손을 따라오게 전환.
      // snap-mandatory를 켜둔 채로 scrollLeft를 스크립트로 바꾸면, 브라우저가 이걸 "제스처 도중"이
      // 아니라 매번 끝난 스크롤로 취급해 손 움직임마다 카드 경계로 즉시 재스냅해버립니다.
      drag.dragging = true
      draggedRef.current = true
      el.setPointerCapture(drag.pointerId)
      el.style.scrollBehavior = 'auto'
      el.style.scrollSnapType = 'none'
    }

    // 텍스트 선택(파란 하이라이트)이 드래그 도중 같이 걸리면 스크롤이 안 움직이는 것처럼 보입니다
    e.preventDefault()
    el.scrollLeft = drag.startScrollLeft - deltaX
  }

  const handlePointerUp = () => {
    const el = scrollRef.current
    const wasDragging = dragRef.current?.dragging
    dragRef.current = null
    if (!el) return
    el.style.scrollBehavior = ''
    el.style.scrollSnapType = ''
    if (!wasDragging || el.clientWidth === 0) return
    // 브라우저가 스크립트로 바꾼 scrollLeft는 CSS 스냅의 "관성 정지" 감지를 안 타는 경우가 많아,
    // 가장 가까운 카드로 직접 smooth scrollTo 해서 Shift+휠과 같은 스냅 애니메이션을 재현합니다.
    const targetIndex = Math.round(el.scrollLeft / el.clientWidth)
    el.scrollTo({ left: targetIndex * el.clientWidth, behavior: 'smooth' })
  }

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      draggedRef.current = false
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h3-sb text-black">진행 중인 내 선물 모으기</h2>
      <div className="flex flex-col items-center gap-2">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          className="no-scrollbar flex w-full select-none snap-x snap-mandatory overflow-x-auto scroll-smooth cursor-grab active:cursor-grabbing"
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
