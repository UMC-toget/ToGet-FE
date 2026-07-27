export type GroupFundingStatus = 'SELECTING' | 'SETTLING' | 'ENDED'

export type ParticipantRole = 'HOST' | 'CO_HOST' | 'MEMBER'

export interface GroupParticipant {
  id: string
  name: string
  role: ParticipantRole
  isMe?: boolean
}

export interface GroupCandidate {
  id: string
  giftName: string
  giftPrice: number
  giftImageUrl: string | null
  voteCount: number
  /** 내가 투표한 후보인지 */
  isVotedByMe: boolean
}

export interface GroupFunding {
  id: string
  title: string
  recipientName: string
  anniversaryDate: string
  introduction: string
  status: GroupFundingStatus
  deadline: string
  /** D-day (양수 = 남은 일수, 0 = 오늘, 음수 = 마감) */
  dDay: number
  targetAmount: number
  collectedAmount: number | null
  participants: GroupParticipant[]
  totalParticipantCount: number
  candidates: GroupCandidate[]
  /** 나의 역할 */
  myRole: ParticipantRole
}
