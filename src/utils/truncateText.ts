/**
 * 텍스트가 maxLength를 넘으면 말줄임표(...)까지 포함해 maxLength 글자로 자릅니다.
 * 예: truncateText('123456789012345', 12) -> '123456789...'  (9자 + '...' = 12자)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}
