export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = url
  })
}

const CROP_OUTPUT_SIZE = 512

/** 이미지에서 현재 크롭 뷰포트(정사각형)에 보이는 영역만 잘라 Blob으로 반환합니다. */
export function cropToSquare(
  img: HTMLImageElement,
  offset: { x: number; y: number },
  scale: number,
  viewportSize: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CROP_OUTPUT_SIZE
  canvas.height = CROP_OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('canvas context unavailable'))

  const srcX = -offset.x / scale
  const srcY = -offset.y / scale
  const srcSize = viewportSize / scale

  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('crop failed'))), 'image/jpeg', 0.92)
  })
}
