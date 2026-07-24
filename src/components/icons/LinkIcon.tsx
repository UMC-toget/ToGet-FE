/** 체인 링크 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function LinkIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M7.643 12.358L12.357 7.644M5.876 9.411L4.697 10.590C3.395 11.892 3.395 14.002 4.697 15.304C5.999 16.606 8.110 16.605 9.412 15.304L10.589 14.125M9.411 5.875L10.589 4.697C11.891 3.395 14.001 3.395 15.303 4.697C16.605 5.999 16.605 8.109 15.303 9.411L14.125 10.590"
        stroke="currentColor"
        strokeWidth="1.13"
        strokeLinejoin="round"
      />
    </svg>
  )
}
