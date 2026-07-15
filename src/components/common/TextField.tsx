import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 입력창 위에 표시되는 라벨 */
  label?: string
  value: string
  /** 지정하면 우측에 (현재/최대) 글자수 카운터가 표시됩니다 */
  maxLength?: number
}

/**
 * 라벨 + 글자수 카운터를 지원하는 입력창 (피그마 텍스트 필드 기준: 높이 48px, 라운드 8px)
 *
 * @example
 * <TextField label="닉네임" value={nickname} maxLength={6} onChange={(e) => setNickname(e.target.value)} />
 */
export default function TextField({ label, value, maxLength, onChange, className = '', ...props }: TextFieldProps) {
  const inputId = useId()

  // 한글 조합(IME) 중에는 브라우저가 maxLength를 강제하지 않아 초과 입력될 수 있어 직접 잘라냅니다
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength !== undefined && e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength)
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
      <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-transparent bg-background px-4 focus-within:border-gray-200 focus-within:bg-white">
        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
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
