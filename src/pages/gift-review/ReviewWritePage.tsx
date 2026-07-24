import { useId, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import TextField from '../../components/common/TextField'
import ConfirmModal from '../../components/common/ConfirmModal'
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import ExpandIcon from '../../components/icons/ExpandIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import { REVIEW_CHARACTERS } from './reviewCharacters'
import { REVIEW_WRITE_TYPES, REVIEW_TITLE_MAX_LENGTH, REVIEW_CONTENT_MAX_LENGTH } from './reviewTypes'
import type { ReviewWriteType } from './reviewTypes'
import { MOCK_USER } from '../my/mockUser'

type ReviewTab = 'message' | 'color' | 'character'

const REVIEW_TABS: { key: ReviewTab; label: string }[] = [
  { key: 'message', label: '메시지' },
  { key: 'color', label: '색상' },
  { key: 'character', label: '캐릭터' },
]

/** LETTER_COLORS의 테두리 토큰(핑크/500, rgba 등)을 초대장 로고 그라데이션 계산에 쓸 순수 hex로 매핑. 화이트는 그라데이션 없이 별도 처리. */
const LETTER_ACCENT_HEX: Record<string, string> = {
  pink: '#fe71a5',
  red: '#ff6767',
  yellow: '#ffd000',
  green: '#93d700',
  skyBlue: '#27acff',
  darkPurple: '#3724cd',
  lightPurple: '#5a1497',
}

/** 초대장 배경에 흩뿌려지는 반짝이 별 장식 (퍼센트 좌표라 카드/모달 크기 상관없이 재사용) */
const SPARKLES: { top: string; left?: string; right?: string; size: number; color: string; rotate: number }[] = [
  { top: '52%', right: '22%', size: 12, color: '#FFFFFF', rotate: 20 },
  { top: '49%', left: '16%', size: 18, color: '#FFFFFF', rotate: 8 },
  { top: '46%', left: '32%', size: 10, color: '#FBCFE8', rotate: 0 },
  { top: '53%', left: '45%', size: 9, color: '#FFFFFF', rotate: 15 },
  { top: '50%', right: '30%', size: 11, color: '#F472B6', rotate: 25 },
  { top: '20%', left: '40%', size: 8, color: '#FBCFE8', rotate: -10 },
]

function ReviewSparkles() {
  return (
    <>
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute select-none"
          style={{ top: s.top, left: s.left, right: s.right, fontSize: s.size, color: s.color, transform: `rotate(${s.rotate}deg)` }}
        >
          ✦
        </span>
      ))}
    </>
  )
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** hex를 흰색과 섞어 밝은 톤을 만듭니다 (ratio 0~1, 1에 가까울수록 더 밝아짐) */
function lighten(hex: string, ratio: number) {
  const c = hexToRgb(hex)
  const r = Math.round(c.r + (255 - c.r) * ratio)
  const g = Math.round(c.g + (255 - c.g) * ratio)
  const b = Math.round(c.b + (255 - c.b) * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

const TOGET_LOGO_PATH =
  'M48.0117 12.9177C58.9686 12.918 66.7148 23.29 66.7148 34.5506C66.7146 45.811 58.9684 56.1831 48.0117 56.1834C37.0548 56.1834 29.3088 45.8111 29.3086 34.5506C29.3086 23.2898 37.0546 12.9177 48.0117 12.9177ZM101.861 3.55739C111.619 3.55739 119.585 10.3465 122.945 19.3435L119.302 20.7039L115.658 22.0652C113.193 15.4646 107.734 11.3367 101.861 11.3367C94.0332 11.337 86.7637 18.8745 86.7637 29.3972C86.7638 40.242 92.512 47.1552 100.271 47.7693C104.789 48.1268 109.154 47.1556 112.863 43.2351C113.127 42.9566 113.613 42.3419 114.158 41.5047C114.692 40.6852 115.179 39.8084 115.503 39.0535C115.709 38.5729 115.85 38.0116 115.938 37.3767H101.861V29.5984H123.813V33.4871C123.813 34.0279 123.879 35.1414 123.813 36.5193V55.3631H116.035V50.8592C110.855 54.9837 104.995 55.9464 99.6582 55.5242C86.5104 54.4837 78.9846 42.797 78.9844 29.3972C78.9844 15.6752 88.7169 3.55773 101.861 3.55739ZM179.201 0.214621C181.732 -0.328734 185.686 -0.0260564 188.414 3.32595C191.052 6.56808 191.585 11.539 190.167 18.073L190.154 18.1287L190.141 18.1843C189.466 20.9039 188.075 25.0296 186.019 28.7273C185.821 29.0825 185.612 29.4366 185.396 29.7908H191.998V37.5701H180.128C180.257 38.035 180.401 38.5202 180.562 39.0154C181.344 41.4096 182.336 43.544 183.302 44.7927C184.966 46.9438 186.935 47.4029 188.155 47.5525C190.43 47.831 192.459 47.3475 194.126 46.1941C195.792 45.0412 197.367 43.0266 198.366 39.784C198.369 39.7728 198.373 39.7608 198.376 39.7478C198.4 39.6529 198.434 39.5091 198.477 39.3269C198.562 38.9609 198.677 38.4456 198.791 37.8572C199.031 36.6169 199.222 35.2904 199.222 34.3533H207.001C207.001 36.0639 206.689 37.989 206.428 39.3377C206.291 40.0437 206.154 40.6581 206.052 41.0974C206 41.3176 205.956 41.4958 205.925 41.6218C205.909 41.6849 205.897 41.7353 205.888 41.7713C205.883 41.789 205.88 41.8035 205.877 41.8142C205.876 41.8195 205.874 41.8244 205.873 41.8279C205.873 41.8296 205.872 41.8315 205.872 41.8328L205.871 41.8347L202.107 40.8552L205.871 41.8357L205.852 41.9129L205.828 41.9881C204.414 46.6307 201.919 50.2609 198.553 52.5906C195.176 54.927 191.198 55.7617 187.21 55.2732C184.882 54.988 180.569 53.9762 177.147 49.5515C175.38 47.2656 174.055 44.1478 173.168 41.4275C172.746 40.1347 172.387 38.8127 172.114 37.5701H165.658V29.7908H170.48C169.626 25.6852 168.998 20.8319 169.173 16.3015C169.299 13.0288 169.854 9.61382 171.29 6.7195C172.785 3.70491 175.291 1.18981 179.074 0.243918L179.138 0.228293L179.201 0.214621ZM37.6523 10.6726H22.7168V54.9256H14.9375V10.6726H0V2.89333H37.6523V10.6726ZM148.743 13.0183C154.455 12.4931 158.692 14.0699 161.156 17.3758C163.428 20.4234 163.514 24.0685 163.056 26.3943L163.031 26.5174L162.999 26.6384C161.295 33.068 155.869 36.5043 150.911 38.2693C146.284 39.9163 141.291 40.4131 137.756 40.3816C137.928 40.6944 138.121 41.0057 138.34 41.3084C139.472 42.8759 141.341 44.3629 144.613 44.7967L144.935 44.8347L144.984 44.8406L145.034 44.8474C146.914 45.1005 149.906 44.974 152.495 43.8494C154.901 42.8044 156.936 40.9428 157.648 37.3816L161.463 38.1443L165.276 38.907C163.988 45.347 159.957 49.0889 155.594 50.9842C151.414 52.7994 146.932 52.9516 143.996 52.5564V52.5554C138.3 51.9108 134.427 49.1738 132.035 45.864C130.738 44.0692 129.904 42.1486 129.41 40.367H126.356V32.5877H129.026C129.803 26.7029 132.619 22.2812 136.069 19.1629C140.139 15.4853 145.031 13.6491 148.435 13.0584L148.588 13.032L148.743 13.0183ZM48.0117 20.6951C42.6055 20.6951 37.0859 26.2119 37.0859 34.5506C37.0861 42.889 42.6056 48.4051 48.0117 48.4051C53.4177 48.4047 58.9363 42.8887 58.9365 34.5506C58.9365 26.2122 53.4178 20.6954 48.0117 20.6951ZM154.92 22.0252C154.574 21.5611 153.443 20.4317 149.61 20.7517C147.405 21.1658 144.029 22.4535 141.285 24.9334C139.281 26.7449 137.584 29.2069 136.906 32.5877H137.085L137.155 32.5906C139.993 32.6934 144.425 32.3211 148.302 30.9412C152.188 29.5577 154.663 27.5016 155.444 24.7703C155.599 23.8323 155.441 22.7236 154.92 22.0252ZM182.381 8.23611C182.083 7.87007 181.552 7.68219 180.882 7.81228C179.769 8.11268 178.934 8.81358 178.259 10.1756C177.508 11.69 177.052 13.8754 176.946 16.6023C176.816 19.985 177.238 23.7248 177.872 27.0779C178.33 26.447 178.783 25.7323 179.221 24.9461C180.859 21.9999 182.026 18.5706 182.581 16.3465C183.795 10.6961 182.774 8.71996 182.381 8.23611Z'

/** "To Get" 로고를 코드로 직접 그려 색을 동적으로 입힙니다 (편지지 색상 선택에 따라 accentHex가 바뀜) */
function TogetLogoMark({ accentHex, isWhite, className }: { accentHex: string; isWhite?: boolean; className?: string }) {
  const gradId = useId()
  return (
    <svg viewBox="-4 -4 215.001 64.1834" className={className} style={{ overflow: 'visible' }} aria-hidden focusable="false">
      {!isWhite && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="56.1834" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lighten(accentHex, 0.92)} />
            <stop offset="55%" stopColor={lighten(accentHex, 0.35)} />
            <stop offset="100%" stopColor={accentHex} />
          </linearGradient>
        </defs>
      )}
      <path
        d={TOGET_LOGO_PATH}
        fill={isWhite ? '#FFFFFF' : `url(#${gradId})`}
        stroke={isWhite ? '#9CA3AF' : 'none'}
        strokeWidth={isWhite ? 2 : 0}
        strokeLinejoin="round"
        paintOrder="stroke fill"
      />
    </svg>
  )
}

/** J파트 작성물 3종 공용 작성 화면 (/gift/review/write/:type, 피그마 "J01-1) 후기: 초대장 만들기" 외) */
export default function ReviewWritePage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()

  const [tab, setTab] = useState<ReviewTab>('message')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [colorId, setColorId] = useState(LETTER_COLORS[7].id) // 기본 화이트
  const [characterIndex, setCharacterIndex] = useState(0) // 기본 No.01
  const [showExitModal, setShowExitModal] = useState(false)
  const [showExpandModal, setShowExpandModal] = useState(false)

  const config = type && type in REVIEW_WRITE_TYPES ? REVIEW_WRITE_TYPES[type as ReviewWriteType] : null
  if (!config) return <Navigate to="/home" replace />

  const letterColor = LETTER_COLORS.find((c) => c.id === colorId) ?? LETTER_COLORS[7]
  const isWhite = letterColor.id === 'white'
  const accentHex = LETTER_ACCENT_HEX[letterColor.id] ?? LETTER_ACCENT_HEX.pink
  const glowColor = isWhite ? 'var(--color-gray-200)' : letterColor.background
  const characterImage = REVIEW_CHARACTERS[characterIndex]
  const displayTitle = title || config.titlePlaceholder
  const displayContent = content || config.contentPlaceholder
  const canSubmit = title.trim() !== '' && content.trim() !== ''

  const changeCharacter = (delta: number) => {
    const count = REVIEW_CHARACTERS.length
    setCharacterIndex((prev) => (prev + delta + count) % count)
  }

  const handleExit = () => setShowExitModal(true)

  const handleSubmit = () => {
    // TODO: BE 연동 시 작성 데이터 전송 (colorId, characterIndex 포함)
    navigate(config.completePath)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header
        title={config.headerTitle}
        onBack={handleExit}
        right={
          <button type="button" onClick={handleExit} className="text-b2-m text-black">
            나가기
          </button>
        }
      />

      <div className="flex flex-col gap-6 px-[18px] pt-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3-sb text-black">{config.guideTitle}</h2>
          <p className="text-caption1-r text-gray-600">{config.guideDescription}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowExpandModal(true)}
          aria-label="초대장 미리보기 확대"
          className="relative block h-64 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{ background: `radial-gradient(circle at 50% 45%, ${accentHex} 0%, ${glowColor} 20%, transparent 65%)` }}
          />
          <ReviewSparkles />
          <TogetLogoMark accentHex={accentHex} isWhite={isWhite} className="absolute left-1/2 top-4 z-0 h-12 -translate-x-1/2" />
          <img src={characterImage} alt="" className="absolute left-1/2 top-9.5 z-10 h-19 -translate-x-1/2" />
          <div className="absolute bottom-4 left-1/2 w-3/5 -translate-x-1/2 rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className={`truncate text-b2-m ${title ? 'text-black' : 'text-gray-400'}`}>{displayTitle}</p>
            <p className={`mt-1 line-clamp-2 text-caption1-r ${content ? 'text-gray-600' : 'text-gray-400'}`}>{displayContent}</p>
            {config.showFrom && (
              <span className="mt-2 block text-right text-[10px] font-medium" style={{ color: accentHex }}>
                from. {MOCK_USER.name}
              </span>
            )}
          </div>
          <span className="absolute bottom-3 right-3 z-20 flex size-7 items-center justify-center rounded-[14px] bg-gray-100 shadow-sm">
            <ExpandIcon className="size-4 text-gray-500" />
          </span>
        </button>

        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {REVIEW_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded px-2.5 py-2 text-b2-m ${
                tab === t.key ? 'bg-white text-black' : 'bg-transparent text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'message' && (
          <div className="flex flex-col gap-6">
            <TextField
              label={config.titleLabel}
              placeholder={config.titlePlaceholder}
              value={title}
              maxLength={REVIEW_TITLE_MAX_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label={config.contentLabel}
              placeholder={config.contentPlaceholder}
              value={content}
              maxLength={REVIEW_CONTENT_MAX_LENGTH}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {tab === 'color' && (
          <div className="flex flex-col gap-3">
            <p className="text-b1-m text-black">편지지 색상</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {LETTER_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`${c.name} 편지지`}
                  onClick={() => setColorId(c.id)}
                  className={`size-[35px] shrink-0 rounded-[4px] ${colorId === c.id ? '' : 'opacity-60'}`}
                  style={{
                    backgroundColor: c.background,
                    ...(c.id === 'white' && { border: '2px solid var(--color-gray-500)' }),
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'character' && (
          <div className="flex flex-col gap-3">
            <p className="text-b1-m text-black">캐릭터 선택</p>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => changeCharacter(-1)}
                aria-label="이전 캐릭터"
                className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-700"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <div className="flex flex-col items-center gap-2">
                <img
                  src={characterImage}
                  alt={`캐릭터 No.${String(characterIndex + 1).padStart(2, '0')}`}
                  className="h-24 w-24 object-contain"
                />
                <span className="rounded bg-pink-500 px-2 py-0.5 text-caption1-r font-medium text-white">
                  No.{String(characterIndex + 1).padStart(2, '0')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => changeCharacter(1)}
                aria-label="다음 캐릭터"
                className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-700"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button className="pointer-events-auto" disabled={!canSubmit} onClick={handleSubmit}>
          저장
        </Button>
      </div>

      {/* 피그마 상 좌측이 나가기, 우측이 이어서 작성하기라 cancel/confirm이 평소와 반대로 매핑됨 (참여 흐름과 동일한 관례) */}
      <ConfirmModal
        open={showExitModal}
        title="페이지를 나가시겠어요?"
        description={'지금 나가면, 작성 중인 내용이\n사라질 수 있어요'}
        cancelText="나가기"
        confirmText="이어서 작성하기"
        onCancel={() => navigate('/home')}
        onConfirm={() => setShowExitModal(false)}
      />

      {/* 피그마 "확대" 프레임: 카드가 페이지와 동일한 여백으로 전체 화면을 채우고, 닫기 버튼은 카드 바로 아래 중앙에 위치 */}
      {showExpandModal && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowExpandModal(false)}>
          <div className="mx-auto flex h-full w-full max-w-[402px] flex-col items-center px-[18px] pb-[34px] pt-16">
            <div
              className="relative w-full flex-1 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                style={{ background: `radial-gradient(circle at 50% 65%, ${accentHex} 0%, ${glowColor} 25%, transparent 65%)` }}
              />
              <ReviewSparkles />
              <div className="flex h-full flex-col items-center justify-between pt-8 pb-6">
                <div className="flex flex-col items-center">
                  <TogetLogoMark accentHex={accentHex} isWhite={isWhite} className="relative z-0 h-24" />
                  <img src={characterImage} alt="" className="relative z-10 -mt-9 h-52" />
                </div>
                <div className="w-[calc(100%-40px)] rounded-2xl bg-white p-5 text-left shadow-sm">
                  <p className={`text-h3-sb ${title ? 'text-black' : 'text-gray-400'}`}>{displayTitle}</p>
                  <p className={`mt-2 whitespace-pre-line text-b2-r ${content ? 'text-gray-600' : 'text-gray-400'}`}>
                    {displayContent}
                  </p>
                  {config.showFrom && (
                    <p className="mt-3 text-right text-b2-m" style={{ color: accentHex }}>
                      from. {MOCK_USER.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowExpandModal(false)}
              aria-label="닫기"
              className="mt-4 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-md"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
