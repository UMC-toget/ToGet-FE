import { useEffect, useRef, useState } from 'react'
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon'
import Button from '../../components/common/Button'
import { cropToSquare, loadImage } from '../../utils/cropImage'

const VIEWPORT_SIZE = 366
const MAX_SCALE_MULTIPLIER = 4

interface PhotoCropOverlayProps {
  file: File
  onCancel: () => void
  onConfirm: (blob: Blob) => void
  /** 이미지를 불러오거나 자르지 못했을 때 (지원하지 않는 형식 등) */
  onError: () => void
}

interface Point {
  x: number
  y: number
}

interface PanState {
  startPointer: Point
  startOffset: Point
}

interface PinchState {
  startDistance: number
  startScale: number
  startOffset: Point
  startMidpoint: Point
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** 프로필 사진 원형 자르기 화면 (피그마 "사진 자르기" 기준). 드래그로 위치를, 핀치/휠로 확대·축소를 조정합니다. */
export default function PhotoCropOverlay({ file, onCancel, onConfirm, onError }: PhotoCropOverlayProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [minScale, setMinScale] = useState(1)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })

  const pointersRef = useRef<Map<number, Point>>(new Map())
  const panRef = useRef<PanState | null>(null)
  const pinchRef = useRef<PinchState | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    let cancelled = false
    loadImage(url)
      .then((loaded) => {
        if (cancelled) return
        const coverScale = Math.max(VIEWPORT_SIZE / loaded.naturalWidth, VIEWPORT_SIZE / loaded.naturalHeight)
        setImg(loaded)
        setMinScale(coverScale)
        setScale(coverScale)
        setOffset({
          x: (VIEWPORT_SIZE - loaded.naturalWidth * coverScale) / 2,
          y: (VIEWPORT_SIZE - loaded.naturalHeight * coverScale) / 2,
        })
      })
      .catch(() => {
        if (cancelled) return
        onError()
      })
    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [file, onError])

  const clampOffset = (point: Point, currentScale: number, currentImg: HTMLImageElement): Point => {
    const w = currentImg.naturalWidth * currentScale
    const h = currentImg.naturalHeight * currentScale
    return {
      x: Math.min(0, Math.max(VIEWPORT_SIZE - w, point.x)),
      y: Math.min(0, Math.max(VIEWPORT_SIZE - h, point.y)),
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!img) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const points = [...pointersRef.current.values()]
    if (points.length === 2) {
      panRef.current = null
      pinchRef.current = {
        startDistance: distance(points[0], points[1]),
        startScale: scale,
        startOffset: offset,
        startMidpoint: midpoint(points[0], points[1]),
      }
    } else if (points.length === 1) {
      pinchRef.current = null
      panRef.current = { startPointer: points[0], startOffset: offset }
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!img || !pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const points = [...pointersRef.current.values()]

    if (points.length === 2 && pinchRef.current) {
      const { startDistance, startScale, startOffset, startMidpoint } = pinchRef.current
      const currentDistance = distance(points[0], points[1])
      const nextScale = Math.min(
        Math.max((startScale * currentDistance) / startDistance, minScale),
        minScale * MAX_SCALE_MULTIPLIER,
      )
      const ratio = nextScale / startScale
      const nextOffset = {
        x: startMidpoint.x - (startMidpoint.x - startOffset.x) * ratio,
        y: startMidpoint.y - (startMidpoint.y - startOffset.y) * ratio,
      }
      setScale(nextScale)
      setOffset(clampOffset(nextOffset, nextScale, img))
    } else if (points.length === 1 && panRef.current) {
      const { startPointer, startOffset } = panRef.current
      const dx = points[0].x - startPointer.x
      const dy = points[0].y - startPointer.y
      setOffset(clampOffset({ x: startOffset.x + dx, y: startOffset.y + dy }, scale, img))
    }
  }

  const endPointer = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId)
    const points = [...pointersRef.current.values()]
    pinchRef.current = null
    panRef.current = points.length === 1 ? { startPointer: points[0], startOffset: offset } : null
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!img) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const nextScale = Math.min(Math.max(scale * (1 - e.deltaY * 0.001), minScale), minScale * MAX_SCALE_MULTIPLIER)
    const ratio = nextScale / scale
    const nextOffset = {
      x: cursor.x - (cursor.x - offset.x) * ratio,
      y: cursor.y - (cursor.y - offset.y) * ratio,
    }
    setScale(nextScale)
    setOffset(clampOffset(nextOffset, nextScale, img))
  }

  const handleConfirm = async () => {
    if (!img) return
    try {
      const blob = await cropToSquare(img, offset, scale, VIEWPORT_SIZE)
      onConfirm(blob)
    } catch {
      onError()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="relative flex h-[50px] w-full shrink-0 items-center justify-center border-b border-gray-100 px-[18px]">
        <button type="button" aria-label="뒤로가기" onClick={onCancel} className="absolute left-[18px] text-black">
          <ChevronLeftIcon />
        </button>
        <h1 className="text-h3-sb text-black">사진 자르기</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-[18px]">
        <div
          className="relative w-full max-w-[366px] touch-none select-none overflow-hidden bg-gray-900"
          style={{ aspectRatio: '1 / 1' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={handleWheel}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 max-w-none"
              style={{
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}

          {/* 원형 크롭 가이드: box-shadow로 원 바깥 영역을 옅게 어둡게 처리합니다 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }}
          />

          {/* 원형 가이드 테두리 (사각 테두리와 동일한 연분홍) */}
          <div className="pointer-events-none absolute inset-0 rounded-full border border-[#ffe3ed]" />

          {/* 3x3 격자선 */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-full w-px bg-[#ffc6db] opacity-50" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-[#ffc6db] opacity-50" />
            <div className="absolute left-0 top-1/3 h-px w-full bg-[#ffc6db] opacity-50" />
            <div className="absolute left-0 top-2/3 h-px w-full bg-[#ffc6db] opacity-50" />
          </div>

          {/* 가이드 사각형 테두리 */}
          <div className="pointer-events-none absolute inset-0 border border-[#ffe3ed]" />

          {/* 모서리 코너 마크 */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-[3px] w-5 bg-[#fe71a5]" />
            <div className="absolute left-0 top-0 h-5 w-[3px] bg-[#fe71a5]" />
            <div className="absolute right-0 top-0 h-[3px] w-5 bg-[#fe71a5]" />
            <div className="absolute right-0 top-0 h-5 w-[3px] bg-[#fe71a5]" />
            <div className="absolute bottom-0 left-0 h-[3px] w-5 bg-[#fe71a5]" />
            <div className="absolute bottom-0 left-0 h-5 w-[3px] bg-[#fe71a5]" />
            <div className="absolute bottom-0 right-0 h-[3px] w-5 bg-[#fe71a5]" />
            <div className="absolute bottom-0 right-0 h-5 w-[3px] bg-[#fe71a5]" />
          </div>
        </div>
      </div>

      <div className="shrink-0 px-[18px] pb-8 pt-4">
        <Button disabled={!img} onClick={handleConfirm}>
          다음
        </Button>
      </div>
    </div>
  )
}
