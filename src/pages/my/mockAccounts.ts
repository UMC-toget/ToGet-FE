import bankShinhan from '../../assets/bank-shinhan.png'
import bankKakao from '../../assets/bank-kakao.png'

export interface Account {
  id: number
  bankName: string
  bankLogo: string
  accountHolder: string
  accountNumber: string
}

/** TODO: 계좌 API 연동 후 제거 (피그마 디자인 기준 목업 데이터) */
export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 1,
    bankName: '신한은행',
    bankLogo: bankShinhan,
    accountHolder: '김희주',
    accountNumber: '110-585-123456',
  },
  {
    id: 2,
    bankName: '카카오뱅크',
    bankLogo: bankKakao,
    accountHolder: '김희주',
    accountNumber: '110-585-123456',
  },
]
