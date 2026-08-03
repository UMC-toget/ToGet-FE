import { apiGet } from '../lib/api'

export interface BackgroundMeta {
  id: number
  name: string
  hexCode: string
}

export interface CharacterMeta {
  id: number
  name: string
  imageUrl: string
}

// 편지지(축하 메세지) 색은 피그마 고정 8종을 작성자가 직접 고르는 로컬 팔레트라 BE 조회하지 않음.
// (초대장 배경은 개설자가 정하는 값이라 BE에서 받아옴 — 아래 유지)
export const fetchInvitationBackgrounds = () =>
  apiGet<BackgroundMeta[]>('/api/v1/invitation-backgrounds')

export const fetchCharacters = () =>
  apiGet<CharacterMeta[]>('/api/v1/characters')
