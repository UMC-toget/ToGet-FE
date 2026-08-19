import {
  createDetector,
  kb,
  hana,
  suhyup,
  suhyupCoop,
  nh,
  woori,
  sc,
  citi,
  imBank,
  busan,
  gwangju,
  jeju,
  jeonbuk,
  gyeongnam,
  shinhan,
  kbank,
  kakao,
  toss,
  kdb,
  ibk,
  kfcc,
  shinhyup,
  post,
  type InstitutionId,
} from 'korean-account'
import type { BankName, BankResponse, BankDetectionResult } from '../api/userAccounts'

/**
 * [임시 로컬 실험] korean-account 탐지기를 우리 서비스가 지원하는 은행으로만 스코프.
 * 백엔드 POST /api/v1/banks/detections 를 대체할 수 있는지 로컬에서만 시험해보는 용도.
 */
const detector = createDetector([
  kb,
  hana,
  suhyup,
  suhyupCoop,
  nh,
  woori,
  sc,
  citi,
  imBank,
  busan,
  gwangju,
  jeju,
  jeonbuk,
  gyeongnam,
  shinhan,
  kbank,
  kakao,
  toss,
  kdb,
  ibk,
  kfcc,
  shinhyup,
  post,
])

/** korean-account institution id -> 우리 서버 BankName 코드 매핑. 수협은행/수협조합은 둘 다 SUHYUP으로 합칩니다. */
const INSTITUTION_ID_TO_BANK_NAME: Partial<Record<InstitutionId, BankName>> = {
  kb: 'KB',
  shinhan: 'SHINHAN',
  woori: 'WOORI',
  hana: 'HANA',
  nh: 'NH',
  ibk: 'IBK',
  sc: 'SC',
  citi: 'CITI',
  kakao: 'KAKAO_BANK',
  toss: 'TOSS_BANK',
  kbank: 'K_BANK',
  post: 'POST_OFFICE',
  kfcc: 'MG_SAEMAEUL',
  shinhyup: 'SHINHYUP',
  suhyup: 'SUHYUP',
  'suhyup-coop': 'SUHYUP',
  busan: 'BUSAN',
  'im-bank': 'IM_BANK',
  gwangju: 'GWANGJU',
  jeonbuk: 'JEONBUK',
  gyeongnam: 'GYEONGNAM',
  jeju: 'JEJU',
  kdb: 'KDB',
}

/**
 * 계좌번호로 은행을 클라이언트에서 탐지합니다 (신뢰도 순, 중복 은행 제거).
 * 표시용 은행명/아이콘은 항상 우리 백엔드가 내려준 목록(`availableBanks`)에서만 가져옵니다.
 */
export function detectBanksLocally(
  accountNumber: string,
  availableBanks: readonly BankResponse[],
): BankDetectionResult[] {
  const results = detector.detect(accountNumber)
  const seen = new Set<BankName>()
  const detected: BankDetectionResult[] = []

  for (const result of results) {
    const bankName = INSTITUTION_ID_TO_BANK_NAME[result.institution.id]
    if (!bankName || seen.has(bankName)) continue

    const bank = availableBanks.find((b) => b.code === bankName)
    if (!bank) continue

    seen.add(bankName)
    detected.push({ bankName: bank.code, displayName: bank.displayName, iconUrl: bank.iconUrl })
  }

  return detected
}
