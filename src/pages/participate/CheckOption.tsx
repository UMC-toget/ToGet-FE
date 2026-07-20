import CheckIcon from '../../components/icons/CheckIcon'

interface CheckOptionProps {
  /** 체크박스 옆 라벨 (예: '익명 설정') */
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** E03 옵션 체크박스 (익명 설정, 비공개 설정) */
export default function CheckOption({ label, checked, onChange }: CheckOptionProps) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2">
      <span
        className={`flex size-4 items-center justify-center rounded border ${
          checked ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-700 bg-white text-transparent'
        }`}
      >
        <CheckIcon className="size-3" />
      </span>
      <span className="text-caption1-m leading-normal text-gray-700">{label}</span>
    </button>
  )
}
