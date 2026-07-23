import { useId, useRef } from 'react'
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { replayShake } from '../../utils/shake'

// '닉네임' 라벨의 '닉' 글자 잉크 너비(실측 11px)의 1/3(4px)에서 시작해, 흔들림이 과하다는 피드백에 따라 두 차례 더 낮췄습니다 (4px → 2.7px → 1.8px).
const INPUT_SHAKE_AMPLITUDE = '1.8px'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 입력창 위에 표시되는 라벨 (필수 표시 등 강조가 필요하면 ReactNode도 가능) */
  label?: ReactNode
  value: string
  /** 지정하면 우측에 (현재/최대) 글자수 카운터가 표시됩니다 */
  maxLength?: number
  /** 글자수 제한을 초과해 입력을 시도했을 때 호출됩니다 (예: 화면 전체 흔들림 트리거용) */
  onOverflow?: () => void
}

/**
 * 라벨 + 글자수 카운터를 지원하는 입력창 (피그마 텍스트 필드 기준: 높이 48px, 라운드 8px)
 * maxLength 초과 입력을 시도하면 입력창이 좌우로 흔들립니다.
 *
 * @example
 * <TextField label="닉네임" value={nickname} maxLength={6} onChange={(e) => setNickname(e.target.value)} />
 */
export default function TextField({
  label,
  value,
  maxLength,
  onChange,
  onOverflow,
  onKeyDown,
  className = '',
  ...props
}: TextFieldProps) {
  const inputId = useId()
  const boxRef = useRef<HTMLDivElement>(null)

  const triggerOverflow = () => {
    replayShake(boxRef.current)
    onOverflow?.()
  }

  // 물리 키보드로 제한 글자수에 도달한 상태에서 문자 입력을 시도하는, 가장 흔한 초과 시도 경로입니다.
  // (브라우저 기본 maxLength가 입력 자체는 막아주므로 change 이벤트가 따로 발생하지 않습니다)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      maxLength !== undefined &&
      value.length >= maxLength &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      triggerOverflow()
    }
    onKeyDown?.(e)
  }

  // 한글 조합(IME) 중이나 붙여넣기 시에는 브라우저가 maxLength를 강제하지 않아 초과 입력될 수 있어 직접 잘라냅니다
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength !== undefined && e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength)
      triggerOverflow()
    }
    onChange?.(e)
  }

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-b1-m text-black">
          {label}
        </label>
      )}
      <div
        ref={boxRef}
        className="flex h-12 w-full items-center gap-2 rounded-lg border border-transparent bg-background px-4 focus-within:border-gray-700"
        style={{ '--shake-amp': INPUT_SHAKE_AMPLITUDE } as React.CSSProperties}
      >
        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-b1-m text-black outline-none placeholder:text-gray-400"
          {...props}
        />
        {maxLength !== undefined && (
          <span className="shrink-0 text-b2-r text-gray-400">
            ({value.length}/{maxLength})
          </span>
        )}
      </div>
    </div>
  )
}
