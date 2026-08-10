import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import InvitationHero from './InvitationHero'
import { getInvitationCard } from '../../api/fundings'
import { fetchCharacters } from '../../api/metaApi'
import { CHARACTER_SVGS } from './characterAssets'
import { getInviteThemeColor } from './inviteTheme'

/** 화이트 배경 테마 id — 로고를 흰 fill + 회색 외곽선 전용 SVG로 렌더 */
const WHITE_THEME_BACKGROUND_ID = 8

const DEFAULT_INVITATION = {
  title: '따뜻한 선물 초대장이 도착했어요',
  content: '',
  creatorName: null as string | null,
}

/**
 * E01) 내 선물 참여: 초대장 팝업
 * 카톡 링크로 진입 시 처음 보이는 초대장 페이지.
 * 레이아웃 수치는 피그마 E01 프레임(402×874) 실측값 기준.
 */
export default function InvitationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [invitation, setInvitation] = useState(DEFAULT_INVITATION)
  // 로고·글로우 모두 테마 색(피그마 빨주노초파남보검정) 사용. 글로우는 이 색 50%.
  // 화이트 테마(id8)는 테마 색이 회색(#C1BCC0)이라 글로우도 회색으로 뜬다.
  const [themeColor, setThemeColor] = useState<string>('#FE71A5')
  const [whiteLogo, setWhiteLogo] = useState(false)
  const [characterId, setCharacterId] = useState<number | null>(null)
  const [characterImageUrl, setCharacterImageUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        const [card, characters] = await Promise.all([
          getInvitationCard(id),
          fetchCharacters().catch(() => []),
        ])

        setInvitation({
          title: card.title,
          content: card.content,
          creatorName: card.creatorName,
        })

        // 로고·글로우 테마 색, 화이트 테마(id8)는 전용 로고
        setThemeColor(getInviteThemeColor(card.backgroundId))
        setWhiteLogo(card.backgroundId === WHITE_THEME_BACKGROUND_ID)

        setCharacterId(card.characterId ?? null)

        // 로컬 SVG가 있으면 우선 사용(선명), 없으면 BE PNG로 폴백
        const localSvg = card.characterId != null ? CHARACTER_SVGS[card.characterId] : undefined
        if (localSvg) {
          setCharacterImageUrl(localSvg)
        } else {
          const character = characters.find((c) => c.id === card.characterId)
          if (character) setCharacterImageUrl(character.imageUrl)
        }
      } catch {
        // API 실패 시 기본값 유지
      }
    }

    load()
  }, [id])

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white">
      {/* 글로우 배경 — 중심에 테마 색 50% → 가장자리 투명 원형 그라데이션. 색은 backgroundId별 테마 색.
          컬러 테마는 피그마 스펙(286, blur100)으로 은은한 색 wash.
          화이트 테마(id8)는 어두운 #1E1D1E라 blur100이면 배경이 더럽게 차서, blur를 줄이고 원을 키워
          또렷한 원형 글로우로. (그라데이션이 falloff를 담당, blur는 경계만 살짝 부드럽게) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full"
        style={
          whiteLogo
            ? {
                top: 200,
                width: 440,
                height: 440,
                background: 'radial-gradient(circle, rgba(30,29,30,0.30) 0%, transparent 60%)',
                filter: 'blur(14px)',
              }
            : {
                top: 292,
                width: 286,
                height: 286,
                background: `radial-gradient(circle, ${themeColor}80 0%, transparent 100%)`,
                filter: 'blur(100px)',
              }
        }
      />

      <InvitationHero
        characterImageUrl={characterImageUrl}
        characterId={characterId}
        logoColor={themeColor}
        whiteLogo={whiteLogo}
      />

      <div className="relative flex flex-1 flex-col items-center gap-5 px-[18px]">
        {/* 초대장 카드 (피그마: w366, padding 20, radius 20, shadow 0 4px 20px 15%) */}
        <article className="flex w-full flex-col items-start gap-2.5 rounded-[20px] bg-white p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)]">
          <h2 className="text-h3-sb text-black">{invitation.title}</h2>
          {invitation.content && (
            <p className="whitespace-pre-line text-b2-r leading-relaxed text-gray-700">
              {invitation.content}
            </p>
          )}
          {invitation.creatorName && (
            <p className="self-end text-b2-m text-pink-500">from. {invitation.creatorName}</p>
          )}
        </article>

        <div className="flex w-full flex-col items-center gap-3">
          <Button onClick={() => navigate(`/funding/${id}`)}>축하하러 가기</Button>
          <p className="text-caption1-r text-gray-500">
            축하 메세지를 남기거나, 선물에 마음을 보탤 수 있어요
          </p>
        </div>

        {/* /gift/about = C02 서비스 소개 경로 */}
        <button
          type="button"
          onClick={() => navigate('/gift/about')}
          className="mt-auto pb-[43px] pt-6 text-caption1-r text-gray-700"
        >
          투겟이 처음이신가요?
          <span className="ml-2 text-caption1-m">이용 방법 보러가기 {'>'}</span>
        </button>
      </div>
    </div>
  )
}
