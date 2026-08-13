/** 확대(대각선 모서리 두 조각) 아이콘. 색상은 currentColor를 따릅니다. */
export default function ZoomInIcon({
  className = 'size-6',
  width,
  height,
}: {
  className?: string
  width?: number | string
  height?: number | string
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.333 15.832H4.167V11.665M11.667 4.165H15.833V8.332"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}
