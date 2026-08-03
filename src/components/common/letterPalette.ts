/**
 * 편지지 색상 8종 (피그마 "편지지" 공통 컴포넌트, 접힘/입력전/열림 3상태 공용 팔레트)
 *
 * 사용자가 고르는 도메인 데이터라 Tailwind 클래스 대신 style prop으로 적용.
 * @theme 토큰과 겹치는 값은 CSS 변수를 참조하고, 편지지 전용 색만 리터럴로 관리.
 * E(참여) / J(후기·소식·마음전하기) 화면이 공유한다.
 */
export interface LetterColor {
  id: string
  name: string
  /** BE 제출용 배경 id (피그마 고정 8종 순서 1~8). E·H 공통 */
  backgroundId: number
  /** 스와치/편지지 배경색 */
  background: string
  /** 편지지 테두리 색 */
  border: string
  /** 편지지 밑줄 색 (피그마 기준 border의 반투명 버전인 경우가 많음) */
  lineColor: string
  /** '내용을 입력해주세요' placeholder 색 */
  placeholder: string
  /** 스와치 선택 시 2px 테두리 색 (피그마 스와치 기준 — border와 다를 수 있음) */
  swatchSelectedBorder: string
}

export const LETTER_COLORS: LetterColor[] = [
  { id: 'pink', name: '핑크', backgroundId: 1, background: 'rgba(254, 113, 165, 0.4)', border: 'var(--color-pink-500)', lineColor: 'rgba(254, 113, 165, 0.5)', placeholder: 'var(--color-pink-500)', swatchSelectedBorder: '#FE71A5' },
  { id: 'red', name: '레드', backgroundId: 2, background: 'rgba(255, 103, 103, 0.4)', border: '#FF6767', lineColor: 'rgba(255, 103, 103, 0.7)', placeholder: '#FF6767', swatchSelectedBorder: '#FF6767' },
  { id: 'yellow', name: '옐로우', backgroundId: 3, background: 'rgba(255, 238, 126, 0.5)', border: '#FFD000', lineColor: '#FFD000', placeholder: '#FFD000', swatchSelectedBorder: '#FFC70D' },
  { id: 'green', name: '그린', backgroundId: 4, background: 'rgba(147, 215, 0, 0.4)', border: 'rgba(147, 215, 0, 0.7)', lineColor: 'rgba(147, 215, 0, 0.7)', placeholder: 'rgba(116, 169, 0, 0.7)', swatchSelectedBorder: 'rgba(0, 215, 43, 0.7)' },
  { id: 'skyBlue', name: '스카이블루', backgroundId: 5, background: 'rgba(151, 215, 255, 0.5)', border: '#27ACFF', lineColor: 'rgba(39, 172, 255, 0.4)', placeholder: '#27ACFF', swatchSelectedBorder: '#27ACFF' },
  { id: 'darkPurple', name: '다크퍼플', backgroundId: 6, background: 'rgba(130, 132, 255, 0.4)', border: '#3724CD', lineColor: 'rgba(55, 36, 205, 0.3)', placeholder: '#3724CD', swatchSelectedBorder: '#3724CD' },
  { id: 'lightPurple', name: '라이트퍼플', backgroundId: 7, background: 'rgba(176, 85, 255, 0.3)', border: '#5A1497', lineColor: 'rgba(90, 20, 151, 0.3)', placeholder: '#5A1497', swatchSelectedBorder: '#5A1497' },
  { id: 'white', name: '화이트', backgroundId: 8, background: '#FFFFFF', border: 'var(--color-gray-700)', lineColor: 'var(--color-gray-300)', placeholder: 'var(--color-gray-400)', swatchSelectedBorder: '#7F7779' },
]
