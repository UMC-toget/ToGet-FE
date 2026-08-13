import type { LetterColor } from '../../components/common/letterPalette'
import LetterCard from '../../components/common/LetterCard'
import LetterColorPicker from '../../components/common/LetterColorPicker'
import CheckOption from '../../components/common/CheckOption'

const LETTER_MAX_LENGTH = 234

interface LetterStepProps {
  hostName: string
  letter: string
  /** 선택된 편지지 색 (색 목록 로딩 전이면 undefined) */
  letterColor?: LetterColor
  colors: LetterColor[]
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
  colors,
  isPrivate,
  onLetterChange,
  onColorChange,
  onPrivateChange,
}: LetterStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-h3-sb leading-normal text-black">2. 축하 메세지</h2>

      <div className="flex flex-col gap-4">
        <LetterColorPicker selectedId={letterColor?.id ?? ''} onSelect={onColorChange} colors={colors} />

        {letterColor && (
          <LetterCard
            color={letterColor}
            state="preInput"
            title={`${hostName}에게`}
            content={letter}
            onContentChange={onLetterChange}
            maxLength={LETTER_MAX_LENGTH}
          />
        )}

        <CheckOption label="메세지 내용 비공개 설정" checked={isPrivate} onChange={onPrivateChange} />
      </div>
    </div>
  )
}
