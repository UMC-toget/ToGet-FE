export interface Participant {
  id: string
  name: string
  /** 정렬용 타임스탬프 (최신순/오래된순) */
  timestamp: number
  /** 화면 표시용 'YYYY.MM.DD' */
  dateLabel: string
  amount: number
}

// TODO: BE 연동 후 참여자 목록 조회 API 응답으로 교체.
// 금액 합계가 fundingMock.ts의 currentAmount(203,800원)·참여 인원(7명)과 맞도록 구성했습니다.
const NAMES = ['지은', '서진', '밍밍', '뇽이', '아진', '세라', '민경']
const AMOUNTS = [100000, 30000, 20000, 20000, 15000, 10000, 8800]

function dateLabel(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function getMockParticipants(): Participant[] {
  return NAMES.map((name, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      id: `p${i + 1}`,
      name,
      timestamp: date.getTime(),
      dateLabel: dateLabel(i),
      amount: AMOUNTS[i],
    }
  })
}
