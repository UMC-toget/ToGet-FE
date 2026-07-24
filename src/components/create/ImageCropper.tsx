import { useEffect, useRef, useState } from 'react';

// 원본 이미지를 지정된 비율(aspectRatio)로 드래그/확대해서 자르는 풀스크린 크로퍼.
// 화면 표시는 CSS object-fit: cover로 처리해서 이미지 로드 타이밍(naturalWidth 등)에
// 의존하지 않고, 실제 자르기(canvas export)만 "저장" 클릭 시점에 계산합니다.

interface Props {
  file: File;
  aspectRatio: number; // width / height, 예: 364/173, 1(정사각형)
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const FRAME_WIDTH = 300;

export default function ImageCropper({ file, aspectRatio, onCancel, onConfirm }: Props) {
  const frameHeight = FRAME_WIDTH / aspectRatio;
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // blob URL은 useState 초기값이 아니라 effect 안에서 생성 (StrictMode 조기 revoke 방지)
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // object-fit: cover 기준으로, 줌 배율만큼 초과되는 여백이 최대 이동 가능 범위
  const clampOffset = (x: number, y: number, z: number) => {
    const maxX = (FRAME_WIDTH * (z - 1)) / 2;
    const maxY = (frameHeight * (z - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clampOffset(dragState.current.origX + dx, dragState.current.origY + dy, zoom));
  };
  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleZoomChange = (value: number) => {
    setZoom(value);
    setOffset((prev) => clampOffset(prev.x, prev.y, value));
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;

    // 화면에 보이는 것과 동일한 object-fit: cover 배율을, 실제 자르기 시점에 재계산
    const coverScale = Math.max(FRAME_WIDTH / img.naturalWidth, frameHeight / img.naturalHeight);
    const effectiveScale = coverScale * zoom;
    const displayWidth = img.naturalWidth * effectiveScale;
    const displayHeight = img.naturalHeight * effectiveScale;

    const outputWidth = FRAME_WIDTH * 2;
    const outputHeight = frameHeight * 2;
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropXInDisplay = (displayWidth - FRAME_WIDTH) / 2 - offset.x;
    const cropYInDisplay = (displayHeight - frameHeight) / 2 - offset.y;
    const sx = cropXInDisplay / effectiveScale;
    const sy = cropYInDisplay / effectiveScale;
    const sWidth = FRAME_WIDTH / effectiveScale;
    const sHeight = frameHeight / effectiveScale;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
        onConfirm(croppedFile);
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onCancel} className="text-white text-sm">
          취소
        </button>
        <p className="text-white text-sm font-medium">사진 자르기</p>
        <button onClick={handleConfirm} className="text-white text-sm font-semibold">
          저장
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="relative overflow-hidden touch-none bg-gray-800"
          style={{ width: FRAME_WIDTH, height: frameHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {imgUrl && (
            <img
              ref={imgRef}
              src={imgUrl}
              alt="자르기 대상 이미지"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{
                transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                transformOrigin: 'center',
              }}
            />
          )}
          {/* 자르기 프레임 테두리 */}
          <div className="absolute inset-0 border-2 border-white pointer-events-none" />
        </div>
      </div>

      <div className="px-6 py-4 flex items-center gap-3">
        <span className="text-white text-xs">축소</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-white text-xs">확대</span>
      </div>
    </div>
  );
}