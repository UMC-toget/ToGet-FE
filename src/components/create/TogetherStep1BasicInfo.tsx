import { useState } from 'react';
import { X } from 'lucide-react';
import calendarIcon from '../../assets/calendar.svg';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import DateSheet, { formatDisplay } from './DateSheet';
import PhotoActionSheet from '../common/PhotoActionSheet';
import ImageCropper from '../common/ImageCropper';
import ConfirmModal from '../common/ConfirmModal';
import { FUNDING_INTRODUCTION_MAX_LENGTH, FUNDING_TITLE_MAX_LENGTH } from '../../constants/fundingFieldLimits';

// 준비방 대표 이미지는 정사각형으로 자름
const THUMBNAIL_ASPECT_RATIO = 1;

interface Props {
  onNext: () => void;
}

export default function TogetherStep1BasicInfo({ onNext }: Props) {
  const { roomName, recipientName, giftDate, memo, thumbnailImage, setStep1 } = useTogetherCreateStore();

  const [openDateSheet, setOpenDateSheet] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

  const isValid = Boolean(roomName.trim() && recipientName.trim() && giftDate);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">준비방 기본 정보를 입력해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">선물 받을 사람의 기념일 정보를 입력해요</p>
        </div>

        {/* 준비방 이름 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              준비방 이름 <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] text-gray-400">{roomName.length}/{FUNDING_TITLE_MAX_LENGTH}</span>
          </div>
          <input
            type="text"
            maxLength={FUNDING_TITLE_MAX_LENGTH}
            placeholder="준비방 이름을 입력해주세요"
            value={roomName}
            onChange={(e) => setStep1({ roomName: e.target.value.slice(0, FUNDING_TITLE_MAX_LENGTH) })}
            className="h-12 w-full rounded-xl border border-transparent bg-gray-100/70 px-4 text-b1-m text-black outline-none transition-colors placeholder:text-b1-r placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200"
          />
        </div>

        {/* 선물 받을 사람 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            선물 받을 사람 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="선물 받을 사람의 이름을 입력해주세요"
            value={recipientName}
            onChange={(e) => setStep1({ recipientName: e.target.value })}
            className="h-12 w-full rounded-xl border border-transparent bg-gray-100/70 px-4 text-b1-m text-black outline-none transition-colors placeholder:text-b1-r placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200"
          />
        </div>

        {/* 기념일 날짜 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            기념일 날짜 <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setOpenDateSheet(true)}
            className="h-12 w-full flex items-center justify-between rounded-xl border border-transparent bg-gray-100/70 px-4 text-left"
          >
            <span className={giftDate ? 'text-b1-m text-black' : 'text-b1-r text-gray-400'}>
              {giftDate ? formatDisplay(giftDate) : '선물을 받고 싶은 날을 선택해주세요'}
            </span>
            <img src={calendarIcon} alt="" className="h-[19px] w-[18px] shrink-0" aria-hidden />
          </button>
        </div>

        {/* 준비방 소개글 또는 메모 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">준비방 소개글 또는 메모</label>
            <span className="text-[11px] text-gray-400">{memo.length}/{FUNDING_INTRODUCTION_MAX_LENGTH}</span>
          </div>
          <textarea
            maxLength={FUNDING_INTRODUCTION_MAX_LENGTH}
            placeholder="선물 준비에 대해 간단히 소개 해주세요"
            value={memo}
            onChange={(e) => setStep1({ memo: e.target.value.slice(0, FUNDING_INTRODUCTION_MAX_LENGTH) })}
            rows={3}
            className="h-[72px] w-full resize-none rounded-xl border border-transparent bg-gray-100/70 px-4 py-3 text-b1-m text-black outline-none transition-colors placeholder:text-b1-r placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200"
          />
        </div>

        {/* 준비방 대표 이미지 */}
        <div className="h-[156px] rounded-2xl border border-dashed border-gray-300 p-3">
          {thumbnailImage ? (
            <div className="relative h-full">
              <img
                src={typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)}
                alt="준비방 대표 이미지"
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="대표 이미지 삭제하기"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPhotoSheet(true)}
              aria-label="준비방 대표 이미지 업로드"
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl leading-none">
                +
              </span>
              <span className="text-xs">페이지 이미지 업로드</span>
            </button>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!isValid}
          className="h-14 w-full rounded-xl bg-gray-900 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          다음
        </button>
      </div>

      {openDateSheet && (
        <DateSheet
          mode="single"
          initialDate={giftDate || undefined}
          onClose={() => setOpenDateSheet(false)}
          onConfirm={(date) => {
            setStep1({ giftDate: date });
            setOpenDateSheet(false);
          }}
        />
      )}

      {showPhotoSheet && (
        <PhotoActionSheet
          aspectRatio={THUMBNAIL_ASPECT_RATIO}
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
