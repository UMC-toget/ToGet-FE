import TrashIcon from '../icons/TrashIcon'

interface SelectModeBarProps {
  /** 선택된 개수 */
  count: number
  /** "N개의 {label}이/가 선택됨"에 들어갈 대상 이름 (예: '색상', '캐릭터', '선물') */
  label: string
  onDelete: () => void
}

/** 받침 유무에 따라 '이'/'가' 주격 조사를 고른다 (한글이 아니면 '가') */
function subjectParticle(label: string) {
  const code = label.charCodeAt(label.length - 1) - 0xac00
  if (code < 0 || code > 11171) return '가'
  return code % 28 === 0 ? '가' : '이'
}

/**
 * 편집/선택 모드에서 화면 하단에 뜨는 삭제 바 (피그마 기준, 위시 편집모드와 동일 디자인).
 * 왼쪽은 오른쪽 휴지통 아이콘과 대칭을 맞추기 위한 빈 자리이고, 텍스트는 가운데 정렬됩니다.
 */
export default function SelectModeBar({ count, label, onDelete }: SelectModeBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-30 flex h-14 w-full max-w-[402px] -translate-x-1/2 items-center justify-between border-t border-gray-200 bg-gray-100/80 px-[18px] backdrop-blur-[30px]">
      <span className="size-6" aria-hidden />
      <p className="text-b1-m text-black -translate-y-1">{count}개의 {label}{subjectParticle(label)} 선택됨</p>
      <button
        type="button"
        onClick={onDelete}
        disabled={count === 0}
        className="text-black disabled:text-gray-300"
        aria-label={`선택한 ${label} 삭제`}
      >
        <TrashIcon className="size-6" />
      </button>
    </div>
  )
}
