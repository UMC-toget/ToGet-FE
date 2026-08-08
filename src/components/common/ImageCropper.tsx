import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';

interface Props {
  file: File;
  aspectRatio: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

type Corner = 'tl' | 'tr' | 'bl' | 'br';
interface CropRect { x: number; y: number; w: number; h: number }

const MIN_CROP = 60;
const HANDLE = 44;
const ARM = 24;
const THICK = 3;
const PINK = '#FE71A5';
const GRID = 'rgba(255,255,255,0.4)';
const DIM = 'rgba(0,0,0,0.65)';

export default function ImageCropper({ file, aspectRatio, onCancel, onConfirm }: Props) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgNatW, setImgNatW] = useState(0);
  const [imgNatH, setImgNatH] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const draggingCorner = useRef<Corner | null>(null);
  const draggingPan = useRef<{ startMx: number; startMy: number; origX: number; origY: number } | null>(null);
  const cropInitialized = useRef(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setContainerW(el.clientWidth);
      setContainerH(el.clientHeight);
    });
    obs.observe(el);
    setContainerW(el.clientWidth);
    setContainerH(el.clientHeight);
    return () => obs.disconnect();
  }, []);

  // object-fit: contain 수동 계산
  const imgDisp = useMemo(() => {
    if (!imgNatW || !imgNatH || !containerW || !containerH) return null;
    const scale = Math.min(containerW / imgNatW, containerH / imgNatH);
    const dw = imgNatW * scale;
    const dh = imgNatH * scale;
    return { x: (containerW - dw) / 2, y: (containerH - dh) / 2, w: dw, h: dh, scale };
  }, [imgNatW, imgNatH, containerW, containerH]);

  // 포인터 핸들러에서 최신 imgDisp를 클로저 없이 참조
  const imgDispRef = useRef(imgDisp);
  imgDispRef.current = imgDisp;

  // 초기 크롭: aspectRatio에 맞게 이미지 내에서 최대 크기로 설정
  useEffect(() => {
    if (!imgDisp || cropInitialized.current) return;
    cropInitialized.current = true;
    const cropW = Math.min(imgDisp.w, imgDisp.h * aspectRatio);
    const cropH = cropW / aspectRatio;
    setCropRect({
      x: imgDisp.x + (imgDisp.w - cropW) / 2,
      y: imgDisp.y + (imgDisp.h - cropH) / 2,
      w: cropW,
      h: cropH,
    });
  }, [imgDisp, aspectRatio]);

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (img) { setImgNatW(img.naturalWidth); setImgNatH(img.naturalHeight); }
  };

  const handleCornerPointerDown = (corner: Corner) => (e: React.PointerEvent) => {
    e.stopPropagation();
    draggingCorner.current = corner;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // 컨테이너 onPointerMove: 코너 핸들의 이벤트가 여기로 버블링됨
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingCorner.current) return;
    const id = imgDispRef.current;
    if (!id || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // 이미지 범위 내로 clamp
    const mx = Math.max(id.x, Math.min(id.x + id.w, e.clientX - rect.left));
    const my = Math.max(id.y, Math.min(id.y + id.h, e.clientY - rect.top));
    const corner = draggingCorner.current;

    setCropRect((prev) => {
      if (!prev) return prev;
      const { x, y, w, h } = prev;
      const right = x + w;
      const bottom = y + h;

      // aspectRatio(w/h) 유지: 드래그 폭/높이 중 더 작게 맞춰지는 쪽으로 크기 결정
      const minW = aspectRatio >= 1 ? MIN_CROP * aspectRatio : MIN_CROP;
      let dw: number;
      let dh: number;
      let newX = x;
      let newY = y;

      if (corner === 'tl') {
        dw = right - mx;
        dh = bottom - my;
      } else if (corner === 'tr') {
        dw = mx - x;
        dh = bottom - my;
      } else if (corner === 'bl') {
        dw = right - mx;
        dh = my - y;
      } else {
        dw = mx - x;
        dh = my - y;
      }

      const newW = Math.max(Math.min(dw, dh * aspectRatio), minW);
      const newH = newW / aspectRatio;

      if (corner === 'tl') {
        newX = right - newW;
        newY = bottom - newH;
      } else if (corner === 'tr') {
        newX = x;
        newY = bottom - newH;
      } else if (corner === 'bl') {
        newX = right - newW;
        newY = y;
      } else {
        newX = x;
        newY = y;
      }

      return { x: newX, y: newY, w: newW, h: newH };
    });
  };

  const handlePointerUp = () => { draggingCorner.current = null; };

  const handleCropPointerDown = (e: React.PointerEvent) => {
    if (!cropRect || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    draggingPan.current = {
      startMx: e.clientX - rect.left,
      startMy: e.clientY - rect.top,
      origX: cropRect.x,
      origY: cropRect.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    const dp = draggingPan.current;
    if (!dp) return;
    const id = imgDispRef.current;
    if (!id || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - rect.left - dp.startMx;
    const dy = e.clientY - rect.top - dp.startMy;
    const newX = dp.origX + dx;
    const newY = dp.origY + dy;
    setCropRect((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        x: Math.max(id.x, Math.min(id.x + id.w - prev.w, newX)),
        y: Math.max(id.y, Math.min(id.y + id.h - prev.h, newY)),
      };
    });
  };

  const handleCropPointerUp = () => { draggingPan.current = null; };

  const handleConfirm = () => {
    const img = imgRef.current;
    const id = imgDispRef.current;
    if (!img || !id || !cropRect) return;

    const sx = Math.round((cropRect.x - id.x) / id.scale);
    const sy = Math.round((cropRect.y - id.y) / id.scale);
    const sw = Math.round(cropRect.w / id.scale);
    const sh = Math.round(cropRect.h / id.scale);

    const canvas = document.createElement('canvas');
    canvas.width = sw * 2;   // 2x for clarity
    canvas.height = sh * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const out = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
      onConfirm(out);
    }, 'image/jpeg', 0.9);
  };

  const cr = cropRect;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-white">
      <div className="flex w-full max-w-[402px] flex-col">
      {/* 헤더 */}
      <div className="flex items-center px-2 py-3">
        <button type="button" onClick={onCancel} className="p-2">
          <ChevronLeftIcon className="size-6 text-black" />
        </button>
        <p className="flex-1 text-center text-[16px] font-medium text-black">사진 자르기</p>
        <div className="size-10" />
      </div>

      {/* 이미지 + 크롭 영역 */}
      <div
        ref={containerRef}
        className="relative flex-1 touch-none overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* 이미지 */}
        {imgUrl && (
          <img
            ref={imgRef}
            src={imgUrl}
            alt=""
            draggable={false}
            onLoad={handleImgLoad}
            className="pointer-events-none absolute select-none"
            style={
              imgDisp
                ? { left: imgDisp.x, top: imgDisp.y, width: imgDisp.w, height: imgDisp.h }
                : { opacity: 0, width: 1, height: 1 }
            }
          />
        )}

        {cr && containerW > 0 && (
          <>
            {/* 크롭 프레임: 라운드 코너 + 외부 어두운 오버레이(box-shadow) + 격자선 + 팬 이동 */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: cr.x,
                top: cr.y,
                width: cr.w,
                height: cr.h,
                borderRadius: 47.78,
                border: '1px solid #FFE3ED',
                boxShadow: `0 0 0 9999px ${DIM}`,
                cursor: 'move',
                touchAction: 'none',
              }}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
            >
              {/* 격자선 (rule of thirds) */}
              {[1 / 3, 2 / 3].map((p) => (
                <div key={p}>
                  <div className="absolute inset-y-0" style={{ left: `${p * 100}%`, width: 1, background: GRID }} />
                  <div className="absolute inset-x-0" style={{ top: `${p * 100}%`, height: 1, background: GRID }} />
                </div>
              ))}
            </div>

            {/* 핑크 L자 브래킷 — crop frame 외부에 배치(overflow 클립 무관) */}
            {/* TL */}
            <span className="pointer-events-none absolute" style={{ top: cr.y, left: cr.x, width: ARM, height: THICK, background: PINK }} />
            <span className="pointer-events-none absolute" style={{ top: cr.y, left: cr.x, width: THICK, height: ARM, background: PINK }} />
            {/* TR */}
            <span className="pointer-events-none absolute" style={{ top: cr.y, left: cr.x + cr.w - ARM, width: ARM, height: THICK, background: PINK }} />
            <span className="pointer-events-none absolute" style={{ top: cr.y, left: cr.x + cr.w - THICK, width: THICK, height: ARM, background: PINK }} />
            {/* BL */}
            <span className="pointer-events-none absolute" style={{ top: cr.y + cr.h - THICK, left: cr.x, width: ARM, height: THICK, background: PINK }} />
            <span className="pointer-events-none absolute" style={{ top: cr.y + cr.h - ARM, left: cr.x, width: THICK, height: ARM, background: PINK }} />
            {/* BR */}
            <span className="pointer-events-none absolute" style={{ top: cr.y + cr.h - THICK, left: cr.x + cr.w - ARM, width: ARM, height: THICK, background: PINK }} />
            <span className="pointer-events-none absolute" style={{ top: cr.y + cr.h - ARM, left: cr.x + cr.w - THICK, width: THICK, height: ARM, background: PINK }} />

            {/* 코너 드래그 핸들 (44×44 터치 타겟, 코너 중앙 정렬) */}
            {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((corner) => {
              const isLeft = corner === 'tl' || corner === 'bl';
              const isTop = corner === 'tl' || corner === 'tr';
              return (
                <div
                  key={corner}
                  className="absolute"
                  style={{
                    width: HANDLE,
                    height: HANDLE,
                    left: isLeft ? cr.x - HANDLE / 2 : cr.x + cr.w - HANDLE / 2,
                    top: isTop ? cr.y - HANDLE / 2 : cr.y + cr.h - HANDLE / 2,
                    cursor: corner === 'tl' || corner === 'br' ? 'nwse-resize' : 'nesw-resize',
                  }}
                  onPointerDown={handleCornerPointerDown(corner)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                />
              );
            })}
          </>
        )}
      </div>

      {/* 하단 CTA */}
      <div className="px-[18px] pb-10 pt-4">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!cropRect}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E1D1E] text-[16px] font-semibold text-white disabled:bg-gray-300"
        >
          다음
        </button>
      </div>
      </div>
    </div>
  );
}
