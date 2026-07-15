import { useState } from 'react'
import CheckIcon from '../icons/CheckIcon'

/** 느낌표 아이콘 (모달용, 흰색) */
function ExclamationIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 4.5V19.5" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="16" cy="27" r="2.5" fill="white" />
    </svg>
  )
}

interface ConfirmModalProps {
  open: boolean
  /** 제목 (예: "로그아웃 하시겠습니까?") */
  title: string
  /** 제목 아래 설명. \n으로 줄바꿈 가능 */
  description?: string
  /** 지정하면 동의 체크박스가 표시되고, 체크 전까지 확인 버튼이 비활성화됩니다 */
  agreeText?: string
  cancelText?: string
  confirmText: string
  onCancel: () => void
  onConfirm: () => void
}

/**
 * 확인 모달 (피그마 "이모티콘 있는 팝업" 기준: 핑크 느낌표 아이콘 + 2버튼)
 *
 * @example
 * <ConfirmModal open={open} title="로그아웃 하시겠습니까?" description="언제든 다시 로그인 할 수 있어요"
 *   confirmText="로그아웃" onCancel={() => setOpen(false)} onConfirm={handleLogout} />
 * <ConfirmModal open={open} title="계정을 삭제할까요?" agreeText="네, 동의합니다"
 *   confirmText="삭제하기" onCancel={close} onConfirm={handleDelete} />
 */
export default function ConfirmModal({
  open,
  title,
  description,
  agreeText,
  cancelText = '돌아가기',
  confirmText,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [agreed, setAgreed] = useState(false)

  if (!open) return null

  const confirmDisabled = agreeText !== undefined && !agreed

  const handleCancel = () => {
    setAgreed(false)
    onCancel()
  }

  const handleConfirm = () => {
    setAgreed(false)
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-[18px]">
      <button type="button" aria-label="닫기" onClick={handleCancel} className="absolute inset-0 bg-black/50" />
      <div className="relative flex w-[320px] flex-col items-center gap-5 rounded-[20px] bg-white px-6 py-7">
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col items-center gap-5">
            <div className="flex size-12 items-center justify-center rounded-3xl bg-pink-500">
              <ExclamationIcon />
            </div>
            <p className="text-h3-sb text-black">{title}</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            {description && (
              <p className="whitespace-pre-line text-center text-b2-r leading-normal text-gray-600">{description}</p>
            )}
            {agreeText !== undefined && (
              <button type="button" onClick={() => setAgreed((prev) => !prev)} className="flex items-center gap-2">
                <span
                  className={`flex size-4 items-center justify-center rounded text-white ${agreed ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <CheckIcon className="size-3.5" />
                </span>
                <span className="text-b2-m text-gray-700">{agreeText}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-[42px] w-[130px] items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={handleConfirm}
            className="flex h-[42px] w-[130px] items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
