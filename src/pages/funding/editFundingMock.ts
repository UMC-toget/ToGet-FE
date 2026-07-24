import type { EditableSnapshot } from '../../store/fundingCreateStore';
import productAirpods from '../../assets/mock/product-airpods.png';
import productAirpodsCase from '../../assets/mock/product-airpods-case.png';

// TODO: BE 연동 후 "내가 만든 선물 페이지" 상세 조회 API 응답으로 교체.
// 수정 화면 진입 시 이 데이터로 fundingCreateStore를 채우고(loadForEdit),
// 이 값이 곧 "원본 스냅샷"이 되어 각 단계의 "변경됨" 여부를 판정하는 기준이 됩니다.

function toDateKey(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMockEditData(): EditableSnapshot {
  return {
    title: '희주의 25번째 생일',
    anniversaryDate: toDateKey(7),
    preparationStartDate: toDateKey(2),
    preparationEndDate: toDateKey(6),
    greeting:
      '안녕하세요, 희주입니다 :)\n올해 생일에 받고 싶은 선물이 있어\n이렇게 페이지를 열어봤어요.\n축하 메시지만 남겨주셔도 정말 큰 마음이 될 것 같아요.',
    thumbnailImage: null,
    wishlist: [
      { id: 'w1', name: 'Apple AirPods Pro 3', price: 369000, imageUrl: productAirpods },
      { id: 'w2', name: 'AirPods Pro 3 Case', price: 23000, imageUrl: productAirpodsCase },
    ],
    showProgress: true,
    showAmount: true,
    showParticipantCount: true,
    showParticipantNames: true,
    showMessages: true,
    accounts: [
      { id: 'a1', bankName: '신한은행', accountNumber: '110-585-123456', accountHolder: '김희주' },
      { id: 'a2', bankName: '카카오뱅크', accountNumber: '110-585-123456', accountHolder: '김희주' },
    ],
    selectedAccountId: 'a1',
    inviteTitle: '생일 초대장이 도착했어요!',
    inviteContent: '안녕하세요!! 내가 이번 생일에 진짜 필요한 선물을 사고 싶은데 혹시 함께해줄 수 있을까!?',
    inviteColor: '#FCE4F0',
    inviteCharacter: 1,
  };
}
