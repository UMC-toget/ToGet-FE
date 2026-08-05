import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export type DragMode = 'none' | 'image' | 'box' | 'tl' | 'tr' | 'bl' | 'br'

export interface CropBox {
  x: number // relative to container center
  y: number // relative to container center
  size: number
}

export const CONTAINER_WIDTH = 366
export const CONTAINER_HEIGHT = 452.5
export const MAX_CROP_SIZE = 366

export interface UseImageCropOptions {
  returnPath: string
  savedFormState?: Record<string, any>
}

export function useImageCrop({ returnPath, savedFormState }: UseImageCropOptions) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, size: MAX_CROP_SIZE })
  const [dragMode, setDragMode] = useState<DragMode>('none')

  const dragStartRef = useRef<{
    clientX: number
    clientY: number
    posX: number
    posY: number
    boxX: number
    boxY: number
    boxSize: number
  }>({ clientX: 0, clientY: 0, posX: 0, posY: 0, boxX: 0, boxY: 0, boxSize: MAX_CROP_SIZE })

  const pinchStartDistRef = useRef<number | null>(null)
  const pinchStartScaleRef = useRef<number>(1)

  const clampCropBox = useCallback((x: number, y: number, size: number): CropBox => {
    const minSize = 100
    const maxSize = CONTAINER_WIDTH
    const clampedSize = Math.min(Math.max(minSize, size), maxSize)

    const maxX = (CONTAINER_WIDTH - clampedSize) / 2
    const maxY = (CONTAINER_HEIGHT - clampedSize) / 2

    const clampedX = Math.min(Math.max(-maxX, x), maxX)
    const clampedY = Math.min(Math.max(-maxY, y), maxY)

    return { x: clampedX, y: clampedY, size: clampedSize }
  }, [])

  const handleImageLoad = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    setScale(1)
  }, [])

  const startDrag = useCallback(
    (mode: DragMode, clientX: number, clientY: number) => {
      setDragMode(mode)
      dragStartRef.current = {
        clientX,
        clientY,
        posX: position.x,
        posY: position.y,
        boxX: cropBox.x,
        boxY: cropBox.y,
        boxSize: cropBox.size,
      }
    },
    [position.x, position.y, cropBox.x, cropBox.y, cropBox.size],
  )

  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      const deltaX = clientX - dragStartRef.current.clientX
      const deltaY = clientY - dragStartRef.current.clientY
      const start = dragStartRef.current

      if (dragMode === 'image') {
        setPosition({ x: start.posX + deltaX, y: start.posY + deltaY })
      } else if (dragMode === 'box') {
        setCropBox(clampCropBox(start.boxX + deltaX, start.boxY + deltaY, start.boxSize))
      } else if (dragMode === 'br') {
        const delta = Math.max(deltaX, deltaY)
        setCropBox(clampCropBox(start.boxX, start.boxY, start.boxSize + delta))
      } else if (dragMode === 'tl') {
        const delta = Math.min(deltaX, deltaY)
        setCropBox(clampCropBox(start.boxX, start.boxY, start.boxSize - delta))
      } else if (dragMode === 'tr') {
        const delta = Math.max(deltaX, -deltaY)
        setCropBox(clampCropBox(start.boxX, start.boxY, start.boxSize + delta))
      } else if (dragMode === 'bl') {
        const delta = Math.max(-deltaX, deltaY)
        setCropBox(clampCropBox(start.boxX, start.boxY, start.boxSize + delta))
      }
    },
    [dragMode, clampCropBox],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        setDragMode('none')
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        pinchStartDistRef.current = dist
        pinchStartScaleRef.current = scale
      }
    },
    [scale],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        const ratio = currentDist / pinchStartDistRef.current
        const newScale = Math.min(Math.max(0.5, pinchStartScaleRef.current * ratio), 4)
        setScale(newScale)
      } else if (e.touches.length === 1 && dragMode !== 'none') {
        const touch = e.touches[0]
        updateDrag(touch.clientX, touch.clientY)
      }
    },
    [dragMode, updateDrag],
  )

  const handleCancel = useCallback(() => {
    navigate(returnPath, { state: { savedFormState } })
  }, [navigate, returnPath, savedFormState])

  const handleNext = useCallback(() => {
    if (!imageRef.current) return

    const img = imageRef.current
    const canvas = document.createElement('canvas')
    const cropSize = 300
    canvas.width = cropSize
    canvas.height = cropSize
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const container = containerRef.current
    const containerWidth = container?.clientWidth || CONTAINER_WIDTH
    const containerHeight = container?.clientHeight || CONTAINER_HEIGHT

    const maskLeft = (containerWidth - cropBox.size) / 2 + cropBox.x
    const maskTop = (containerHeight - cropBox.size) / 2 + cropBox.y

    const imgAspect = img.naturalWidth / img.naturalHeight
    const renderW = containerWidth * scale
    const renderH = (containerWidth / imgAspect) * scale

    const renderX = (containerWidth - renderW) / 2 + position.x
    const renderY = (containerHeight - renderH) / 2 + position.y

    const cropXInRender = maskLeft - renderX
    const cropYInRender = maskTop - renderY

    const scaleToNatural = img.naturalWidth / renderW

    const sourceX = Math.max(0, cropXInRender * scaleToNatural)
    const sourceY = Math.max(0, cropYInRender * scaleToNatural)
    const sourceW = Math.min(img.naturalWidth - sourceX, cropBox.size * scaleToNatural)
    const sourceH = Math.min(img.naturalHeight - sourceY, cropBox.size * scaleToNatural)

    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, cropSize, cropSize)

    const croppedDataUrl = canvas.toDataURL('image/png')

    navigate(returnPath, {
      state: {
        croppedImage: croppedDataUrl,
        savedFormState,
      },
    })
  }, [position, scale, cropBox, returnPath, savedFormState, navigate])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault()
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
      setScale((prevScale) => Math.min(Math.max(0.5, prevScale * zoomFactor), 4))
    }

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragMode !== 'none') {
        updateDrag(e.clientX, e.clientY)
      }
    }

    const handleGlobalMouseUp = () => {
      setDragMode('none')
      pinchStartDistRef.current = null
    }

    container.addEventListener('wheel', handleWheelNative, { passive: false })
    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false })
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalMouseUp)

    return () => {
      container.removeEventListener('wheel', handleWheelNative)
      container.removeEventListener('touchmove', handleTouchMoveNative)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalMouseUp)
    }
  }, [dragMode, updateDrag])

  return {
    containerRef,
    imageRef,
    position,
    scale,
    cropBox,
    handleImageLoad,
    startDrag,
    handleTouchStart,
    handleTouchMove,
    handleCancel,
    handleNext,
  }
}
