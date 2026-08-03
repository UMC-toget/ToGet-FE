import { useRef, useState } from 'react';
import BottomSheet from '../common/BottomSheet';
import ImageCropper from './ImageCropper';

// 이미지 업로드 버튼을 누르면 바로 OS 파일창이 뜨는 대신,
// 바텀시트로 업로드 방식을 먼저 선택하고, 파일을 고르면
// 지정된 비율로 자르는 화면을 거쳐서 최종 이미지를 넘겨줍니다.

interface Props {
  onClose: () => void;
  onSelect: (file: File) => void;
  aspectRatio?: number; // width / height, 기본값은 대표 이미지 비율(364:173)
}

export default function PhotoActionSheet({ onClose, onSelect, aspectRatio = 364 / 173 }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = '';
  };

  const handleWebSearch = () => {
    window.open('https://www.29cm.co.kr/store/search/start', '_blank', 'noopener,noreferrer');
    onClose();
  };

  if (pendingFile) {
    return (
      <ImageCropper
        file={pendingFile}
        aspectRatio={aspectRatio}
        onCancel={() => setPendingFile(null)}
        onConfirm={(croppedFile) => {
          onSelect(croppedFile);
          setPendingFile(null);
          onClose();
        }}
      />
    );
  }

  return (
    <BottomSheet open onClose={onClose}>
      <ul className="flex w-full flex-col">
        <li>
          <button
            type="button"
            onClick={handleWebSearch}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            웹 사진 검색
          </button>
        </li>
        <li>
          {/* 갤러리(사진 보관함) — capture 없이 accept=image/* */}
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            사진 보관함
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
        <li>
          {/* 파일 보관함(iCloud/Files) — accept 제한 없음 → iOS Files 앱 포함 */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            파일 선택
          </button>
        </li>
      </ul>

      {/* 갤러리: accept=image/*, capture 없음 → 사진 보관함만 */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {/* 카메라: capture=environment → 직접 촬영 */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {/* 파일 선택: accept 제한 없음 → iOS의 경우 "Files(파일)" 브라우저 포함 */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
    </BottomSheet>
  );
}
