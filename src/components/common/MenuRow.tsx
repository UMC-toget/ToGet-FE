import ChevronRightIcon from '../icons/ChevronRightIcon'

interface MenuRowProps {
  label: string
  onClick?: () => void
  /** 우측 체브론 표시 여부 */
  chevron?: boolean
}

/**
 * 메뉴 리스트 행 (테두리 라운드 12px 카드)
 *
 * @example
 * <MenuRow label="알림 설정" onClick={() => navigate('/settings/notification')} />
 * <MenuRow label="로그아웃" chevron={false} onClick={handleLogout} />
 */
export default function MenuRow({ label, onClick, chevron = true }: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3.5 py-3"
    >
      <span className="text-b1-m text-black">{label}</span>
      {chevron && <ChevronRightIcon className="size-6 text-black" />}
    </button>
  )
}
