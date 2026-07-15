import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/**
 * 하단 CTA 버튼 (피그마 CTA 컴포넌트 기준: 높이 52px, 라운드 12px)
 * 비활성 상태는 disabled prop으로 처리합니다.
 *
 * @example
 * <Button disabled={nickname.length === 0} onClick={handleSubmit}>가입</Button>
 */
export default function Button({ type = 'button', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white transition-colors disabled:bg-gray-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
