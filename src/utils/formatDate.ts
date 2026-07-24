/**
 * Date를 YYYY.MM.DD 형식 문자열로 변환합니다.
 *
 * @example
 * formatDateDots(new Date('2026-07-13')) // '2026.07.13'
 */
export function formatDateDots(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

/**
 * Date를 YYYY년 MM월 DD일 형식 문자열로 변환합니다.
 *
 * @example
 * formatDateKorean(new Date('2026-03-15')) // '2026년 03월 15일'
 */
export function formatDateKorean(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}년 ${month}월 ${day}일`
}

/**
 * 날짜 문자열을 오늘 기준 D-day 라벨로 변환합니다. 유효하지 않은 날짜면 빈 문자열.
 *
 * @example
 * getDdayLabel('2026-08-01') // 오늘이 2026-07-25면 'D-7'
 */
export function getDdayLabel(dateString: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (Number.isNaN(diff)) return ''
  if (diff === 0) return 'D-day'
  return diff > 0 ? `D-${diff}` : `D+${-diff}`
}
