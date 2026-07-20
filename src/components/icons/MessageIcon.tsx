/** 메시지(편지) 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function MessageIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M23.9999 6.95605H7.99992C6.52716 6.95605 5.33325 8.30576 5.33325 9.9707V22.0293C5.33325 23.6942 6.52716 25.0439 7.99992 25.0439H23.9999C25.4727 25.0439 26.6666 23.6942 26.6666 22.0293V9.9707C26.6666 8.30576 25.4727 6.95605 23.9999 6.95605Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5.33325 11.4775L14.8079 15.7714C15.1781 15.9391 15.5861 16.0264 15.9999 16.0264C16.4137 16.0264 16.8218 15.9391 17.1919 15.7714L26.6666 11.4775"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}
