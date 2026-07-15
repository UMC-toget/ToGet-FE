/** Profile 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function ProfileIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g id="profile">
      <path id="Vector" d="M12.1596 10.87C12.0596 10.86 11.9396 10.86 11.8296 10.87C9.44957 10.79 7.55957 8.84 7.55957 6.44C7.55957 3.99 9.53957 2 11.9996 2C14.4496 2 16.4396 3.99 16.4396 6.44C16.4296 8.84 14.5396 10.79 12.1596 10.87Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.018 14.262L19.821 18.904C20.285 19.282 20.649 19.877 20.847 20.51C21.094 21.302 20.369 21.934 19.54 21.934L4.446 21.942C3.625 21.942 2.902 21.324 3.138 20.538C3.332 19.893 3.704 19.288 4.185 18.904L9.988 14.253C11.113 13.349 12.885 13.358 14.018 14.262Z" stroke="currentColor" strokeWidth="1.5"/>
      </g>
    </svg>
  )
}
