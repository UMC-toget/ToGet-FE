// lib/apiClient.ts의 API_BASE_URL과 동일한 fallback을 써야 한다 — 여기만 빈 문자열로 두면
// VITE_API_BASE_URL 미설정 시(.env.local에 없음) 프론트 자기 자신의 상대 경로로 요청이 나가
// 조용히 404가 난다 (metaApi.ts의 fetchInvitationBackgrounds/fetchCharacters가 이 버그로 실패했었음).
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dev.api.toget.kr'

interface ApiResponse<T> {
  isSuccess: boolean
  code: string
  message: string
  result: T
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { headers })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)

  const json: ApiResponse<T> = await res.json()
  if (!json.isSuccess) throw new Error(json.message)
  return json.result
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)

  const json: ApiResponse<T> = await res.json()
  if (!json.isSuccess) throw new Error(json.message)
  return json.result
}
