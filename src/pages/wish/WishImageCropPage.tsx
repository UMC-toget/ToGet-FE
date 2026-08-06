import { useNavigate, useLocation } from 'react-router-dom'
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon'
import Button from '../../components/common/Button'
import { useImageCrop } from './hooks/useImageCrop'

interface CropLocationState {
  imageSrc: string
  returnPath: string
  savedFormState?: Record<string, any>
}

/** 사진 자르기 페이지 (3x3 그리드 366px 최대화 & 1:1 사진 정밀 100% 맞춤 적용, 피그마 1859:37965 기준) */
export default function WishImageCropPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = (location.state as CropLocationState) || {}
  const imageSrc = locationState.imageSrc || ''
  const returnPath = locationState.returnPath || '/wish'
  const savedFormState = locationState.savedFormState

  const {
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
  } = useImageCrop({ returnPath, savedFormState })

  if (!imageSrc) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col items-center justify-center bg-white p-4">
        <p className="text-b2-r text-gray-500">선택된 이미지가 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-b2-m text-white"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {/* Header (Figma 1859:37848 기준: 타이틀 중앙 정렬) */}
      <header className="flex h-[56px] shrink-0 items-center px-[18px]">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="뒤로가기"
          className="flex size-9 items-center justify-center text-black z-10"
        >
          <ChevronLeftIcon className="size-6 text-black" />
        </button>
        <h1 className="flex-1 pr-9 text-center text-b1-m font-semibold text-black">사진 자르기</h1>
      </header>

      {/* Main Content Area (Crop Card Container Centered Vertically) */}
      <main className="my-auto flex flex-1 flex-col items-center justify-center px-[18px] py-4">
        {/* Crop Card Container (Figma 1859:37939 366x452.5) */}
        <div
          ref={containerRef}
          onMouseDown={(e) => startDrag('image', e.clientX, e.clientY)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ touchAction: 'none' }}
          className="relative flex aspect-[366/452.5] w-full cursor-grab select-none items-center justify-center overflow-hidden rounded-2xl bg-black/90 active:cursor-grabbing shadow-sm"
        >
          <img
            ref={imageRef}
            src={imageSrc}
            onLoad={handleImageLoad}
            alt="자르기 대상"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            className="w-[366px] object-cover transition-transform duration-75"
            draggable={false}
          />

          {/* Dynamic 3x3 Crop Box & Guide Lines (Figma Group 2147226024 / 2147226026) */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              startDrag('box', e.clientX, e.clientY)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              if (e.touches.length === 1) {
                startDrag('box', e.touches[0].clientX, e.touches[0].clientY)
              }
            }}
            style={{
              width: `${cropBox.size}px`,
              height: `${cropBox.size}px`,
              transform: `translate(${cropBox.x}px, ${cropBox.y}px)`,
            }}
            className="absolute rounded-2xl border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move pointer-events-auto"
          >
            {/* Top-Left Corner Handle (Pink L-Bar matching Figma Group 2147226027) */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                startDrag('tl', e.clientX, e.clientY)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                if (e.touches.length === 1) startDrag('tl', e.touches[0].clientX, e.touches[0].clientY)
              }}
              className="absolute -left-3 -top-3 flex size-8 cursor-nwse-resize items-center justify-center pointer-events-auto"
            >
              <div className="size-4 rounded-tl-sm border-l-4 border-t-4 border-pink-500" />
            </div>

            {/* Top-Right Corner Handle (Pink L-Bar matching Figma Group 2147226023) */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                startDrag('tr', e.clientX, e.clientY)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                if (e.touches.length === 1) startDrag('tr', e.touches[0].clientX, e.touches[0].clientY)
              }}
              className="absolute -right-3 -top-3 flex size-8 cursor-nesw-resize items-center justify-center pointer-events-auto"
            >
              <div className="size-4 rounded-tr-sm border-r-4 border-t-4 border-pink-500" />
            </div>

            {/* Bottom-Left Corner Handle (Pink L-Bar matching Figma Group 2147226029) */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                startDrag('bl', e.clientX, e.clientY)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                if (e.touches.length === 1) startDrag('bl', e.touches[0].clientX, e.touches[0].clientY)
              }}
              className="absolute -bottom-3 -left-3 flex size-8 cursor-nesw-resize items-center justify-center pointer-events-auto"
            >
              <div className="size-4 rounded-bl-sm border-b-4 border-l-4 border-pink-500" />
            </div>

            {/* Bottom-Right Corner Handle (Pink L-Bar matching Figma Group 2147226028) */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                startDrag('br', e.clientX, e.clientY)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                if (e.touches.length === 1) startDrag('br', e.touches[0].clientX, e.touches[0].clientY)
              }}
              className="absolute -bottom-3 -right-3 flex size-8 cursor-nwse-resize items-center justify-center pointer-events-auto"
            >
              <div className="size-4 rounded-br-sm border-b-4 border-r-4 border-pink-500" />
            </div>

            {/* 3x3 Inner Grid lines */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-60">
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-r border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-white/40" />
              <div className="border-r border-white/40" />
              <div />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar (Figma 1859:37848 기준: "다음" 버튼 적용) */}
      <div className="mt-auto px-[18px] pb-8 pt-4">
        <Button onClick={handleNext}>다음</Button>
      </div>
    </div>
  )
}
