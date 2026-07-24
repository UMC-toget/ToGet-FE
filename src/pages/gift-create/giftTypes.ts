export type GiftPageType = 'my' | 'together'

export interface GiftCreateCardInfo {
  type: GiftPageType
  title: string
  description: string
  tags: string[]
}

export const GIFT_CREATE_CARDS: GiftCreateCardInfo[] = [
  {
    type: 'my',
    title: '내 선물 페이지 만들기',
    description: '내가 받고 싶은 선물을 담아,\n친구들에게 공유할 수 있어요.',
    tags: ['초대장 공유', '축하 메시지', '공유하기'],
  },
  {
    type: 'together',
    title: '함께 선물 페이지 만들기',
    description: '친구들과 함께 한 사람을 위한 선물을 고르고\n준비할 수 있어요.',
    tags: ['함께 준비', '후보 고르기', '공유하기'],
  },
]

// TODO: 실제 API 연동 전까지 작성 중인 선물 페이지 여부를 mock으로 처리
export const MOCK_HAS_DRAFT: Record<GiftPageType, boolean> = {
  my: false,
  together: false,
}
