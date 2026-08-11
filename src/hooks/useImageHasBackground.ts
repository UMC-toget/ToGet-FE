import { useEffect, useState } from 'react'

interface DetectionResult {
  src: string
  hasBackground: boolean
}

/**
 * 이미지 네 모서리 픽셀의 투명도로 "배경이 있는 사진"인지 판단합니다.
 * 네 모서리가 전부 투명하면 배경을 제거한(누끼) 이미지로 보고 false, 하나라도
 * 불투명하면 배경이 있는 사진으로 보고 true를 반환합니다.
 *
 * 외부 도메인 이미지 등 CORS로 픽셀을 읽을 수 없거나 아직 판정 전이면 false를
 * 반환합니다 — 호출부는 이 경우 기존(배경 없음) 레이아웃을 그대로 쓰면 됩니다.
 */
export function useImageHasBackground(src: string | null): boolean {
  const [result, setResult] = useState<DetectionResult | null>(null)

  useEffect(() => {
    if (!src) return

    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
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
        setResult({ src, hasBackground: isOpaque })
      } catch {
        setResult({ src, hasBackground: false })
      }
    }
    img.onerror = () => {
      if (!cancelled) setResult({ src, hasBackground: false })
    }
    img.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  return result !== null && result.src === src && result.hasBackground
}
