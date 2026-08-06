import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'hello.toget.team@gmail.com'

/** 홈 화면 최하단 링크 영역: 개인정보처리방침 / 서비스 이용약관(toget.kr 자체 호스팅) / 문의하기(메일) */
export default function HomeFooter() {
  return (
    // 하단 pb는 플로팅 BottomNav(고정 위치)에 링크가 가리지 않도록 그만큼의 여유를 둡니다 (피그마 기준).
    <div className="mt-14 flex items-center gap-2 bg-background px-[18px] pb-[136px] pt-6">
      <Link to="/privacy-policy" className="text-b2-r text-gray-900">
        개인정보처리방침
      </Link>
      <span className="text-gray-300">|</span>
      <Link to="/terms" className="text-b2-r text-gray-900">
        서비스 이용약관
      </Link>
      <span className="text-gray-300">|</span>
      <a href={`mailto:${CONTACT_EMAIL}`} className="text-b2-r text-gray-900">
        문의하기
      </a>
    </div>
  )
}
