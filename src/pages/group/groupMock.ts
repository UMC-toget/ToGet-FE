import type { TogetherGiftDashboard, GiftCandidateListResponse, FundingSettlementListResponse, GiftCandidateDetail } from '../../api/groupFundings'
import type { ContributionItem } from '../../api/contributions'
import type { FundingAccount } from '../../api/fundings'
import mockGraduation from '../../assets/mock-graduation.png'
import mockMushroomLamp from '../../assets/mock-mushroom-lamp.png'

export interface SettlementGiftItem {
  id: string
  name: string
  price: number
}

export interface Settlement {
  giftItems: SettlementGiftItem[]
  totalAmount: number
  participantCount: number
  myShare: number
  bankName: string
  accountNumber: string
  accountHolder: string
}

// ─── 현재 API 타입 기반 mock (UI 테스트용) ───────────────────────

export const MOCK_DASHBOARD: TogetherGiftDashboard = {
  fundingId: 1,
  // 'SELECTING' | 'SETTLING' | 'PURCHASING' | 'DELIVERING' | 'ENDED' 바꿔가며 상태별 UI 확인
  status: 'SETTLING',
  title: '예원이 졸업 선물',
  anniversaryDate: '2026-08-15',
  recipientName: '이예원',
  introduction: '예원이 7년 만에 졸업하는데\n선물이라도 주자 우리',
  thumbnailImageUrl: mockGraduation,
  members: [
    { fundingMemberId: 1, userId: 10, name: '홍길동', profileImageUrl: null, role: 'HOST' },
    { fundingMemberId: 2, userId: 20, name: '김철수', profileImageUrl: null, role: 'CO_HOST' },
    { fundingMemberId: 3, userId: 30, name: '장하영', profileImageUrl: null, role: 'MEMBER' },
    { fundingMemberId: 4, userId: 40, name: '이영희', profileImageUrl: null, role: 'MEMBER' },
    { fundingMemberId: 5, userId: 50, name: '박지수', profileImageUrl: null, role: 'MEMBER' },
  ],
  // SELECTING: collectedAmount/targetAmount null, topGifts 있음
  // SETTLING 이후 테스트: status 변경, collectedAmount → 203800, targetAmount → 392000, topGifts → null
  topGifts: [
    { fundingGiftId: 1, giftName: '오브리 도트 머쉬룸 램프 화이트', giftPrice: 65000, giftImageUrl: mockMushroomLamp, voteCount: 12 },
    { fundingGiftId: 2, giftName: '르쿠르제 에코 텀블러 체리 레드', giftPrice: 49000, giftImageUrl: null, voteCount: 8 },
  ],
  collectedAmount: 203800,
  targetAmount: 392000,
  confirmedGifts: [
    { fundingGiftId: 1, giftName: '오브리 도트 머쉬룸 램프 화이트', giftPrice: 65000, giftImageUrl: mockMushroomLamp, purchaseUrl: 'https://www.29cm.co.kr' },
    { fundingGiftId: 2, giftName: '르쿠르제 에코 텀블러 체리 레드', giftPrice: 49000, giftImageUrl: null, purchaseUrl: null },
  ],
  messageIds: null,
}

export const MOCK_CONTRIBUTIONS: ContributionItem[] = [
  { contributionId: 1, senderName: '지은', isAnonymous: false, amount: 50000, content: '예원아 졸업 진심으로 축하해! 앞으로도 좋은 일만 가득하길 바랄게', isPrivate: false, createdAt: '2026-03-14' },
  { contributionId: 2, senderName: '세라', isAnonymous: false, amount: 30000, content: '드디어 졸업이다! 고생 많았어 우리 예원이', isPrivate: false, createdAt: '2026-03-14' },
  { contributionId: 3, senderName: '지원', isAnonymous: false, amount: 40000, content: '축하해 예원아, 새 출발 응원할게!', isPrivate: false, createdAt: '2026-03-15' },
  { contributionId: 4, senderName: '상휘니', isAnonymous: false, amount: 20000, content: '졸업 축하해~ 밥 한번 먹자', isPrivate: false, createdAt: '2026-03-15' },
  { contributionId: 5, senderName: '소희', isAnonymous: false, amount: 35000, content: '예원아 졸업 너무 축하하고 늘 응원해', isPrivate: false, createdAt: '2026-03-15' },
]

export const MOCK_CANDIDATES: GiftCandidateListResponse = {
  votedGiftIds: [2],
  candidates: [
    { fundingGiftId: 1, giftName: '오브리 도트 머쉬룸 램프 화이트', giftPrice: 65000, giftImageUrl: mockMushroomLamp, voteCount: 12 },
    { fundingGiftId: 2, giftName: '르쿠르제 에코 텀블러 체리 레드', giftPrice: 49000, giftImageUrl: null, voteCount: 8 },
    { fundingGiftId: 3, giftName: '에어팟 프로 2세대', giftPrice: 329000, giftImageUrl: null, voteCount: 5 },
  ],
}

export const MOCK_SETTLEMENTS: FundingSettlementListResponse = {
  settlementParticipantCount: 3,
  totalSettlementAmount: 150000,
  settlements: [
    { fundingMemberId: 1, userId: 10, name: '홍길동', profileImageUrl: null, amountDue: 50000, settlementStatus: 'CONFIRMED' },
    { fundingMemberId: 3, userId: 30, name: '장하영', profileImageUrl: null, amountDue: 50000, settlementStatus: 'UNPAID' },
    { fundingMemberId: 4, userId: 40, name: '이영희', profileImageUrl: null, amountDue: 50000, settlementStatus: 'PAID' },
  ],
}

export const MOCK_ACCOUNT: FundingAccount = {
  bankName: 'KAKAO_BANK',
  account: '3333-22-1234567',
  accountOwner: '홍길동',
}

export const MOCK_CANDIDATE_DETAIL: GiftCandidateDetail = {
  fundingGiftId: 1,
  giftName: '오브리 도트 머쉬룸 램프 화이트',
  giftPrice: 65000,
  giftImageUrl: mockMushroomLamp,
  voteCount: 3,
  note: '집들이 선물 겸 요즘 유행 느좋램프 어때?',
  giftPurchaseUrl: 'https://example.com/mushroom-lamp',
  registrantName: '김희주',
  registrantProfileImageUrl: null,
  isVotedByMe: false,
  comments: [
    { commentId: 1, authorName: '김희주', authorProfileImageUrl: null, content: '헐 진짜 귀엽다 난 이거 좋아' },
    { commentId: 2, authorName: '이수민', authorProfileImageUrl: null, content: '내가 가장 좋아하는 색은 파란색이야!' },
    { commentId: 3, authorName: '박지민', authorProfileImageUrl: null, content: '와 나도 이런 스타일 좋아해!' },
  ],
}

export const MOCK_SETTLEMENT: Settlement = {
  giftItems: [
    { id: '1', name: '무선 이어폰', price: 120000 },
    { id: '2', name: '르쿠르제 텀블러', price: 30000 },
  ],
  totalAmount: 150000,
  participantCount: 3,
  myShare: 40000,
  bankName: '카카오뱅크',
  accountNumber: '3333-22-1234567',
  accountHolder: '홍길동',
}
