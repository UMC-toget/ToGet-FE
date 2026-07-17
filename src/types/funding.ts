/** D04 공개 범위 토글 5개 (개설자가 설정, E02 렌더링을 결정) */
export interface FundingVisibility {
  /** 진행률(%) 공개 — OFF 시 % 숨김 + 핑크 게이지 제거 (회색 트랙만 남음) */
  showProgress: boolean
  /** 모인 금액 공개 — OFF 시 금액 자리에 '비공개' 표시 (라벨은 유지) */
  showAmount: boolean
  /** 참여한 친구 수 공개 — OFF 시 'N명 참여 중' 숨김 */
  showParticipantCount: boolean
  /** 참여한 친구 이름 공개 — OFF 시 봉투 이름 라벨 자체를 제거 (익명 표시 아님) */
  showParticipantNames: boolean
  /** 축하 메시지(편지 내용) 공개 — OFF 시 봉투/섹션은 유지되고 내용만 열람 불가 (개설자는 항상 열람) */
  showMessages: boolean
}

export interface WishlistItem {
  id: string
  name: string
  price: number
  imageUrl: string
  /** 외부 구매처 링크 (새 탭으로 열기) */
  purchaseUrl: string
}

export interface FundingMessage {
  id: string
  /** 익명 메시지면 null */
  senderName: string | null
  /** 편지 내용 — 내용 공개 OFF && 참여자 시점이면 null (BE 응답 기준) */
  content: string | null
  /** 비공개 편지 — 다른 참여자에게 이름 '비공개' + 열람 불가, 개설자는 항상 봄 */
  isPrivate: boolean
  /** 익명 편지 — 개설자에게도 이름 숨김 (피그마 개설자ver 주석 근거) */
  isAnonymous: boolean
}

export interface FundingDetail {
  id: string
  /** 펀딩 제목 (예: '희주의 25번째 생일') */
  title: string
  /** 개설자 닉네임 (예: '희주') */
  hostName: string
  /** 개설자 이름 (예: '김희주') */
  hostFullName: string
  /** 카테고리 칩 라벨 (예: '생일') */
  category: string
  /** 기념일 (D-day 계산 기준) */
  anniversaryDate: string
  /** 펀딩 마감일 */
  deadline: string
  /** 개설자 인사말 */
  greeting: string
  targetAmount: number
  /** showAmount=false && !isOwner면 null (BE 응답 기준) */
  currentAmount: number | null
  /** showProgress=false && !isOwner면 null (BE 응답 기준) */
  progressPercent: number | null
  /** 게이지바 표시용 (진행률 공개 시에만 렌더링, 피그마 #1714:69054 기준) */
  gaugePercent: number
  /** showParticipantCount=false && !isOwner면 null (BE 응답 기준) */
  participantCount: number | null
  /** 뷰어가 개설자인지 */
  isOwner: boolean
  visibility: FundingVisibility
  wishlist: WishlistItem[]
  messages: FundingMessage[]
}
