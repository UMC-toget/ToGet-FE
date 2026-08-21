import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import calendarIcon from '../../assets/calendar.svg';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import DateSheet, { formatDisplay } from './DateSheet';
import PhotoActionSheet from '../common/PhotoActionSheet';
import ConfirmModal from '../common/ConfirmModal';
import TextField from '../common/TextField';
import { replayShake } from '../../utils/shake';
import { FUNDING_INTRODUCTION_MAX_LENGTH, FUNDING_TITLE_MAX_LENGTH } from '../../constants/fundingFieldLimits';

// 대표 이미지(페이지 썸네일) 자르기 비율 - 목록/카드에서 쓰이는 와이드 배너 형태
const THUMBNAIL_ASPECT_RATIO = 364 / 173;
const INTRODUCTION_SHAKE_AMPLITUDE = '1.8px';

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
  const introRef = useRef<HTMLTextAreaElement>(null);

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

  // 페이지 소개글은 공용 TextField 같은 텍스트 필드가 없는 textarea라, 글자수 제한 초과 시
  // 흔들리는 동작(TextField.tsx 참고)을 여기서도 동일하게 직접 구현합니다.
  const handleIntroductionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > FUNDING_INTRODUCTION_MAX_LENGTH) {
      e.target.value = e.target.value.slice(0, FUNDING_INTRODUCTION_MAX_LENGTH);
      replayShake(introRef.current);
    }
    setStep1({ greeting: e.target.value });
  };

  const handleIntroductionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      greeting.length >= FUNDING_INTRODUCTION_MAX_LENGTH &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      replayShake(introRef.current);
    }
  };

  // 줄바꿈이 생기면 스크롤 대신 박스 높이 자체가 늘어나도록 (draft 복원 등 값이 바뀔 때도 재계산)
  useEffect(() => {
    const el = introRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [greeting]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
        <div className='mb-6'>
          <h2 className="text-lg font-bold text-gray-900">기본 정보를 입력해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">친구들에게 보여질 선물 페이지 정보를 작성해주세요</p>
        </div>

        {/* 제목 */}
        <div>
          <TextField
            label={
              <>
                선물 페이지 제목 <span className="text-pink-500">*</span>
              </>
            }
            value={title}
            maxLength={FUNDING_TITLE_MAX_LENGTH}
            hideCounter
            placeholder="선물 페이지 제목을 입력해주세요"
            onChange={(e) => setStep1({ title: e.target.value })}
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 기념일 날짜 */}
        <div>
          <label className="text-b1-m text-black mb-2 block">
            기념일 날짜 <span className="text-pink-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSheet('date')}
            className={`h-12 w-full flex items-center justify-between rounded-lg px-4 text-left border transition-colors
              ${errors.anniversaryDate ? 'border-red-400 bg-red-50' : 'border-transparent bg-background'}`}
          >
            <span className={anniversaryDate ? 'text-b1-m text-black' : 'text-b1-r text-gray-400'}>
              {anniversaryDate ? formatDisplay(anniversaryDate) : '선물이 필요한 날짜를 선택해주세요'}
            </span>
            <img src={calendarIcon} alt="" className="h-[17px] w-[17px] shrink-0" aria-hidden />
          </button>
          {errors.anniversaryDate && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 선물 준비 기간 */}
        <div>
          <label className="text-b1-m text-black mb-2 block">
            선물 준비 기간 <span className="text-pink-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenSheet('range')}
            className={`h-12 w-full flex items-center justify-between rounded-lg px-4 text-left border transition-colors
              ${errors.preparation ? 'border-red-400 bg-red-50' : 'border-transparent bg-background'}`}
          >
            <span className={preparationStartDate && preparationEndDate ? 'text-b1-m text-black' : 'text-b1-r text-gray-400'}>
              {preparationStartDate && preparationEndDate
                ? `${formatDisplay(preparationStartDate)} ~ ${formatDisplay(preparationEndDate)}`
                : '선물 준비 기간을 설정해주세요'}
            </span>
            <img src={calendarIcon} alt="" className="h-[17px] w-[17px] shrink-0" aria-hidden />
          </button>
          {errors.preparation && (
            <p className="text-xs text-red-400 mt-1">▲ 아직 채워지지 않은 항목이 있어요</p>
          )}
        </div>

        {/* 페이지 소개글 */}
        <div>
          <label className="text-b1-m text-black mb-2 block">페이지 소개글</label>
          <textarea
            ref={introRef}
            maxLength={FUNDING_INTRODUCTION_MAX_LENGTH}
            placeholder="친구들에게 전하고 싶은 말을 적어주세요"
            value={greeting}
            onChange={handleIntroductionChange}
            onKeyDown={handleIntroductionKeyDown}
            rows={1}
            className="w-full resize-none overflow-hidden rounded-lg border border-transparent bg-background px-4 pt-[14px] pb-[14px] text-b1-m text-black outline-none transition-colors placeholder:text-b1-r placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200"
            style={{ '--shake-amp': INTRODUCTION_SHAKE_AMPLITUDE, lineHeight: '24px' } as React.CSSProperties}
          />
        </div>

        {/* 대표 이미지 */}
        <div className="h-[173px] rounded-lg bg-background/50 p-3">
          {thumbnailImage ? (
            <div className="group relative h-full">
              <img
                src={typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)}
                alt="대표 이미지"
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="페이지 이미지 삭제하기"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <X size={16} className="text-gray-600" />
                </span>
                <span className="text-b1-m text-gray-100">페이지 이미지 삭제하기</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPhotoSheet(true)}
              className="flex h-full w-full flex-col items-center justify-center gap-2"
            >
              <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus size={20} strokeWidth={1.5} strokeLinecap="square" className="scale-x-125 text-gray-600" />
              </span>
              <span className="text-b1-m text-gray-600">페이지 이미지 업로드</span>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid || disabled}
        className="h-14 w-full shrink-0 rounded-xl bg-gray-900 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 mt-4"
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
