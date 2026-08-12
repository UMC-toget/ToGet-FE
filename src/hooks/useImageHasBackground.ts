import { useEffect, useState, type RefObject } from 'react'

/** src별 판정 결과 캐시. 같은 이미지를 재방문/재마운트할 때 재판정 없이 즉시 반영합니다. */
const cache = new Map<string, boolean>()

/**
 * 이미지 네 모서리 픽셀의 투명도로 "배경이 있는 사진"인지 판단합니다.
 * 네 모서리가 전부 투명하면 배경을 제거한(누끼) 이미지로 보고 false, 하나라도
 * 불투명하면 배경이 있는 사진으로 보고 true를 반환합니다.
 *
 * 별도의 Image 객체로 다시 로드하면 화면에 이미 그리고 있는 <img>와 네트워크
 * 요청·디코딩이 중복돼 반영까지 체감 지연이 생깁니다. 이를 피하려고 실제 화면에
 * 렌더링 중인 img 엘리먼트(imgRef)가 로드를 마치는 시점을 그대로 재사용합니다.
 *
 * 외부 도메인 이미지 등 CORS로 픽셀을 읽을 수 없거나 아직 판정 전이면 false를
 * 반환합니다 — 호출부는 이 경우 기존(배경 없음) 레이아웃을 그대로 쓰면 됩니다.
 */
export function useImageHasBackground(
  imgRef: RefObject<HTMLImageElement | null>,
  src: string | null,
): boolean {
  const [detected, setDetected] = useState<{ src: string; hasBackground: boolean } | null>(null)

  useEffect(() => {
    if (!src || cache.has(src)) return

    const img = imgRef.current
    if (!img) return

    let cancelled = false

    const detect = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('2d context를 생성할 수 없습니다')
        ctx.drawImage(img, 0, 0)

        const { width, height } = canvas
        const corners: Array<[number, number]> = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
        ]
        const isOpaque = corners.some(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] > 10)
        cache.set(src, isOpaque)
        setDetected({ src, hasBackground: isOpaque })
      } catch {
        cache.set(src, false)
        setDetected({ src, hasBackground: false })
      }
    }

    const handleError = () => {
      if (!cancelled) {
        cache.set(src, false)
        setDetected({ src, hasBackground: false })
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      // 이미 로드가 끝난 상태(캐시 히트 등)라도, effect 본문에서 곧바로 setState하지
      // 않도록 마이크로태스크로 미룹니다.
      queueMicrotask(detect)
    } else {
      img.addEventListener('load', detect)
      img.addEventListener('error', handleError)
    }

    return () => {
      cancelled = true
      img.removeEventListener('load', detect)
      img.removeEventListener('error', handleError)
    }
  }, [imgRef, src])

  if (!src) return false
  const cached = cache.get(src)
  if (cached !== undefined) return cached
  return detected !== null && detected.src === src && detected.hasBackground
}
