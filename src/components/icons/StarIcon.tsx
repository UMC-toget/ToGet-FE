/** 별 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function StarIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12.8665 11.68L15.9999 4L19.1332 11.68L27.4132 12.2933L21.0665 17.6533L23.0532 25.7067L15.9999 21.3333L8.94655 25.7067L10.9332 17.6533L4.58655 12.2933L12.8665 11.68Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
