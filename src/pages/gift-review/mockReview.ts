import reviewSample1 from '../../assets/mock/review-sample-1.jpeg'
import reviewSample2 from '../../assets/mock/review-sample-2.jpeg'

export interface GiftReview {
  id: string
  /** 후기를 작성한(선물을 받은) 사람 이름 */
  senderName: string
  /** 받는 사람 인사말 (LetterCard 헤더, 예: "선물을 준 모두에게") */
  title: string
  content: string
  /** LETTER_COLORS의 id */
  colorId: string
  images: string[]
}

/** TODO: 후기 API 연동 후 제거 (피그마 J01-2 디자인 기준 목업 데이터, 직접 URL 접근 시 폴백용) */
export const MOCK_REVIEWS: GiftReview[] = [
  {
    id: '1',
    senderName: '희주',
    title: '선물을 준 모두에게',
    content:
      '나에게 생일선물을 줘서 정말 고마워 다들!!\n덕분에 매일매일 새로운 에어팟과 함께하고있어 ㅋㅋㅋ\n너무너무 고맙고 덕분에 내가 이렇게 많은 사랑을 받았구나\n느끼는 하루였어!!! 같이 보내준 편지들도 다 읽어봤어!!\n너무너무 고맙고 다들 좋은하루 보내길 바라',
    colorId: 'pink',
    images: [reviewSample1, reviewSample2, reviewSample1, reviewSample2, reviewSample1],
  },
  {
    id: '2',
    senderName: '민경',
    title: '생일 축하해준 모두에게',
    content: '받고 싶었던 선물이라 더 특별했어 ❤️\n다음에 꼭 맛있는 거 사줄게!',
    colorId: 'white',
    images: [reviewSample1, reviewSample2],
  },
  {
    id: '3',
    senderName: '유나',
    title: '선물을 준 모두에게',
    content: '사진은 못 찍었지만 선물 정말 잘 받았어!\n마음 담아 골라줘서 너무 고마워\n다들 항상 건강하고 행복하길 바라 :)',
    colorId: 'skyBlue',
    images: [],
  },
  {
    id: '4',
    senderName: '수아',
    title: '축하해준 모두에게',
    content: '오래 갖고 싶었던 물건이라 더 기뻤어\n다음 모임 때 밥 살게~',
    colorId: 'darkPurple',
    images: [reviewSample2],
  },
]

/** id에 해당하는 후기를 반환. 없으면 첫 번째 목업으로 대체 */
export function getMockReview(id: string | undefined): GiftReview {
  return MOCK_REVIEWS.find((review) => review.id === id) ?? MOCK_REVIEWS[0]
}
