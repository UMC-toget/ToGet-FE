/**
 * 기념일 날짜 기반 추천 참여 금액 4개를 계산합니다. (투겟 차별화 기능)
 * 공식: 만원_단위(0~3) × 10000 + 월 × 1000 + 일 × 10
 *
 * @example
 * getRecommendedAmounts(new Date('2026-03-15')) // [3150, 13150, 23150, 33150]
 */
export function getRecommendedAmounts(anniversaryDate: Date): number[] {
  const month = anniversaryDate.getMonth() + 1
  const day = anniversaryDate.getDate()
  const base = month * 1000 + day * 10
  return [0, 1, 2, 3].map((prefix) => prefix * 10000 + base)
}
