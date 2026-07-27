import { apiClient, unwrap } from '../lib/apiClient'

// ─── J: 꾸미기 리소스 ─────────────────────────────────────────

export interface ContributionBackground {
  id: number
  name: string
  hexCode: string
}

export interface Character {
  id: number
  name: string
  imageUrl: string
}

/** 편지지 배경 색상 목록 조회 */
export function getContributionBackgrounds() {
  return unwrap<ContributionBackground[]>(apiClient.get('/api/v1/contribution-backgrounds'))
}

/** 편지지 캐릭터 목록 조회 */
export function getCharacters() {
  return unwrap<Character[]>(apiClient.get('/api/v1/characters'))
}
