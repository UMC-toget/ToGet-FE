/** 말풍선형 배지 꼬리 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function BadgeTailIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M7.13398 14.5C7.51888 15.1667 8.48113 15.1667 8.86603 14.5L14.0622 5.5C14.4471 4.83333 13.966 4 13.1962 4H2.80385C2.03405 4 1.55292 4.83333 1.93782 5.5L7.13398 14.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
