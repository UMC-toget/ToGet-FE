import { useState } from 'react';
import { X } from 'lucide-react';
import calendarIcon from '../../assets/calendar.svg';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import DateSheet, { formatDisplay } from './DateSheet';
import PhotoActionSheet from '../common/PhotoActionSheet';
import ConfirmModal from '../common/ConfirmModal';
import { FUNDING_INTRODUCTION_MAX_LENGTH, FUNDING_TITLE_MAX_LENGTH } from '../../constants/fundingFieldLimits';

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
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">기본 정보를 입력해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">친구들에게 보여질 선물 페이지 정보를 작성해주세요</p>
        </div>

        {/* 제목 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              선물 페이지 제목 <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] text-gray-400">{title.length}/{FUNDING_TITLE_MAX_LENGTH}</span>
          </div>
          <input
            type="text"
            maxLength={FUNDING_TITLE_MAX_LENGTH}
            placeholder="선물 페이지 제목을 입력해주세요"
            value={title}
            onChange={(e) => setStep1({ title: e.target.value.slice(0, FUNDING_TITLE_MAX_LENGTH) })}
            className={`h-12 w-full rounded-xl border px-4 text-b1-m text-black outline-none transition-colors placeholder:text-b1-r placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200
              ${errors.title ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-100/70'}`}
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 선물 필요 날짜 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            선물 필요 날짜 <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSheet('date')}
            className={`h-12 w-full flex items-center justify-between rounded-xl px-4 text-left border transition-colors
              ${errors.anniversaryDate ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-100/70'}`}
          >
            <span className={anniversaryDate ? 'text-b1-m text-black' : 'text-b1-r text-gray-400'}>
              {anniversaryDate ? formatDisplay(anniversaryDate) : '선물이 필요한 날짜를 선택해주세요'}
            </span>
            <img src={calendarIcon} alt="" className="h-[19px] w-[18px] shrink-0" aria-hidden />
          </button>
          {errors.anniversaryDate && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 선물 준비 기간 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            선물 준비 기간 <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSheet('range')}
            className={`h-12 w-full flex items-center justify-between rounded-xl px-4 text-left border transition-colors
              ${errors.preparation ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-100/70'}`}
          >
            <span className={preparationStartDate && preparationEndDate ? 'text-b1-m text-black' : 'text-b1-r text-gray-400'}>
              {preparationStartDate && preparationEndDate
                ? `${formatDisplay(preparationStartDate)} ~ ${formatDisplay(preparationEndDate)}`
                : '선물 준비 기간을 설정해주세요'}
            </span>
            <img src={calendarIcon} alt="" className="h-[19px] w-[18px] shrink-0" aria-hidden />
          </button>
          {errors.preparation && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 페이지 소개글 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">페이지 소개글</label>
            <span className="text-[11px] text-gray-400">{greeting.length}/{FUNDING_INTRODUCTION_MAX_LENGTH}</span>
          </div>
          <textarea
            maxLength={FUNDING_INTRODUCTION_MAX_LENGTH}
            placeholder="친구들에게 전하고 싶은 말을 적어주세요"
            value={greeting}
            onChange={(e) => setStep1({ greeting: e.target.value.slice(0, FUNDING_INTRODUCTION_MAX_LENGTH) })}
            rows={3}
            className="h-[72px] w-full resize-none rounded-xl border border-transparent bg-gray-100/70 px-4 py-3 text-b1-m text-black outline-none transition-colors placeholder:text-b1-r placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200"
          />
        </div>

        {/* 대표 이미지 */}
        <div className="h-[156px] rounded-2xl border border-dashed border-gray-300 p-3">
          {thumbnailImage ? (
            <div className="relative h-full">
              <img
                src={typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)}
                alt="대표 이미지"
                className="h-full w-full rounded-lg object-cover"
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
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400"
            >
              <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl leading-none">
                +
              </span>
              <span className="text-xs">페이지 이미지 업로드</span>
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isValid || disabled}
          className="h-14 w-full rounded-xl bg-gray-900 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitLabel}
        </button>
      </div>

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
          aspectRatio={THUMBNAIL_ASPECT_RATIO}
          onClose={() => setShowPhotoSheet(false)}
          onSelect={(file) => {
            setStep1({ thumbnailImage: file });
            setShowPhotoSheet(false);
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
