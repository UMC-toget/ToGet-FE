const PRIVACY_POLICY_URL = 'https://app.notion.com/p/3ad81f992be580548e2fd396de8a6222?source=copy_link'
const TERMS_OF_SERVICE_URL = 'https://app.notion.com/p/3ad81f992be580bf8289f079b8ba6ace?source=copy_link'
const CONTACT_EMAIL = 'hello.toget.team@gmail.com'

/** 홈 화면 최하단 링크 영역: 개인정보처리방침 / 서비스 이용약관(노션) / 문의하기(메일) */
export default function HomeFooter() {
  return (
    // 하단 pb는 플로팅 BottomNav(고정 위치)에 링크가 가리지 않도록 그만큼의 여유를 둡니다 (피그마 기준).
    <div className="mt-14 flex items-center gap-2 bg-background px-[18px] pb-[136px] pt-6">
      <a
        href={PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-b2-r text-gray-900"
      >
        개인정보처리방침
      </a>
      <span className="text-gray-300">|</span>
      <a
        href={TERMS_OF_SERVICE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-b2-r text-gray-900"
      >
        서비스 이용약관
      </a>
      <span className="text-gray-300">|</span>
      <a href={`mailto:${CONTACT_EMAIL}`} className="text-b2-r text-gray-900">
        문의하기
      </a>
    </div>
  )
}
