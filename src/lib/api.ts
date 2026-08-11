// Preview 환경변수가 비어 있거나 '.', './' 같은 상대 경로여도 프론트 주소로 요청하지 않도록
// 절대 HTTP(S) URL만 허용하고, 그 외에는 개발 API 서버를 사용합니다.
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const BASE_URL = /^https?:\/\//i.test(configuredBaseUrl ?? '')
  ? configuredBaseUrl!.replace(/\/+$/, '')
  : 'https://dev.api.toget.kr'

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
