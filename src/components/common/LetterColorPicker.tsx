import type { LetterColor } from './letterPalette'
import { LETTER_COLORS } from './letterPalette'

interface LetterColorPickerProps {
  /** 현재 선택된 색상 id */
  selectedId: string
  onSelect: (color: LetterColor) => void
  colors?: LetterColor[]
  className?: string
  /** '편지지 색상' 라벨 노출 여부 (기본 노출, 스와치만 필요한 화면에서 false로 숨김) */
  showLabel?: boolean
}

/**
 * 편지지 색상 선택 (피그마 '편지지 색상' — 35px 둥근 사각형 스와치 8종).
 * E(참여 축하 메세지)·H(함께 선물 편지 남기기) 공용. 편지 본문은 LetterCard와 함께 사용.
 */
export default function LetterColorPicker({
  selectedId,
  onSelect,
  colors = LETTER_COLORS,
  className = '',
  showLabel = true,
}: LetterColorPickerProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {showLabel && <p className="text-b1-m leading-normal text-black">편지지 색상</p>}
      <div className="flex items-center justify-between">
        {colors.map((color) => {
          const selected = selectedId === color.id
          const isWhite = color.id === 'white'
          return (
            <button
              key={color.id}
              type="button"
              aria-label={`${color.name} 편지지`}
              onClick={() => onSelect(color)}
              // 미선택 색상: opacity 0.6로 흐리게 / 선택: 원색 + 2px 색 테두리(피그마 기준)
              // 화이트는 흐리지 않고, 미선택 시 옅은 회색 테두리로만 구분
              className={`size-[35px] shrink-0 rounded-[4px] ${!selected && !isWhite ? 'opacity-60' : ''}`}
              style={{
                backgroundColor: color.background,
                border: selected
                  ? `2px solid ${color.swatchSelectedBorder}`
                  : isWhite
                    ? '1px solid var(--color-gray-200)'
                    : undefined,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
