import type { MyFundingSummary } from '../../types/funding'
import fundingThumbBoots from '../../assets/mock/funding-thumb-boots.png'

// TODO: BE 연동 후 "내가 만든 선물 페이지 목록" API 응답으로 교체.
// ?mine=0|1|3 쿼리는 mock 확인용 (연동 시 제거)

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const ALL_MOCK_FUNDINGS: MyFundingSummary[] = [
  {
    id: 'mine-1',
    title: '희주의 25번째 생일',
    thumbnailImage: fundingThumbBoots,
    targetAmount: 90000,
    currentAmount: 55800,
    gaugePercent: 62,
    anniversaryDate: addDays(7),
  },
  {
    id: 'mine-2',
    title: '민경이 자취 집들이',
    thumbnailImage: fundingThumbBoots,
    targetAmount: 150000,
    currentAmount: 42000,
    gaugePercent: 28,
    anniversaryDate: addDays(14),
  },
  {
    id: 'mine-3',
    title: '지은이 졸업 축하',
    thumbnailImage: fundingThumbBoots,
    targetAmount: 120000,
    currentAmount: 96000,
    gaugePercent: 80,
    anniversaryDate: addDays(3),
  },
]

/** 진행 중인 선물이 없을 때(기본) / 1개일 때(?mine=1) / 여러 개일 때(?mine=3) 화면을 쿼리로 확인 */
export function getMockMyFundings(count: number): MyFundingSummary[] {
  return ALL_MOCK_FUNDINGS.slice(0, count)
}
