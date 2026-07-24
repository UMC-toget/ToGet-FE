import { useState } from 'react';
import { X } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import DateSheet, { formatDisplay } from './DateSheet';
import PhotoActionSheet from './PhotoActionSheet';
import ImageCropper from './ImageCropper';
import ConfirmModal from '../common/ConfirmModal';

// 대표 이미지(페이지 썸네일) 자르기 비율 - 목록/카드에서 쓰이는 와이드 배너 형태
const THUMBNAIL_ASPECT_RATIO = 364 / 173;

interface Props {
  onNext: () => void;
  /** 하단 제출 버튼 텍스트 (기본값 '다음') - 수정 화면에서는 '수정 저장'으로 덮어씁니다 */
  submitLabel?: string;
  /** 기존 유효성 검사에 더해 버튼을 강제로 비활성화 (수정 화면에서 변경 사항이 없을 때 사용) */
  disabled?: boolean;
}

export default function Step1BasicInfo({ onNext, submitLabel = '다음', disabled = false }: Props) {
  const {
    title,
    anniversaryDate,
    preparationStartDate,
    preparationEndDate,
    greeting,
    thumbnailImage,
    setStep1,
  } = useFundingCreateStore();

  const [errors, setErrors] = useState<{ title?: boolean; anniversaryDate?: boolean; preparation?: boolean }>({});
  const [openSheet, setOpenSheet] = useState<'date' | 'range' | null>(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

  const isValid = Boolean(title.trim() && anniversaryDate && preparationStartDate && preparationEndDate);

  const validate = () => {
    const newErrors = {
      title: !title.trim(),
      anniversaryDate: !anniversaryDate,
      preparation: !(preparationStartDate && preparationEndDate),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">기본 정보를 입력해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">친구들에게 보여질 선물 페이지 정보를 작성해주세요</p>
        </div>

        {/* 제목 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            선물 페이지 제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="선물 페이지 제목을 입력해주세요"
            value={title}
            onChange={(e) => setStep1({ title: e.target.value })}
            className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border
              ${errors.title ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50 focus:border-gray-800 focus:bg-white'}`}
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 선물 필요 날짜 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            선물 필요 날짜 <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSheet('date')}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm text-left border transition-colors
              ${errors.anniversaryDate ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50'}`}
          >
            <span className={anniversaryDate ? 'text-gray-800' : 'text-gray-400'}>
              {anniversaryDate ? formatDisplay(anniversaryDate) : '선물이 필요한 날짜를 선택해주세요'}
            </span>
            <span className="text-gray-400" aria-hidden>📅</span>
          </button>
          {errors.anniversaryDate && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 선물 준비 기간 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            선물 준비 기간 <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSheet('range')}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm text-left border transition-colors
              ${errors.preparation ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50'}`}
          >
            <span className={preparationStartDate && preparationEndDate ? 'text-gray-800' : 'text-gray-400'}>
              {preparationStartDate && preparationEndDate
                ? `${formatDisplay(preparationStartDate)} ~ ${formatDisplay(preparationEndDate)}`
                : '선물 준비 기간을 설정해주세요'}
            </span>
            <span className="text-gray-400" aria-hidden>📅</span>
          </button>
          {errors.preparation && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 페이지 소개글 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">페이지 소개글</label>
          <textarea
            placeholder="친구들에게 전하고 싶은 말을 적어주세요"
            value={greeting}
            onChange={(e) => setStep1({ greeting: e.target.value })}
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-gray-50 border border-transparent focus:border-gray-800 focus:bg-white resize-none transition-colors"
          />
        </div>

        {/* 대표 이미지 */}
        <div className="border border-dashed border-gray-300 rounded-2xl p-6">
          {thumbnailImage ? (
            <div className="relative">
              <img
                src={typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)}
                alt="대표 이미지"
                className="w-full h-36 object-cover rounded-lg"
              />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="페이지 이미지 삭제하기"
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPhotoSheet(true)}
              className="w-full flex flex-col items-center justify-center gap-2 text-gray-400"
            >
              <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl leading-none">
                +
              </span>
              <span className="text-xs">페이지 이미지 업로드</span>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid || disabled}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>

      {openSheet === 'date' && (
        <DateSheet
          mode="single"
          initialDate={anniversaryDate || undefined}
          onClose={() => setOpenSheet(null)}
          onConfirm={(date) => {
            setStep1({ anniversaryDate: date });
            setOpenSheet(null);
          }}
        />
      )}
      {openSheet === 'range' && (
        <DateSheet
          mode="range"
          initialStart={preparationStartDate || undefined}
          initialEnd={preparationEndDate || undefined}
          onClose={() => setOpenSheet(null)}
          onConfirm={(start, end) => {
            setStep1({ preparationStartDate: start, preparationEndDate: end });
            setOpenSheet(null);
          }}
        />
      )}
      {showPhotoSheet && (
        <PhotoActionSheet
          onClose={() => setShowPhotoSheet(false)}
          onSelect={(file) => {
            setShowPhotoSheet(false);
            setPendingCropFile(file);
          }}
        />
      )}

      {pendingCropFile && (
        <ImageCropper
          file={pendingCropFile}
          aspectRatio={THUMBNAIL_ASPECT_RATIO}
          onCancel={() => setPendingCropFile(null)}
          onConfirm={(croppedFile) => {
            setStep1({ thumbnailImage: croppedFile });
            setPendingCropFile(null);
          }}
        />
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        title="이미지를 삭제하시겠습니까?"
        cancelText="취소"
        confirmText="삭제"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setStep1({ thumbnailImage: null });
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
}
