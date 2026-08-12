import CheckIcon from '../icons/CheckIcon'

interface SelectCheckBadgeProps {
  selected: boolean
  /** 카드 안에서의 위치 지정용 (예: "-bottom-1 -left-1", "right-3 top-3") */
  position: string
}

/** 선택 모드에서 카드 위에 올라가는 흰색 원형 체크 배지 (피그마 기준, 위시 편집모드와 동일 디자인) */
export default function SelectCheckBadge({ selected, position }: SelectCheckBadgeProps) {
  return (
    <span
      className={`absolute ${position} flex size-6 items-center justify-center rounded-full ${
        selected ? 'bg-gray-900 text-white' : 'bg-white text-[#D9D9D9]'
      }`}
    >
      <CheckIcon className="size-5" />
    </span>
  )
}
