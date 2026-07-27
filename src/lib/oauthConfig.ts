// OAuth 클라이언트 ID는 비밀 값이 아니라(브라우저에 그대로 노출되는 공개 값) 코드에 기본값을
// 두어도 안전합니다. 배포 환경마다 다른 값을 쓰고 싶으면 환경변수로 덮어쓸 수 있습니다.
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  '822457623986-3cjnid3nq13pujhtrr7qtbqacm3f0da5.apps.googleusercontent.com'

export const KAKAO_JS_KEY: string =
  import.meta.env.VITE_KAKAO_JS_KEY ?? 'db23e6e2ac0d68b2023322fbd4e61e77'

/** authorize() → code 발급 후, 그 code를 access token으로 교환할 때(카카오 토큰 엔드포인트 호출) 사용 */
export const KAKAO_REST_API_KEY: string =
  import.meta.env.VITE_KAKAO_REST_API_KEY ?? 'bea9109420ad1129e9569455316f163a'
