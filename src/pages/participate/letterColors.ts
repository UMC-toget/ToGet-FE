/**
 * E03 편지지 색상 8종 (피그마 #1714:70785)
 *
 * 사용자가 고르는 도메인 데이터라 Tailwind 클래스 대신 style prop으로 적용.
 * @theme 토큰과 겹치는 값은 CSS 변수를 참조하고, 편지지 전용 색만 리터럴로 관리.
 */
export interface LetterColor {
  id: string
  name: string
  /** 스와치/편지지 배경색 */
  bg: string
  /** 편지지 테두리·밑줄 색 */
  border: string
  /** '내용을 입력해주세요' placeholder 색 */
  placeholder: string
}

export const LETTER_COLORS: LetterColor[] = [
  { id: 'pink', name: '핑크', bg: 'var(--color-pink-100)', border: 'var(--color-pink-500)', placeholder: 'var(--color-pink-500)' },
  { id: 'red', name: '레드', bg: 'rgba(255, 103, 103, 0.4)', border: '#FF6767', placeholder: '#FF6767' },
  { id: 'yellow', name: '옐로우', bg: 'rgba(255, 238, 126, 0.5)', border: '#FFD000', placeholder: '#FFD000' },
  { id: 'green', name: '그린', bg: 'rgba(147, 215, 0, 0.4)', border: 'rgba(147, 215, 0, 0.7)', placeholder: '#7EB900' },
  { id: 'skyblue', name: '스카이블루', bg: 'rgba(151, 215, 255, 0.5)', border: '#27ACFF', placeholder: '#27ACFF' },
  { id: 'darkpurple', name: '다크퍼플', bg: 'rgba(130, 132, 255, 0.4)', border: '#3724CD', placeholder: '#3724CD' },
  { id: 'lightpurple', name: '라이트퍼플', bg: 'rgba(176, 85, 255, 0.3)', border: '#5A1497', placeholder: '#5A1497' },
  { id: 'white', name: '화이트', bg: '#FFFFFF', border: 'var(--color-gray-700)', placeholder: 'var(--color-gray-400)' },
]
