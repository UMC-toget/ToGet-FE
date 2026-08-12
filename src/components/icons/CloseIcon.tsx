/** 닫기(X) 아이콘. 색상은 currentColor를 따릅니다. */
export default function CloseIcon({
  className = 'size-6',
  strokeLinecap = 'round',
}: {
  className?: string
  /** 선 끝 모양. 기본값은 둥근 끝(round) */
  strokeLinecap?: 'round' | 'butt' | 'square'
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap={strokeLinecap} strokeLinejoin="round" />
    </svg>
  )
}
