/** 은행/계좌 아이콘 (은행 로고가 없을 때의 자리표시자, 빈 상태 안내에 사용). 색상은 currentColor를 따릅니다. */
export default function BankIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M2.5 9.5L12 3L21.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9.5V19.5M8.5 9.5V19.5M15.5 9.5V19.5M20 9.5V19.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M2.5 19.5H21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
