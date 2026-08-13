import { useEffect, useState } from 'react'

/** 값이 delayMs 동안 안 바뀌어야 갱신되는 지연 값 (검색어·계좌번호 등 타이핑 중 API 호출 억제용) */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
