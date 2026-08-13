import type { CSSProperties, KeyboardEvent } from 'react'
import CaretDownIcon from '../icons/CaretDownIcon'
import type { LetterColor } from './letterPalette'

/**
 * 편지지 상태 (피그마 "편지지" 공통 컴포넌트 3상태)
 * - preInput: 입력전 — 헤더 + 편집 가능한 textarea (E02 축하 메세지 작성)
 * - folded: 접힘 — 헤더만 노출, 탭하면 펼쳐짐 (E04 마음 전하기 축하 메세지 카드)
 * - open: 열림 — 헤더 + 본문 전체 노출. onToggle이 있으면 접힘과 토글되는 카드로, 없으면 정적 미리보기로 렌더링됨
 */
export type LetterCardState = 'preInput' | 'folded' | 'open'

interface LetterCardProps {
  color: LetterColor
  state: LetterCardState
  title: string
  /** title이 빈 값일 때 보여줄 placeholder (정적 미리보기 전용) */
  titlePlaceholder?: string
  content: string
  contentPlaceholder?: string
  /** preInput 상태에서 textarea 입력을 받기 위한 핸들러 */
  onContentChange?: (value: string) => void
  /** preInput 상태 최대 글자수. 초과 시 슬라이스 + 물리 키보드 차단 */
  maxLength?: number
  /** true면 열림 상태에서 우측 하단에 from. 표기 (마음 전하기는 미노출) */
  showFrom?: boolean
  fromLabel?: string
  /** 있으면 folded/open을 헤더 탭으로 토글하는 카드로 렌더링 (없으면 정적 미리보기) */
  onToggle?: () => void
  className?: string
}

/** 28px 간격 편지지 밑줄 (repeating-gradient로 무한 반복 — 마지막 선 잘림 없음) */
const ruledLineStyle = (lineColor: string): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 27px, ${lineColor} 27px, ${lineColor} 28px)`,
})

export default function LetterCard({
  color,
  state,
  title,
  titlePlaceholder,
  content,
  contentPlaceholder = '내용을 입력해주세요',
  onContentChange,
  maxLength,
  showFrom = false,
  fromLabel = 'from.',
  onToggle,
  className = '',
}: LetterCardProps) {
  const cardStyle: CSSProperties = { backgroundColor: color.background, borderColor: color.border }
  const lineStyle = ruledLineStyle(color.lineColor)

  if (state === 'preInput') {
    const rows = 11
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = maxLength && e.target.value.length > maxLength
        ? e.target.value.slice(0, maxLength)
        : e.target.value
      onContentChange?.(val)
    }
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (maxLength && content.length >= maxLength && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
      }
    }
    return (
      <div className={`rounded-xl border px-4 py-3 ${className}`} style={cardStyle}>
        {title && <p className="flex h-6 items-center text-b1-m text-black">{title}</p>}
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={contentPlaceholder}
          maxLength={maxLength}
          rows={rows}
          className={`w-full resize-none bg-transparent p-0 text-b2-r leading-[28px] text-gray-800 outline-none placeholder:text-[var(--ph-color)] ${title ? 'mt-[13px]' : ''}`}
          style={{
            height: `${rows * 28}px`,
            '--ph-color': color.placeholder,
            ...lineStyle,
          } as CSSProperties}
        />
      </div>
    )
  }

  if (onToggle) {
    const open = state === 'open'
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`flex flex-col rounded-xl border px-4 py-3 text-left ${className}`}
        style={cardStyle}
      >
        <span className="flex w-full items-center justify-between">
          <span className="text-b1-m text-black">
            {title}
            {!open && '···'}
          </span>
          <CaretDownIcon className={`size-6 text-gray-700 ${open ? 'rotate-180' : ''}`} />
        </span>
        {open && (
          <span
            className="mt-2 block w-full whitespace-pre-line pb-[28px] text-left text-b2-r leading-[28px] text-gray-800"
            style={lineStyle}
          >
            {content}
          </span>
        )}
        {open && showFrom && <span className="block w-full text-right text-b2-r text-gray-800">{fromLabel}</span>}
      </button>
    )
  }

  return (
    <div className={`flex flex-col rounded-xl border px-4 py-3 ${className}`} style={cardStyle}>
      <p className={`flex h-6 items-center text-b1-m ${title ? 'text-black' : 'text-gray-400'}`}>
        {title || titlePlaceholder}
      </p>
      <p
        className={`mt-2 whitespace-pre-line break-words pb-[28px] text-b2-r leading-[28px] [overflow-wrap:anywhere] ${
          content ? 'text-gray-800' : 'text-gray-400'
        }`}
        style={lineStyle}
      >
        {content || contentPlaceholder}
      </p>
      {showFrom && <p className="text-right text-b2-r text-gray-800">{fromLabel}</p>}
    </div>
  )
}
