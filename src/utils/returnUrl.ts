const RETURN_URL_KEY = 'toget_return_url'

/**
 * 로그인 후 돌아올 경로를 저장한다. (H 참여처럼 외부 링크로 유입돼 로그인이 필요한 경우)
 * sessionStorage를 쓰는 이유: 카카오 로그인은 전체 페이지 리다이렉트라 React Router의
 * in-memory location.state가 날아가는데, sessionStorage는 같은 탭 리로드에도 유지된다.
 */
export function setReturnUrl(path: string): void {
  sessionStorage.setItem(RETURN_URL_KEY, path)
}

/** 저장된 복귀 경로를 꺼내면서 제거한다 (1회용). 없으면 null. */
export function consumeReturnUrl(): string | null {
  const path = sessionStorage.getItem(RETURN_URL_KEY)
  if (path) sessionStorage.removeItem(RETURN_URL_KEY)
  return path
}
