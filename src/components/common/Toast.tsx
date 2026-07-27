interface ToastProps {
  message: string
  open: boolean
  /** 지정하면 토스트 오른쪽에 텍스트 액션 버튼이 추가로 표시됩니다 (예: "실행취소") */
  actionLabel?: string
  onAction?: () => void
  /** BottomNav가 없는 화면(로그인 등)에서 화면 하단에 더 가깝게 표시 */
  standalone?: boolean
}

/**
 * 하단 스낵바 토스트 (피그마 스낵바 기준). 기본은 하단 네비게이션 바로 위에 표시됩니다.
 * 표시/숨김 타이밍은 사용하는 쪽에서 제어합니다.
 *
 * @example
 * <Toast open={toastOpen} message="로그아웃이 완료 되었습니다" />
 * <Toast open={toastOpen} message="선물 페이지가 수정 완료되었습니다" actionLabel="실행취소" onAction={handleUndo} />
 */
export default function Toast({ message, open, actionLabel, onAction, standalone }: ToastProps) {
  if (!open) return null

  return (
    <div
      className={`fixed left-1/2 z-40 w-full max-w-[402px] -translate-x-1/2 px-[18px] ${standalone ? 'bottom-16' : 'bottom-[88px]'}`}
    >
      <div
        className={`flex h-11 items-center rounded-[5px] bg-gray-100/80 px-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] backdrop-blur-[30px] ${
          actionLabel ? 'justify-between gap-3' : 'justify-center'
        }`}
      >
        <p className="text-b2-m text-black">{message}</p>
        {actionLabel && (
          <button type="button" onClick={onAction} className="shrink-0 text-b2-m font-semibold text-pink-500">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
