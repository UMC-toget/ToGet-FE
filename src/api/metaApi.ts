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

export const fetchContributionBackgrounds = () =>
  apiGet<BackgroundMeta[]>('/api/v1/contribution-backgrounds')

export const fetchInvitationBackgrounds = () =>
  apiGet<BackgroundMeta[]>('/api/v1/invitation-backgrounds')

export const fetchCharacters = () =>
  apiGet<CharacterMeta[]>('/api/v1/characters')
