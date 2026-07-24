import type { FundingDetail } from '../../types/funding'
import type { FundingCreateState } from '../../store/fundingCreateStore'
import { MOCK_USER } from '../my/mockUser'

// TODO: BE 연동 후 제거. 지금은 백엔드가 없어서 "내가 만든 선물 페이지"를 볼 때
// fundingCreateStore(만들기/수정 플로우에서 입력한 실제 값)를 그대로 화면에 반영합니다.
// 참여 금액/참여자 목록/축하 메세지처럼 실제 참여자가 있어야 생기는 데이터는
// 아직 만들 방법이 없어서 base(정적 목업)에서 그대로 가져옵니다.

/** 스토어에 실제로 입력된 값(제목/날짜/소개글/이미지/위시리스트/공개범위)을 기존 목업 위에 덮어씌웁니다 */
export function buildFundingFromStore(state: FundingCreateState, base: FundingDetail): FundingDetail {
  const hasWishlist = state.wishlist.length > 0
  const targetAmount = hasWishlist
    ? state.wishlist.reduce((sum, item) => sum + item.price, 0)
    : base.targetAmount

  return {
    ...base,
    title: state.title || base.title,
    hostName: MOCK_USER.name,
    hostFullName: MOCK_USER.name,
    anniversaryDate: state.anniversaryDate || base.anniversaryDate,
    deadline: state.preparationEndDate || base.deadline,
    greeting: state.greeting || base.greeting,
    targetAmount,
    wishlist: hasWishlist
      ? state.wishlist.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl ?? base.wishlist[0]?.imageUrl ?? '',
          purchaseUrl: item.link ?? '#',
        }))
      : base.wishlist,
    visibility: {
      showProgress: state.showProgress,
      showAmount: state.showAmount,
      showParticipantCount: state.showParticipantCount,
      showParticipantNames: state.showParticipantNames,
      showMessages: state.showMessages,
    },
  }
}

/** 방금 만든/불러온 대표 이미지를 <img src>로 쓸 수 있는 문자열로 변환 (File이면 미리보기 URL 생성) */
export function getThumbnailSrc(thumbnailImage: FundingCreateState['thumbnailImage']): string | null {
  if (!thumbnailImage) return null
  return typeof thumbnailImage === 'string' ? thumbnailImage : URL.createObjectURL(thumbnailImage)
}
