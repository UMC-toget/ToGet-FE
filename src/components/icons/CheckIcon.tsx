/** 체크 표시 아이콘. 색상은 currentColor를 따릅니다. */
export default function CheckIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.89746 11.9997L10.0641 16.1663L18.3975 7.83301" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
