import { useRef } from 'react';

// 이미지 업로드 버튼을 누르면 바로 OS 파일창이 뜨는 대신,
// "웹 사진 검색 / 사진 보관함 / 사진 찍기 / 파일 선택" 액션시트를 먼저 보여줍니다.

interface Props {
  onClose: () => void;
  onSelect: (file: File) => void;
}

export default function PhotoActionSheet({ onClose, onSelect }: Props) {
  const libraryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    onClose();
  };

  const handleOptionClick = (key: 'search' | 'library' | 'camera' | 'file') => {
    if (key === 'library') libraryRef.current?.click();
    else if (key === 'camera') cameraRef.current?.click();
    else if (key === 'file') fileRef.current?.click();
  };

  const options: { key: 'search' | 'library' | 'camera' | 'file'; label: string; disabled: boolean }[] = [
    { key: 'search', label: '웹 사진 검색', disabled: true }, // 이미지 검색 API 연동 전까지는 자리만 잡아둠
    { key: 'library', label: '사진 보관함', disabled: false },
    { key: 'camera', label: '사진 찍기', disabled: false },
    { key: 'file', label: '파일 선택', disabled: false },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-sm mx-auto rounded-t-2xl pt-3 pb-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />

        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleOptionClick(opt.key)}
            disabled={opt.disabled}
            className={`w-full text-left px-6 py-4 text-sm border-b border-gray-50 last:border-0 transition-colors
              ${opt.disabled ? 'text-gray-300' : 'text-gray-800 hover:bg-gray-50'}`}
          >
            {opt.label}
            {opt.disabled && <span className="ml-2 text-[10px] text-gray-300">(준비중)</span>}
          </button>
        ))}

        {/* 실제 파일 선택 input 3종 - 화면엔 안 보이고 액션시트 버튼이 각각 트리거만 함 */}
        <input ref={libraryRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    </div>
  );
}