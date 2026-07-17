export type WishCategory = 'received' | 'given';

export interface WishSourceItem {
  id: string;
  brand: string;
  name: string;
  price: number;
  category: WishCategory; // 받고 싶은 / 주고 싶은
  color: string; // 실제 상품 이미지 대신 쓰는 플레이스홀더 색상
}

export const MOCK_WISH_ITEMS: WishSourceItem[] = [
  { id: 'w1', brand: '탬버린즈', name: '핸드크림', price: 18500, category: 'received', color: '#E8E4D8' },
  { id: 'w2', brand: '오브리', name: '도트 머쉬룸 램프 화이트', price: 65000, category: 'received', color: '#F2ECE4' },
  { id: 'w3', brand: '아라코', name: '유리 캔들 홀더', price: 24000, category: 'given', color: '#DCE7E4' },
  { id: 'w4', brand: '몰펫', name: '캐릭터 인형 키링', price: 15000, category: 'received', color: '#F5E1E8' },
  { id: 'w5', brand: '이솝', name: '핸드워시 500ml', price: 42000, category: 'given', color: '#E4E8DC' },
  { id: 'w6', brand: '스와니코코', name: '디퓨저 세트', price: 38000, category: 'received', color: '#EAE0D5' },
];