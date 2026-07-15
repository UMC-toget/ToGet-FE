/** 검색(돋보기) 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function SearchIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(3.46 3.46)">
        <path d="M7.11621 0.75C10.6322 0.75 13.4834 3.60095 13.4834 7.11816C13.4834 10.6354 10.6322 13.4863 7.11621 13.4863C3.60039 13.4862 0.75 10.6353 0.75 7.11816C0.75003 3.60106 3.6004 0.750178 7.11621 0.75Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11.6297 11.7706L17 17.0828" stroke="currentColor" strokeWidth="1.5"/>
      </g>
    </svg>
  )
}
