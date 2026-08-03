interface ToastProps {
  message: string
  open: boolean
  /** 지정하면 토스트 오른쪽에 텍스트 액션 버튼이 추가로 표시됩니다 (예: "실행취소") */
  actionLabel?: string
  onAction?: () => void
  /** BottomNav가 없는 화면(로그인 등)에서 화면 하단에 더 가깝게 표시 */
  standalone?: boolean
  /** 'pink': 핑크 배경 + 체크 아이콘 (초대장 링크 복사 등) */
  variant?: 'default' | 'pink'
  /** bottom 위치 override (예: "bottom-[102px]"). 미지정 시 standalone 여부에 따라 자동 결정 */
  bottomClass?: string
}

/**
 * 하단 스낵바 토스트 (피그마 스낵바 기준). 기본은 하단 네비게이션 바로 위에 표시됩니다.
 * 표시/숨김 타이밍은 사용하는 쪽에서 제어합니다.
 *
 * @example
 * <Toast open={toastOpen} message="로그아웃이 완료 되었습니다" />
 * <Toast open={toastOpen} message="선물 페이지가 수정 완료되었습니다" actionLabel="실행취소" onAction={handleUndo} />
 * <Toast open={toastOpen} message="초대장 링크가 복사되었습니다." variant="pink" />
 */
export default function Toast({ message, open, actionLabel, onAction, standalone, variant = 'default', bottomClass }: ToastProps) {
  if (!open) return null

  const bottom = bottomClass ?? (standalone ? 'bottom-16' : 'bottom-[88px]')

  if (variant === 'pink') {
    return (
      <div className={`fixed left-1/2 z-40 w-full max-w-[402px] -translate-x-1/2 px-[18px] ${bottom}`}>
        <div style={{ display: 'flex', width: '367px', height: '44px', padding: '15px 140px 15px 18px', alignItems: 'center', gap: '10px', borderRadius: '8px', background: 'rgba(255, 227, 237, 0.90)' }}>
          <div style={{ display: 'flex', width: '25px', height: '25px', padding: '8.333px', justifyContent: 'center', alignItems: 'center', gap: '8.333px', flexShrink: 0, borderRadius: '999px', background: '#FE71A5' }}>
            <svg width="10.417" height="6.944" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M0.441406 3.9146L3.91363 7.38683L10.8581 0.442383" stroke="white" strokeWidth="1.25" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontFamily: 'Noto Sans KR', fontSize: '12px', fontWeight: 500, lineHeight: '1', color: '#000', whiteSpace: 'nowrap' }}>{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed left-1/2 z-40 w-full max-w-[402px] -translate-x-1/2 px-[18px] ${bottom}`}
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
