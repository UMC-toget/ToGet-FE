import productLipbalm from '../assets/mock/product-lipbalm.png';
import productVitamin from '../assets/mock/product-vitamin.png';
import productCamera from '../assets/mock/product-camera.png';
import productRoomspray from '../assets/mock/product-roomspray.png';
import productCushion from '../assets/mock/product-cushion.png';
import productPerfume from '../assets/mock/product-perfume.png';
import productHandcream from '../assets/mock/product-handcream.png';
import productLamp from '../assets/mock/product-lamp.png';

export type WishCategory = 'received' | 'given';

export interface WishSourceItem {
  id: string;
  brand: string;
  name: string;
  price: number;
  category: WishCategory; // 받고 싶은 / 주고 싶은
  image: string; // 실제 상품 이미지
}

export const MOCK_WISH_ITEMS: WishSourceItem[] = [
  { id: 'w1', brand: '탬버린즈', name: '핸드크림', price: 18500, category: 'received', image: productHandcream },
  { id: 'w2', brand: '오브리', name: '도트 머쉬룸 램프 화이트', price: 65000, category: 'received', image: productLamp },
  { id: 'w3', brand: '이니스프리', name: '립밤', price: 6000, category: 'given', image: productLipbalm },
  { id: 'w4', brand: '뉴트리원', name: '멀티 비타민', price: 22000, category: 'received', image: productVitamin },
  { id: 'w5', brand: '캐논', name: '미니 디지털 카메라', price: 89000, category: 'received', image: productCamera },
  { id: 'w6', brand: '스와니코코', name: '룸스프레이', price: 24000, category: 'given', image: productRoomspray },
  { id: 'w7', brand: '탬버린즈', name: '퍼퓸 30ml', price: 58000, category: 'given', image: productPerfume },
  { id: 'w8', brand: '슬립퍼', name: '메모리폼 쿠션', price: 32000, category: 'received', image: productCushion },
];
