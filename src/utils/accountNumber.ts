import type { BankName } from '../api/userAccounts'

interface AccountNumberFormat {
  /** 입력 중이거나 알려진 자릿수 형식이 없을 때 사용하는 현행 대표 형식 */
  default: readonly number[]
  /** 구계좌처럼 총 자릿수가 다른 형식 */
  byLength?: Readonly<Record<number, readonly number[]>>
}

/**
 * 은행별 대표 계좌번호 구분 형식입니다.
 * 서버에는 하이픈 없는 숫자만 저장하고 화면에서만 이 형식을 적용합니다.
 */
const ACCOUNT_NUMBER_FORMATS: Record<BankName, AccountNumberFormat> = {
  KB: { default: [6, 2, 6] },
  SHINHAN: { default: [3, 3, 6] },
  WOORI: { default: [4, 3, 6] },
  HANA: { default: [3, 6, 5] },
  NH: { default: [3, 4, 4, 2] },
  IBK: { default: [3, 6, 2, 3] },
  SC: { default: [3, 2, 6] },
  CITI: { default: [3, 6, 3] },
  KAKAO_BANK: { default: [4, 2, 7] },
  TOSS_BANK: { default: [4, 4, 4] },
  K_BANK: { default: [3, 3, 6] },
  POST_OFFICE: { default: [6, 2, 6] },
  MG_SAEMAEUL: {
    default: [4, 2, 6, 1],
    byLength: { 12: [3, 2, 6, 1] },
  },
  SHINHYUP: { default: [3, 3, 6] },
  SUHYUP: { default: [4, 4, 4] },
  BUSAN: {
    default: [3, 4, 4, 2],
    byLength: { 12: [3, 2, 6, 1] },
  },
  IM_BANK: {
    default: [3, 2, 6, 1],
    byLength: { 11: [3, 2, 6], 13: [3, 2, 6, 2] },
  },
  GWANGJU: { default: [3, 3, 6] },
  JEONBUK: { default: [3, 2, 7] },
  GYEONGNAM: { default: [3, 3, 6] },
  JEJU: {
    default: [3, 3, 5, 1],
    byLength: { 10: [2, 2, 5, 1] },
  },
  KDB: { default: [3, 8, 3] },
}

export function normalizeAccountNumber(account: string): string {
  return account.replace(/\D/g, '')
}

/** 선택한 은행의 대표 형식에 맞춰 입력 중에도 하이픈을 표시합니다. */
export function formatAccountNumber(account: string, bankCode?: BankName | ''): string {
  const digits = normalizeAccountNumber(account)
  if (!digits || !bankCode) return digits

  const format = ACCOUNT_NUMBER_FORMATS[bankCode]
  let groups = format.byLength?.[digits.length] ?? format.default

  // 새마을금고의 13자리 계좌 중 9로 시작하는 현행 형식은 4-4-4-1로 구분합니다.
  if (bankCode === 'MG_SAEMAEUL' && digits.length === 13 && digits.startsWith('9')) {
    groups = [4, 4, 4, 1]
  }

  const parts: string[] = []
  let cursor = 0

  for (const groupLength of groups) {
    if (cursor >= digits.length) break
    parts.push(digits.slice(cursor, cursor + groupLength))
    cursor += groupLength
  }

  if (cursor < digits.length) parts.push(digits.slice(cursor))
  return parts.join('-')
}
