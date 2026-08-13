/**
 * 구매처 URL 입력에는 공백을 제외한 ASCII 문자만 허용합니다.
 * 영문, 숫자와 URL 구성 기호는 유지하고 한글·다국어 문자·이모지는 제거합니다.
 */
export function sanitizePurchaseUrl(value: string): string {
  return value.replace(/[^\x21-\x7E]/g, '')
}
