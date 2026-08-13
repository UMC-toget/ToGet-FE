import { apiClient, unwrap } from '../lib/apiClient'

export const BANK_NAMES = [
  'KB',
  'SHINHAN',
  'WOORI',
  'HANA',
  'NH',
  'IBK',
  'SC',
  'CITI',
  'KAKAO_BANK',
  'TOSS_BANK',
  'K_BANK',
  'POST_OFFICE',
  'MG_SAEMAEUL',
  'SHINHYUP',
  'SUHYUP',
  'BUSAN',
  'IM_BANK',
  'GWANGJU',
  'JEONBUK',
  'GYEONGNAM',
  'JEJU',
  'KDB',
] as const

export type BankName = (typeof BANK_NAMES)[number]

/** 서버 은행 코드 -> 화면에 표시할 한글 은행명 */
export const BANK_NAME_LABELS: Record<BankName, string> = {
  KB: 'KB국민은행',
  SHINHAN: '신한은행',
  WOORI: '우리은행',
  HANA: '하나은행',
  NH: 'NH농협은행',
  IBK: 'IBK기업은행',
  SC: 'SC제일은행',
  CITI: '씨티은행',
  KAKAO_BANK: '카카오뱅크',
  TOSS_BANK: '토스뱅크',
  K_BANK: '케이뱅크',
  POST_OFFICE: '우체국',
  MG_SAEMAEUL: '새마을금고',
  SHINHYUP: '신협',
  SUHYUP: '수협',
  BUSAN: '부산은행',
  IM_BANK: 'iM뱅크(대구)',
  GWANGJU: '광주은행',
  JEONBUK: '전북은행',
  GYEONGNAM: '경남은행',
  JEJU: '제주은행',
  KDB: 'KDB산업은행',
}

export interface BankResponse {
  bankId: number
  code: BankName
  displayName: string
  /** 아이콘 미확보 은행은 null (프론트에서 fallback 아이콘 처리 필요) */
  iconUrl: string | null
}

export interface UserAccount {
  userAccountId: number
  bankName: BankName
  accountOwner: string
  /** 하이픈 제외 숫자만 */
  account: string
}

export interface UserAccountInput {
  bankName: BankName
  accountOwner: string
  account: string
}

export function getUserAccounts() {
  return unwrap<UserAccount[]>(apiClient.get('/api/v1/user-accounts'))
}

/** 계좌 등록·수정 화면의 은행 선택지 목록 (아이콘 URL 포함, sortOrder 오름차순) */
export function getBanks() {
  return unwrap<BankResponse[]>(apiClient.get('/api/v1/banks'))
}

export function createUserAccount(payload: UserAccountInput) {
  return unwrap<{ userAccountId: number }>(apiClient.post('/api/v1/user-accounts', payload))
}

export function updateUserAccount(userAccountId: number, payload: Partial<UserAccountInput>) {
  return unwrap<UserAccount>(apiClient.patch(`/api/v1/user-accounts/${userAccountId}`, payload))
}

export function deleteUserAccount(userAccountId: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/user-accounts/${userAccountId}`))
}

export interface BankDetectionResult {
  bankName: BankName
  displayName: string
  iconUrl: string | null
}

/** 계좌번호(하이픈 제외 숫자만) 자릿수·패턴으로 추론 가능한 은행 목록. 추론 불가하면 빈 배열. */
export function detectBanks(accountNumber: string) {
  return unwrap<BankDetectionResult[]>(apiClient.post('/api/v1/banks/detections', { accountNumber }))
}
