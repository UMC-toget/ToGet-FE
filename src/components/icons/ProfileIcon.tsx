/** Profile 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function ProfileIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g id="profile">
      <path id="Vector" d="M12.1596 10.87C12.0596 10.86 11.9396 10.86 11.8296 10.87C9.44957 10.79 7.55957 8.84 7.55957 6.44C7.55957 3.99 9.53957 2 11.9996 2C14.4496 2 16.4396 3.99 16.4396 6.44C16.4296 8.84 14.5396 10.79 12.1596 10.87Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.5901 21.9399C20.5901 18.0699 16.7401 14.9399 12.0001 14.9399C7.26008 14.9399 3.41008 18.0699 3.41008 21.9399" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  )
}
