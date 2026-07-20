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
