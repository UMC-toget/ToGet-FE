import { apiClient, unwrap } from '../lib/apiClient'

/**
 * 초대장 배경 색상 / 캐릭터의 관리자 전용 CUD. 조회(GET)는 기존 metaApi.ts의
 * fetchInvitationBackgrounds/fetchCharacters를 그대로 재사용한다(응답 형태 동일).
 * 여기서는 apiClient(axios)를 써서 다른 관리자 API(products)와 인증 처리 방식을 통일한다
 * — lib/api.ts의 apiGet/apiPost는 토큰을 매번 수동으로 넘겨야 해서 관리자 기능엔 안 맞는다.
 */

export function createInvitationBackground(payload: { name: string; hexCode: string }) {
  return unwrap<{ id: number }>(apiClient.post('/api/v1/invitation-backgrounds', payload))
}

export function updateInvitationBackground(id: number, payload: { name: string; hexCode: string }) {
  return unwrap<{ id: number; name: string; hexCode: string }>(
    apiClient.put(`/api/v1/invitation-backgrounds/${id}`, payload),
  )
}

export function deleteInvitationBackground(id: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/invitation-backgrounds/${id}`))
}

export function createCharacter(payload: { name: string; imageUrl: string }) {
  return unwrap<{ id: number }>(apiClient.post('/api/v1/characters', payload))
}

export function deleteCharacter(id: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/characters/${id}`))
}
