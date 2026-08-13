import ChevronRightIcon from '../icons/ChevronRightIcon'

interface MenuRowProps {
  label: string
  onClick?: () => void
  /** 지정하면 button 대신 <a>로 렌더링합니다 (예: "mailto:..." 링크). onClick보다 우선합니다. */
  href?: string
  /** 우측 체브론 표시 여부 */
  chevron?: boolean
}

/**
 * 메뉴 리스트 행 (테두리 라운드 12px 카드)
 *
 * @example
 * <MenuRow label="고객 문의" href="mailto:hello.toget.team@gmail.com" />
 * <MenuRow label="이용약관" onClick={() => navigate('/terms')} />
 * <MenuRow label="로그아웃" chevron={false} onClick={handleLogout} />
 */
export default function MenuRow({ label, onClick, href, chevron = true }: MenuRowProps) {
  const className = 'flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3.5 py-3'
  const content = (
    <>
      <span className="text-b1-m text-black">{label}</span>
      {chevron && <ChevronRightIcon className="size-6 text-black" />}
    </>
  )

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}
