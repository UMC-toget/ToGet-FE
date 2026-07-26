const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
