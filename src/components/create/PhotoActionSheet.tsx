import { useRef, useState } from 'react';
import BottomSheet from '../common/BottomSheet';
import ImageCropper from './ImageCropper';

// 이미지 업로드 버튼을 누르면 바로 OS 파일창이 뜨는 대신,
// "웹 사진 검색 / 사진 선택 / 사진 찍기" 바텀시트를 먼저 보여주고,
// 파일을 고르면 지정된 비율로 자르는 화면을 거쳐서 최종 이미지를 넘겨줍니다.

interface Props {
  onClose: () => void;
  onSelect: (file: File) => void;
  aspectRatio?: number; // width / height, 기본값은 대표 이미지 비율(364:173)
}

export default function PhotoActionSheet({ onClose, onSelect, aspectRatio = 364 / 173 }: Props) {
  const libraryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
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
          {/* 이미지 검색 API 연동 전까지는 자리만 잡아둠 */}
          <button type="button" disabled className="w-full py-2 text-left text-b1-m text-gray-300">
            웹 사진 검색
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => libraryRef.current?.click()}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            사진 선택
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="w-full py-2 text-left text-b1-m text-black"
          >
            사진 찍기
          </button>
        </li>
      </ul>

      <input ref={libraryRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </BottomSheet>
  );
}