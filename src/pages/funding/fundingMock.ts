import type { FundingDetail } from '../../types/funding'
import productAirpods from '../../assets/mock/product-airpods.png'
import productAirpodsCase from '../../assets/mock/product-airpods-case.png'

// TODO: BE 연동 후 실제 API 응답으로 교체.
// ?owner=1 / ?hide=progress,amount,count,names,messages / ?over=1 쿼리는 mock 확인용 (연동 시 제거)

const LONG_LETTER = `희주야, 오늘 세상에서 가장 특별한 너의 생일을 진심으로 축하해! 🎂 바쁜 일상 속에서도 오늘만큼은 희주가 세상에서 가장 행복하고, 사랑만 듬뿍 받는 하루를 보냈으면 좋겠다. 네가 짓는 미소만큼 너의 앞날에도 늘 반짝이는 행복만 가득하길 진심으로 응원해.
태어나줘서 고맙고, 내 곁에 있어 줘서 더 고마워. 오늘 맛있는 거 엄청 많이 먹고, 최고로 행복한 하루 보내자!
생일 축하해, 희주야! ❤️`

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

/** hide에 들어갈 수 있는 키: progress | amount | count | names | messages. isOverAchieved면 초과 달성(120%) 상태 */
export function getMockFunding(isOwner: boolean, hidden: Set<string>, isOverAchieved = false): FundingDetail {
  const mockAmount = isOverAchieved ? 470400 : 203800
  const mockPercent = isOverAchieved ? 120 : 52
  const visibility = {
    showProgress: !hidden.has('progress'),
    showAmount: !hidden.has('amount'),
    showParticipantCount: !hidden.has('count'),
    showParticipantNames: !hidden.has('names'),
    showMessages: !hidden.has('messages'),
  }

  const messages = [
    { id: 'm1', senderName: '지은', content: '희주야 생일 진심으로 축하해! 올해도 행복하자 🎉', isPrivate: false, isAnonymous: false },
    { id: 'm2', senderName: '서진', content: '생일 축하해!! 원하는 선물 꼭 받길 바랄게 🎁', isPrivate: false, isAnonymous: false },
    { id: 'm3', senderName: '밍밍', content: '해피버스데이 희주 💖 맛있는 거 많이 먹어!', isPrivate: false, isAnonymous: false },
    { id: 'm4', senderName: '뇽이', content: '희주야 생일 축하해. 우리만 아는 그 얘기.. 올해는 꼭 이루자!', isPrivate: true, isAnonymous: false },
    { id: 'm5', senderName: null, content: '늘 응원하고 있어요. 생일 축하합니다!', isPrivate: false, isAnonymous: true },
    { id: 'm6', senderName: '아진', content: '생일 축하해 희주야! 조만간 밥 한번 먹자~', isPrivate: true, isAnonymous: false },
    { id: 'm7', senderName: '세라', content: '축하해!! 너는 최고의 친구야 💕', isPrivate: true, isAnonymous: false },
    { id: 'm8', senderName: '민경', content: LONG_LETTER, isPrivate: false, isAnonymous: false },
    { id: 'm9', senderName: '멜롱', content: '생일 축하드려요~ 좋은 하루 보내세요!', isPrivate: false, isAnonymous: false },
    { id: 'm10', senderName: '김지훈', content: '희주야 축하한다! 다음에 커피 한잔 하자', isPrivate: false, isAnonymous: false },
    { id: 'm11', senderName: '지아', content: '언니 생일 축하해요!! 🥳', isPrivate: false, isAnonymous: false },
    { id: 'm12', senderName: '아영', content: '생일 축하해 희주야, 늘 고마워!', isPrivate: false, isAnonymous: false },
    { id: 'm13', senderName: '예지', content: '해피버스데이! 올 한 해도 파이팅 💪', isPrivate: false, isAnonymous: false },
    { id: 'm14', senderName: '준서', content: '축하해요! 좋은 일만 가득하길!', isPrivate: false, isAnonymous: false },
    { id: 'm15', senderName: null, content: '항상 밝은 모습이 보기 좋아요. 축하해요!', isPrivate: false, isAnonymous: true },
  ]

  return {
    id: 'mock',
    title: '희주의 25번째 생일',
    hostName: '희주',
    hostFullName: '김희주',
    category: '생일',
    anniversaryDate: addDays(7),
    deadline: addDays(12),
    greeting:
      '안녕하세요, 희주입니다 :)\n올해 생일에 받고 싶은 선물이 있어\n이렇게 페이지를 열어봤어요.\n축하 메세지만 남겨주셔도 정말 큰 마음이 될 것 같아요.',
    targetAmount: 392000,
    // BE 계약: 비공개 항목은 개설자가 아니면 null로 내려옴
    currentAmount: visibility.showAmount || isOwner ? mockAmount : null,
    progressPercent: visibility.showProgress || isOwner ? mockPercent : null,
    gaugePercent: mockPercent,
    participantCount: visibility.showParticipantCount || isOwner ? 7 : null,
    isOwner,
    visibility,
    wishlist: [
      {
        id: 'w1',
        name: 'Apple AirPods Pro 3',
        price: 369000,
        imageUrl: productAirpods,
        purchaseUrl: 'https://www.apple.com/kr/airpods-pro/',
      },
      {
        id: 'w2',
        name: '에어팟 케이스',
        price: 23000,
        imageUrl: productAirpodsCase,
        purchaseUrl: 'https://www.29cm.co.kr/',
      },
    ],
    // BE 계약: 봉투(발신자 목록)는 항상 내려오고, 내용 공개 OFF && 참여자면 content만 null
    messages: messages.map((message) => ({
      ...message,
      content: visibility.showMessages || isOwner ? message.content : null,
    })),
  }
}
