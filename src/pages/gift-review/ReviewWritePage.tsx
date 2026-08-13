import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import CloseIcon from '../../components/icons/CloseIcon'
import ZoomOutIcon from '../../components/icons/ZoomOutIcon'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import InvitationHero from '../../components/invitation/InvitationHero'
import { getInviteThemeColor, isWhiteInviteTheme } from '../../components/invitation/inviteTheme'
import { FALLBACK_CHARACTER_IMAGE } from './reviewCharacters'
import { REVIEW_WRITE_TYPES } from './reviewTypes'
import type { ReviewWriteType, ReviewPreviewData, ReviewContentState } from './reviewTypes'
import { useContributionBackgrounds, useCharacters, colorIdToBackgroundId } from './useDecorations'
import { useCreateReview, useCreateNews, useCreateHeartfelt, getReviewSubmitErrorMessage } from './useReviews'
import { useMyProfile } from '../../hooks/useMyProfile'

const TOAST_DURATION_MS = 2000

// TODO: E·H 진입점(펀딩 상세/함께 참여)에서 fundingId를 넘겨주기 전까지, 라우트 직접 접근 시 사용할 임시값
const FALLBACK_FUNDING_ID = '1'

type ReviewTab = 'color' | 'character'

const REVIEW_TABS: { key: ReviewTab; label: string }[] = [
  { key: 'color', label: '색상' },
  { key: 'character', label: '캐릭터' },
]

/** 초대장 카드 네이티브 프레임(피그마 E01 초대장 카드 실측값 — InvitationHero가 402px 프레임 기준으로 설계돼 있어 폭을 맞춘다). 미리보기/확대 모달은 이 한 덩어리를 폭만 다르게 scale한다 */
const CARD_NATIVE_WIDTH = 402
const CARD_NATIVE_HEIGHT = 624

/**
 * 초대장 카드(히어로 + 편지 박스)를 컨테이너 실측 폭에 맞춰 통째로 축소 렌더.
 * 컨테이너에 aspect-ratio(366:568)를 걸어 높이를 폭에서 자동 계산하고, 그 안의 366×568 네이티브 레이어를
 * transform: scale로 한 번에 줄인다. 미리보기 카드와 확대 모달이 컨테이너 폭만 다른 "같은 카드"가 되도록
 * 히어로와 편지 박스를 이 레이어 안에 함께 절대 배치한다(따로 얹지 않음).
 */
function InvitationCardFrame({
  className,
  characterImageUrl,
  characterId,
  logoColor,
  whiteLogo,
  heroTitle,
  title,
  content,
  isTitlePlaceholder,
  isContentPlaceholder,
  fromName,
  accentColor,
}: {
  className?: string
  characterImageUrl?: string
  characterId?: number | null
  logoColor?: string
  whiteLogo?: boolean
  heroTitle: string
  title: string
  content: string
  isTitlePlaceholder: boolean
  isContentPlaceholder: boolean
  fromName?: string | null
  accentColor: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // 폭을 측정하기 전(0 또는 미측정)에는 null로 두고 네이티브 366×568 그대로 그리지 않는다 —
  // 그 상태로 렌더하면 스케일 1(원본 크기)짜리 레이어가 잠깐 그대로 보여 "과확대"처럼 잘려 보인다.
  const [scale, setScale] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateScale = () => {
      if (el.offsetWidth === 0) return
      setScale(el.offsetWidth / CARD_NATIVE_WIDTH)
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', aspectRatio: `${CARD_NATIVE_WIDTH} / ${CARD_NATIVE_HEIGHT}`, overflow: 'hidden' }}
    >
      {scale != null && (
        <div
          style={{
            position: 'relative',
            width: CARD_NATIVE_WIDTH,
            height: CARD_NATIVE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* 캐릭터·글로우·로고는 InvitationHero가 그대로 그린다. 위치는 히어로 내부 절대좌표를 건드리지 않는다 */}
          <InvitationHero
            characterImageUrl={characterImageUrl}
            characterId={characterId}
            logoColor={logoColor}
            whiteLogo={whiteLogo}
            title={heroTitle}
          />
          {/* 편지 박스 (피그마: left 4.5%, top 61.3%, width 91%, height는 내용따라 auto) — 캐릭터 배경원 위에 겹쳐 앉는다 */}
          <div
            className="absolute rounded-2xl bg-white p-5 text-left shadow-sm"
            style={{ left: '4.5%', top: '72%', width: '91%' }}
          >
            <p className={`truncate text-h3-sb ${isTitlePlaceholder ? 'text-gray-400' : 'text-black'}`}>{title}</p>
            <p
              className={`mt-2 line-clamp-3 whitespace-pre-line text-b2-r ${isContentPlaceholder ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {content}
            </p>
            {fromName != null && (
              <p className="mt-3 text-right text-b2-m" style={{ color: accentColor }}>
                from. {fromName}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** J파트 작성물 3종 공용 초대장 작성 화면 (2단계, /gift/review/write/:type/:fundingId?/invitation, 피그마 "J01-1) 후기: 초대장 만들기" 외) */
export default function ReviewWritePage() {
  useRequireAuth()
  const { data: profile } = useMyProfile()

  const { type, fundingId } = useParams<{ type: string; fundingId?: string }>()
  const resolvedFundingId = fundingId ?? FALLBACK_FUNDING_ID
  const navigate = useNavigate()
  const location = useLocation()
  // 1단계(ReviewContentWritePage)에서 navigate state로 받는사람/후기내용/이미지를 전달받는다.
  // 직접 URL 접근 등으로 state가 없으면 빈 값으로 취급한다.
  const contentState = (location.state as ReviewContentState | null) ?? null
  const bodyTitle = contentState?.title ?? ''
  const bodyContent = contentState?.content ?? ''
  const bodyImages = contentState?.images ?? []

  const [tab, setTab] = useState<ReviewTab>('color')
  const [colorId, setColorId] = useState(LETTER_COLORS[7].id) // 기본 화이트
  const [characterIndex, setCharacterIndex] = useState(0) // 기본 No.01
  const [showExitModal, setShowExitModal] = useState(false)
  const [showExpandModal, setShowExpandModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const backgrounds = useContributionBackgrounds()
  const characters = useCharacters()
  const createReviewMutation = useCreateReview(resolvedFundingId)
  const createNewsMutation = useCreateNews(resolvedFundingId)
  const createHeartfeltMutation = useCreateHeartfelt(resolvedFundingId)

  useEffect(() => {
    if (toastMessage === null) return
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const config = type && type in REVIEW_WRITE_TYPES ? REVIEW_WRITE_TYPES[type as ReviewWriteType] : null
  if (!config) return <Navigate to="/home" replace />

  const letterColor = LETTER_COLORS.find((c) => c.id === colorId) ?? LETTER_COLORS[7]
  // characters 로딩이 늦거나 목록이 줄어들어도 characterIndex가 범위를 벗어나지 않도록 매번 렌더 시점에 보정
  const safeCharacterIndex = characters.length > 0 ? characterIndex % characters.length : 0
  const currentCharacter = characters[safeCharacterIndex]
  const characterImage = currentCharacter?.imageUrl ?? FALLBACK_CHARACTER_IMAGE
  // 받는사람/후기내용은 1단계(ReviewContentWritePage)에서 입력받아 여기선 미리보기에만 반영한다
  const displayTitle = bodyTitle || config.titlePlaceholder
  const displayContent = bodyContent || config.contentPlaceholder
  const canSubmit = !submitting

  // 조회 화면(InvitationVisual/useInvitationCard)과 동일한 backgroundId→테마색 규칙을 작성 미리보기에도 그대로 적용.
  // BE contribution-backgrounds의 hexCode/name은 로컬 LETTER_COLORS와 체계가 달라(파스텔 vs 비비드,
  // 다른 색상명) colorIdToBackgroundId 매칭이 실패할 수 있다 — 그때도 배경/로고/from색이 고정 핑크로
  // 굳어버리지 않도록 letterColor에 이미 있는 피그마 고정 순서 backgroundId로 폴백한다.
  const previewBackgroundId = colorIdToBackgroundId(colorId, backgrounds) ?? letterColor.backgroundId
  const invitationThemeColor = getInviteThemeColor(previewBackgroundId)
  const invitationWhiteLogo = isWhiteInviteTheme(previewBackgroundId)

  const changeCharacter = (delta: number) => {
    const count = characters.length
    if (count === 0) return
    setCharacterIndex((prev) => (prev + delta + count) % count)
  }

  const handleExit = () => setShowExitModal(true)

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const backgroundId = previewBackgroundId
      const characterId = currentCharacter?.id ?? characters[0]?.id ?? 1

      let fundingReviewId: number
      // 후기 본문(title/content/이미지)은 1단계(ReviewContentWritePage)에서 받은 값을 그대로 전송한다.
      // 초대장 문구 입력은 이 화면에서 제거됐고 히어로 문구는 유형별 고정값을 쓰므로 invitationTitle/invitationContent는 빈 값으로 전달한다
      if (config.key === 'gift') {
        const result = await createReviewMutation.mutateAsync({
          content: bodyContent,
          backgroundId,
          images: bodyImages,
          invitationTitle: '',
          invitationContent: '',
          invitationCharacterId: characterId,
          invitationBackgroundId: backgroundId,
        })
        fundingReviewId = result.fundingReviewId
      } else {
        const payload = {
          title: bodyTitle,
          content: bodyContent,
          images: bodyImages,
          invitationTitle: '',
          invitationContent: '',
          invitationCharacterId: characterId,
          invitationBackgroundId: backgroundId,
        }
        const mutation = config.key === 'news' ? createNewsMutation : createHeartfeltMutation
        const result = await mutation.mutateAsync(payload)
        fundingReviewId = result.fundingReviewId
      }

      const previewData: ReviewPreviewData = {
        authorName: config.showFrom ? profile?.nickname ?? '' : null,
        title: bodyTitle,
        content: bodyContent,
        colorId,
        images: bodyImages,
        fundingReviewId,
      }
      navigate(config.completePath, { state: previewData })
    } catch (error) {
      setToastMessage(getReviewSubmitErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
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
          className="relative block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left"
        >
          <InvitationCardFrame
            characterImageUrl={characterImage}
            characterId={currentCharacter?.id ?? null}
            logoColor={invitationThemeColor}
            whiteLogo={invitationWhiteLogo}
            heroTitle={config.heroHeading}
            title={displayTitle}
            content={displayContent}
            isTitlePlaceholder={!bodyTitle}
            isContentPlaceholder={!bodyContent}
            fromName={config.showFrom ? profile?.nickname ?? '' : null}
            accentColor={invitationThemeColor}
          />
          <span
            className="absolute bottom-3 right-3 z-20 flex items-center justify-center rounded-[14px] bg-[#EAE9EA]"
            style={{ width: 28, height: 28, padding: '7.78px', boxShadow: '0 10px 125px 0 rgba(0,0,0,0.04)' }}
          >
            <ZoomOutIcon width={13} height={13} className="text-gray-700" />
          </span>
        </button>

        <div className="flex items-center gap-2">
          {REVIEW_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3.5 py-2 text-b2-m ${
                tab === t.key ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

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
                  alt={`캐릭터 No.${String(safeCharacterIndex + 1).padStart(2, '0')}`}
                  className="h-24 w-24 object-contain"
                />
                <span className="rounded bg-pink-500 px-2 py-0.5 text-caption1-r font-medium text-white">
                  No.{String(safeCharacterIndex + 1).padStart(2, '0')}
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
          <div className="mx-auto flex h-full w-full max-w-[402px] flex-col items-center justify-center px-[18px] pb-[34px] pt-16">
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              <InvitationCardFrame
                className="w-full"
                characterImageUrl={characterImage}
                characterId={currentCharacter?.id ?? null}
                logoColor={invitationThemeColor}
                whiteLogo={invitationWhiteLogo}
                heroTitle={config.heroHeading}
                title={displayTitle}
                content={displayContent}
                isTitlePlaceholder={!bodyTitle}
                isContentPlaceholder={!bodyContent}
                fromName={config.showFrom ? profile?.nickname ?? '' : null}
                accentColor={invitationThemeColor}
              />
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

      <Toast open={toastMessage !== null} message={toastMessage ?? ''} standalone />
    </div>
  )
}
