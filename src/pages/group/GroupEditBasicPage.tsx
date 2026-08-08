import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import CloseIcon from '../../components/icons/CloseIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import DateSheet, { formatDisplay } from '../../components/create/DateSheet'
import PhotoActionSheet from '../../components/common/PhotoActionSheet'
import ImageCropper from '../../components/common/ImageCropper'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useTogetherCreateStore } from '../../store/togetherCreateStore'

// 접근: 개설자 전용 | 선물 페이지 수정 1단계 — 기본 정보 (G섹션 store 재사용)
const THUMBNAIL_ASPECT_RATIO = 1

export default function GroupEditBasicPage() {
  const navigate = useNavigate()
  const { roomName, recipientName, giftDate, memo, thumbnailImage, setStep1 } = useTogetherCreateStore()

  const [openDateSheet, setOpenDateSheet] = useState(false)
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null)

  const isValid = Boolean(roomName.trim() && recipientName.trim() && giftDate)

  const handleSubmit = () => {
    if (!isValid) return
    // TODO: 기본 정보 수정 API 연동 (G섹션 저장 로직 재사용)
    navigate(-1)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header
        title="1단계 : 기본 정보"
        right={
          <button type="button" onClick={() => setShowLeaveConfirm(true)} className="text-b2-m text-gray-600">
            나가기
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-[18px] pb-[120px] pt-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-h3-sb text-black">준비방 기본 정보를 입력해 주세요</h2>
          <p className="text-caption1-r text-gray-600">선물 받을 사람의 기념일 정보를 입력해요</p>
        </div>

        {/* 준비방 이름 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">
            준비방 이름 <span className="text-pink-500">*</span>
          </p>
          <div className="flex h-12 items-center rounded-lg bg-background px-4">
            <input
              type="text"
              value={roomName}
              onChange={e => setStep1({ roomName: e.target.value })}
              placeholder="준비방 이름을 입력해주세요"
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 선물 받을 사람 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">
            선물 받을 사람 <span className="text-pink-500">*</span>
          </p>
          <div className="flex h-12 items-center rounded-lg bg-background px-4">
            <input
              type="text"
              value={recipientName}
              onChange={e => setStep1({ recipientName: e.target.value })}
              placeholder="선물 받을 사람의 이름을 입력해주세요"
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 선물 필요 날짜 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">
            선물 필요 날짜 <span className="text-pink-500">*</span>
          </p>
          <button
            type="button"
            onClick={() => setOpenDateSheet(true)}
            className="flex h-12 items-center justify-between rounded-lg bg-background px-4"
          >
            <span className={giftDate ? 'text-b1-r text-black' : 'text-b1-r text-gray-400'}>
              {giftDate ? formatDisplay(giftDate) : '선물을 받고 싶은 날을 선택해주세요'}
            </span>
            <svg width="24" height="24" viewBox="326 10.9 24 24" fill="none" className="shrink-0">
              <path d="M330 20.0032H346M330 20.0032V28.8034C330 29.9235 330 30.4833 330.218 30.9111C330.41 31.2874 330.715 31.5937 331.092 31.7855C331.519 32.0032 332.079 32.0032 333.197 32.0032H342.803C343.921 32.0032 344.48 32.0032 344.907 31.7855C345.284 31.5937 345.59 31.2874 345.782 30.9111C346 30.4837 346 29.9247 346 28.8068V20.0032M330 20.0032V19.2034C330 18.0833 330 17.5228 330.218 17.095C330.41 16.7187 330.715 16.413 331.092 16.2212C331.519 16.0032 332.079 16.0032 333.197 16.0032H334M346 20.0032V19.2001C346 18.0822 346 17.5224 345.782 17.095C345.59 16.7187 345.284 16.413 344.907 16.2212C344.48 16.0032 343.92 16.0032 342.8 16.0032H342M334 16.0032H342M334 16.0032V13.8125M342 16.0032V13.8125M342 24.0032H334" stroke="#1E1D1E" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 준비방 소개글 또는 메모 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">준비방 소개글 또는 메모</p>
          <div className="flex h-12 items-center rounded-lg bg-background px-4">
            <input
              type="text"
              value={memo}
              onChange={e => setStep1({ memo: e.target.value })}
              placeholder="선물 준비에 대해 간단히 소개 해주세요"
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 준비방 대표 이미지 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">준비방 대표 이미지</p>
          {thumbnailImage ? (
            <div className="relative size-[123px]">
              <img
                src={typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)}
                alt="준비방 대표 이미지"
                className="size-full rounded-2xl object-cover"
              />
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="대표 이미지 삭제하기"
                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/50"
              >
                <CloseIcon className="size-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPhotoSheet(true)}
              aria-label="준비방 대표 이미지 업로드"
              className="flex size-[123px] items-center justify-center rounded-2xl bg-background"
            >
              <PlusIcon className="size-8 text-gray-300" />
            </button>
          )}
        </div>
      </div>

      <StickyBottomBar>
        <Button className="pointer-events-auto" disabled={!isValid} onClick={handleSubmit}>
          수정 완료
        </Button>
      </StickyBottomBar>

      {openDateSheet && (
        <DateSheet
          mode="single"
          initialDate={giftDate || undefined}
          onClose={() => setOpenDateSheet(false)}
          onConfirm={date => {
            setStep1({ giftDate: date })
            setOpenDateSheet(false)
          }}
        />
      )}

      {showPhotoSheet && (
        <PhotoActionSheet
          aspectRatio={THUMBNAIL_ASPECT_RATIO}
          onClose={() => setShowPhotoSheet(false)}
          onSelect={file => {
            setShowPhotoSheet(false)
            setPendingCropFile(file)
          }}
        />
      )}

      {pendingCropFile && (
        <ImageCropper
          file={pendingCropFile}
          aspectRatio={THUMBNAIL_ASPECT_RATIO}
          onCancel={() => setPendingCropFile(null)}
          onConfirm={croppedFile => {
            setStep1({ thumbnailImage: croppedFile })
            setPendingCropFile(null)
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
          setStep1({ thumbnailImage: null })
          setShowDeleteConfirm(false)
        }}
      />

      <ConfirmModal
        open={showLeaveConfirm}
        title="페이지를 나가시겠어요?"
        description={'페이지를 나가면,\n작성한 내용이 모두 사라져요'}
        cancelText="나가기"
        confirmText="이어서 작성하기"
        onCancel={() => navigate(-1)}
        onConfirm={() => setShowLeaveConfirm(false)}
      />
    </div>
  )
}
