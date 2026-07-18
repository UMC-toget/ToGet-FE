import CloseIcon from '../../components/icons/CloseIcon'

interface LetterModalProps {
  open: boolean
  /** 받는 사람 (개설자 닉네임) */
  hostName: string
  content: string
  /** 발신자 표시명 (익명/비공개 처리 반영된 값). null이면 from. 줄 미표시 (이름 공개 OFF) */
  senderLabel: string | null
  onClose: () => void
}

/** 축하 메세지 편지 팝업 */
export default function LetterModal({ open, hostName, content, senderLabel, onClose }: LetterModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />
      <div className="relative flex w-[366px] max-w-[calc(100%-36px)] flex-col items-center gap-4">
        <div className="w-full rounded-xl border border-pink-500 bg-pink-100 px-4 py-3">
          <p className="flex h-6 items-center text-b1-m text-black">{hostName}에게</p>
          {/* 28px 간격 편지지 밑줄 */}
          <div className="mt-[13px] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_27px,rgba(254,113,165,0.5)_27px,rgba(254,113,165,0.5)_28px)] pb-[28px]">
            <p className="whitespace-pre-line text-b2-r leading-[28px] text-gray-800">{content}</p>
            {senderLabel != null && (
              <p className="text-right text-b2-r leading-[28px] text-gray-800">from. {senderLabel}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label="편지 닫기"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full bg-white shadow-[0px_13px_161px_0px_rgba(0,0,0,0.04)]"
        >
          <CloseIcon className="size-6 text-black" />
        </button>
      </div>
    </div>
  )
}
