import { useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'

interface DragRange {
  /** 뷰포트 상단 ~ 시트 상단까지 거리(px). 처음 열렸을 때(peek) 값 */
  peekOffsetPx: number
  /** 뷰포트 상단 ~ 시트 상단까지 거리(px). 위로 끝까지 당겼을 때(expanded) 값 */
  expandedOffsetPx: number
}

interface BottomSheetProps {
  open: boolean
  /** 딤 영역 클릭 시 호출 */
  onClose: () => void
  /** 시트 상단 라운드 크기. 기본 md(25px), 가격 필터 등은 lg(32px) */
  radius?: 'md' | 'lg'
  /** 시트 최대 높이. half=50vh, auto=콘텐츠 높이만큼(기본) */
  size?: 'half' | 'auto'
  /** 지정하면 size 프리셋 대신 이 높이 클래스를 그대로 씁니다 (예: 특정 화면에 맞춘 정확한 높이) */
  heightClassName?: string
  /** 지정하면 그래버 영역을 위아래로 드래그해서 peekOffsetPx~expandedOffsetPx 사이로 시트 높이를 조절할 수 있습니다 */
  drag?: DragRange
  children: ReactNode
}

interface SheetPanelProps {
  radius: 'md' | 'lg'
  size: 'half' | 'auto'
  heightClassName?: string
  drag?: DragRange
  children: ReactNode
}

/**
 * 실제 시트 패널. open이 true인 동안에만 마운트되므로, 다시 열릴 때마다 드래그 높이 상태가
 * 자연스럽게 초기화됩니다 (peek 상태로 리셋).
 */
function SheetPanel({ radius, size, heightClassName, drag, children }: SheetPanelProps) {
  const [dragOffsetPx, setDragOffsetPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ pointerY: number; offset: number } | null>(null)

  const minHeight = drag ? window.innerHeight - drag.peekOffsetPx : 0
  const maxHeight = drag ? window.innerHeight - drag.expandedOffsetPx : 0
  const heightPx = drag ? Math.min(maxHeight, Math.max(minHeight, minHeight + dragOffsetPx)) : null

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStart.current = { pointerY: e.clientY, offset: dragOffsetPx }
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || !dragStart.current) return
    const draggedUpBy = dragStart.current.pointerY - e.clientY
    setDragOffsetPx(dragStart.current.offset + draggedUpBy)
  }

  const handlePointerUp = () => {
    if (!drag || !dragStart.current) return
    dragStart.current = null
    setIsDragging(false)
    const midpoint = (minHeight + maxHeight) / 2
    setDragOffsetPx(heightPx !== null && heightPx > midpoint ? maxHeight - minHeight : 0)
  }

  return (
    <div
      className={`no-scrollbar relative flex w-full max-w-[402px] flex-col items-center overflow-y-auto bg-white px-[18px] pb-8 ${
        radius === 'lg' ? 'rounded-t-[32px]' : 'rounded-t-[25px]'
      } ${drag ? '' : (heightClassName ?? (size === 'half' ? 'h-[calc(100dvh-250px)]' : 'max-h-full'))} ${
        drag && !isDragging ? 'transition-[height] duration-200 ease-out' : ''
      }`}
      style={heightPx !== null ? { height: `${heightPx}px` } : undefined}
    >
      <div
        className="flex w-full shrink-0 touch-none flex-col items-center pt-3.5 pb-6"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="h-[3px] w-9 shrink-0 rounded-full bg-[#3c3c43]/30" />
      </div>
      {children}
    </div>
  )
}

/**
 * 하단에서 올라오는 바텀시트 (피그마 바텀 시트 컴포넌트 기준: 상단 라운드 25px, 그래버 포함)
 *
 * @example
 * <BottomSheet open={open} onClose={() => setOpen(false)}>
 *   <p className="text-h3-sb">약관 동의</p>
 * </BottomSheet>
 */
export default function BottomSheet({
  open,
  onClose,
  radius = 'md',
  size = 'auto',
  heightClassName,
  drag,
  children,
}: BottomSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
      />
      <SheetPanel radius={radius} size={size} heightClassName={heightClassName} drag={drag}>
        {children}
      </SheetPanel>
    </div>
  )
}
