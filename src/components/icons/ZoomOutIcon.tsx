/** 축소(모서리 두 조각) 아이콘. 색상은 currentColor를 따릅니다. */
export default function ZoomOutIcon({
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
      viewBox="7.5 7.5 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.333 19.832H8.167V15.665M15.667 8.165H19.833V12.332"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}
