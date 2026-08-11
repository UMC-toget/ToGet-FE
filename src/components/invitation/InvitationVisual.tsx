import type { ReactNode } from 'react'
import InvitationHero from './InvitationHero'
import { useInvitationCard } from './useInvitationCard'
import { useCharacterImage } from './useCharacterImage'
import { getInviteThemeColor, isWhiteInviteTheme } from './inviteTheme'

interface Props {
  /** 펀딩 id. 이 id로 초대장 테마·캐릭터(BE SVG)를 알아서 조회한다 */
  fundingId?: string
  /**
   * 저장 전 미리보기용 캐릭터 id(1~6). `fundingId` 없이 이 값으로 렌더한다.
   * 캐릭터 SVG는 characters 목록에서 이 id로 매핑한다.
   */
  characterId?: number | null
  /**
   * 저장 전 미리보기용 배경 테마 id(1~8). `fundingId` 없이 이 값으로 로고·글로우 색을 정한다.
   */
  backgroundId?: number | null
  /**
   * 상단 제목 문구. 기본은 제목 없이 비주얼(글로우+로고+별/컨페티+캐릭터)만 렌더.
   * E01처럼 문구가 필요하면 넘긴다.
   */
  title?: ReactNode
}

/**
 * 초대장 상단 비주얼 드롭인 컴포넌트 (색상 글로우 + 로고 + 캐릭터 SVG + 별/컨페티).
 *
 * 두 가지 모드를 지원한다:
 * - **펀딩 조회 모드**: `fundingId`를 넘기면 초대장 테마·캐릭터를 BE에서 조회해 렌더.
 * - **미리보기 모드**: `fundingId` 없이 `characterId`/`backgroundId`(사용자가 탭에서 고른 로컬 값)를
 *   넘기면 저장 전에도 실시간으로 렌더. (J 작성 미리보기 등)
 *
 * @example
 * <InvitationVisual fundingId={fundingId} />                              // 저장 후
 * <InvitationVisual characterId={charId} backgroundId={bgId} />           // 저장 전 미리보기
 */
export default function InvitationVisual({
  fundingId,
  characterId,
  backgroundId,
  title = null,
}: Props) {
  // fundingId가 있으면 서버 조회 모드, 없으면 로컬 값(저장 전 미리보기) 모드
  const isPreview = fundingId == null

  const fetched = useInvitationCard(fundingId)
  const previewImage = useCharacterImage(characterId, isPreview)

  const hero = isPreview
    ? {
        characterImageUrl: previewImage,
        characterId: characterId ?? null,
        logoColor: getInviteThemeColor(backgroundId),
        whiteLogo: isWhiteInviteTheme(backgroundId),
      }
    : {
        characterImageUrl: fetched.characterImageUrl,
        characterId: fetched.characterId,
        logoColor: fetched.themeColor,
        whiteLogo: fetched.whiteLogo,
      }

  return (
    <InvitationHero
      characterImageUrl={hero.characterImageUrl}
      characterId={hero.characterId}
      logoColor={hero.logoColor}
      whiteLogo={hero.whiteLogo}
      title={title}
    />
  )
}
