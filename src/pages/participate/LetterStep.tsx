import type { LetterColor } from './letterColors'
import { LETTER_COLORS } from './letterColors'
import CheckOption from './CheckOption'

interface LetterStepProps {
  hostName: string
  letter: string
  letterColor: LetterColor
  isPrivate: boolean
  onLetterChange: (letter: string) => void
  onColorChange: (color: LetterColor) => void
  onPrivateChange: (isPrivate: boolean) => void
}

/** E03 2단계: 축하 메세지 작성 (피그마 #1714:68510) */
export default function LetterStep({
  hostName,
  letter,
  letterColor,
  isPrivate,
  onLetterChange,
  onColorChange,
  onPrivateChange,
}: LetterStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-h3-sb leading-normal text-black">2. 축하 메세지</h2>

      <div className="flex flex-col gap-4">
        <p className="text-b1-m leading-normal text-black">편지지 색상</p>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {LETTER_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              aria-label={`${color.name} 편지지`}
              onClick={() => onColorChange(color)}
              className={`size-[35px] shrink-0 rounded-[4px] ${letterColor.id === color.id ? '' : 'opacity-60'}`}
              style={{
                backgroundColor: color.bg,
                ...(color.id === 'white' && { border: '2px solid var(--color-gray-500)' }),
              }}
            />
          ))}
        </div>

        <div
          className="rounded-xl border px-4 py-3"
          style={{ backgroundColor: letterColor.bg, borderColor: letterColor.border }}
        >
          <p className="flex h-6 items-center text-b1-m text-black">{hostName}에게</p>
          <textarea
            value={letter}
            onChange={(e) => onLetterChange(e.target.value)}
            placeholder="내용을 입력해주세요"
            rows={10}
            className="mt-[13px] w-full resize-none bg-transparent text-b2-r leading-[28px] text-gray-800 outline-none placeholder:text-[var(--ph-color)]"
            style={
              {
                '--ph-color': letterColor.placeholder,
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 27px, ${letterColor.border} 27px, ${letterColor.border} 28px)`,
              } as React.CSSProperties
            }
          />
        </div>

        <CheckOption label="메세지 내용 비공개 설정" checked={isPrivate} onChange={onPrivateChange} />
      </div>
    </div>
  )
}
