/** Plus 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function PlusIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 4.94531V12.0041M3 12.0041H12M12 12.0041V19.063M12 12.0041H21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
