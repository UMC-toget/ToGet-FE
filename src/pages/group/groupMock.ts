import type { GroupFunding } from '../../types/group'

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

export const MOCK_GROUP: GroupFunding = {
  id: '1',
  title: '예원이 졸업 선물',
  recipientName: '이예원',
  anniversaryDate: '2026-03-16',
  introduction: '예원이 7년 만에 졸업하는데\n선물이라도 주자 우리',
  status: 'SELECTING',
  deadline: '2026-08-10',
  dDay: 7,
  targetAmount: 100000,
  collectedAmount: null,
  totalParticipantCount: 35,
  myRole: 'MEMBER',
  participants: [
    { id: '1', name: '홍길동', role: 'HOST' },
    { id: '2', name: '김철수', role: 'CO_HOST' },
    { id: '3', name: '장하영', role: 'MEMBER', isMe: true },
    { id: '4', name: '이영희', role: 'MEMBER' },
    { id: '5', name: '박지수', role: 'MEMBER' },
  ],
  candidates: [
    {
      id: '1',
      giftName: '오브리 도트 머쉬룸 램프 화이트',
      giftPrice: 65000,
      giftImageUrl: null,
      voteCount: 12,
      isVotedByMe: false,
    },
    {
      id: '2',
      giftName: '르쿠르제 에코 텀블러 체리 레드',
      giftPrice: 49000,
      giftImageUrl: null,
      voteCount: 8,
      isVotedByMe: true,
    },
    {
      id: '3',
      giftName: '에어팟 프로 2세대',
      giftPrice: 329000,
      giftImageUrl: null,
      voteCount: 5,
      isVotedByMe: false,
    },
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
