/** 지갑 아이콘 (피그마 추출). 색상은 currentColor를 따릅니다. */
export default function WalletIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2.66687" y="8.00064" width="26.6667" height="21.3333" rx="5.33333" stroke="currentColor" strokeWidth="2" />
      <path
        d="M25.3335 8.6673C25.3335 5.56985 22.4906 3.25261 19.4568 3.87721L6.92472 6.45735C4.44574 6.96773 2.66687 9.15014 2.66687 11.6811L2.66687 17.334"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20.0002 18.0006C20.0002 16.5279 21.1942 15.334 22.6669 15.334H29.3336V22.0007H22.6669C21.1942 22.0007 20.0002 20.8067 20.0002 19.334V18.0006Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M23.3335 18.6673H24.9103" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
