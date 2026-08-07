import { useState } from 'react';
import { X } from 'lucide-react';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import DateSheet, { formatDisplay } from './DateSheet';
import PhotoActionSheet from '../common/PhotoActionSheet';
import ImageCropper from '../common/ImageCropper';
import ConfirmModal from '../common/ConfirmModal';

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
      <div className="flex-1 overflow-y-auto space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">준비방 기본 정보를 입력해 주세요</h2>
          <p className="text-xs text-gray-400 mt-1">선물 받을 사람의 기념일 정보를 입력해요</p>
        </div>

        {/* 준비방 이름 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            준비방 이름 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="준비방 이름을 입력해주세요"
            value={roomName}
            onChange={(e) => setStep1({ roomName: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none bg-gray-50 border border-transparent focus:border-gray-800 focus:bg-white transition-colors"
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
            className="w-full rounded-xl px-4 py-3 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none bg-gray-50 border border-transparent focus:border-gray-800 focus:bg-white transition-colors"
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
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm text-left bg-gray-50 border border-transparent"
          >
            <span className={giftDate ? 'text-gray-800' : 'text-gray-400'}>
              {giftDate ? formatDisplay(giftDate) : '선물을 받고 싶은 날을 선택해주세요'}
            </span>
            <span className="text-gray-400" aria-hidden>
              📅
            </span>
          </button>
        </div>

        {/* 준비방 소개글 또는 메모 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">준비방 소개글 또는 메모</label>
          <input
            type="text"
            placeholder="선물 준비에 대해 간단히 소개 해주세요"
            value={memo}
            onChange={(e) => setStep1({ memo: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-b1-m text-black placeholder:text-b1-r placeholder:text-gray-400 outline-none bg-gray-50 border border-transparent focus:border-gray-800 focus:bg-white transition-colors"
          />
        </div>

        {/* 준비방 대표 이미지 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">준비방 대표 이미지</label>
          {thumbnailImage ? (
            <div className="relative w-24 h-24">
              <img
                src={typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)}
                alt="준비방 대표 이미지"
                className="w-24 h-24 object-cover rounded-xl"
              />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="대표 이미지 삭제하기"
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPhotoSheet(true)}
              aria-label="준비방 대표 이미지 업로드"
              className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg leading-none">
                +
              </span>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        다음
      </button>

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
