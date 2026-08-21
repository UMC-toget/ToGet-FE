import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import BottomSheet from './BottomSheet';
import ImageCropper from './ImageCropper';
import WebImageSearch from './WebImageSearch';

// 이미지 업로드 버튼을 누르면 바로 OS 파일창이 뜨는 대신,
// 바텀시트로 업로드 방식을 먼저 선택하고, 파일을 고르면
// 지정된 비율로 자르는 화면을 거쳐서 최종 이미지를 넘겨줍니다.

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

interface CropperRenderProps {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

interface Props {
  onClose: () => void;
  onSelect: (file: File) => void;
  aspectRatio?: number; // width / height, 기본값은 대표 이미지 비율(364:173). renderCropper를 쓰면 무시됩니다.
  /** 자르기 화면을 기본 사각형 크롭(ImageCropper) 대신 다른 구현으로 대체할 때 사용 (예: 프로필 사진의 원형 크롭) */
  renderCropper?: (props: CropperRenderProps) => ReactNode;
}

export default function PhotoActionSheet({ onClose, onSelect, aspectRatio = 364 / 173, renderCropper }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [webSearchOpen, setWebSearchOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = '';
  };

  if (webSearchOpen) {
    return (
      <WebImageSearch
        onCancel={() => setWebSearchOpen(false)}
        onSelect={(file) => {
          // 갤러리/카메라와 동일하게 크롭 화면을 거치도록 pendingFile로 넘김 (바로 onSelect하지 않음)
          setWebSearchOpen(false);
          setPendingFile(file);
        }}
      />
    );
  }

  if (pendingFile) {
    const handleCancel = () => setPendingFile(null);
    const handleConfirm = (file: File) => {
      onSelect(file);
      setPendingFile(null);
      onClose();
    };

    if (renderCropper) {
      return renderCropper({ file: pendingFile, onCancel: handleCancel, onConfirm: handleConfirm });
    }

    return (
      <ImageCropper file={pendingFile} aspectRatio={aspectRatio} onCancel={handleCancel} onConfirm={handleConfirm} />
    );
  }

  return (
    <BottomSheet open onClose={onClose}>
      <ul className="flex w-full flex-col pb-4">
        <li>
          <button
            type="button"
            onClick={() => setWebSearchOpen(true)}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            웹 사진 검색
          </button>
        </li>
        <li>
          {/* 갤러리(사진 보관함) — capture 없이 accept로 이미지 형식 제한 */}
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            사진 선택
          </button>
        </li>
        <li>
          {/* 카메라 — capture=environment */}
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            사진 찍기
          </button>
        </li>
      </ul>

      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={handleChange}
      />
      {/* 카메라: capture=environment → 직접 촬영 */}
      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </BottomSheet>
  );
}
