interface ToastProps {
  message: string
  open: boolean
}

/**
 * 하단 스낵바 토스트 (피그마 스낵바 기준). 하단 네비게이션 바로 위에 표시됩니다.
 * 표시/숨김 타이밍은 사용하는 쪽에서 제어합니다.
 *
 * @example
 * <Toast open={toastOpen} message="로그아웃이 완료 되었습니다" />
 */
export default function Toast({ message, open }: ToastProps) {
  if (!open) return null

  return (
    <div className="fixed bottom-[88px] left-1/2 z-40 w-full max-w-[402px] -translate-x-1/2 px-[18px]">
      <div className="flex h-11 items-center justify-center rounded-[5px] bg-gray-100/80 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] backdrop-blur-[30px]">
        <p className="text-b2-m text-black">{message}</p>
      </div>
    </div>
  )
}
