import type { ReactNode } from 'react'
import InvitationHero from './InvitationHero'
import { useInvitationCard } from './useInvitationCard'

interface Props {
  /** 펀딩 id. 이 id로 초대장 테마·캐릭터(BE SVG)를 알아서 조회한다 */
  fundingId?: string
  /**
   * 상단 제목 문구. 기본은 제목 없이 비주얼(글로우+로고+별/컨페티+캐릭터)만 렌더.
   * E01처럼 문구가 필요하면 넘긴다.
   */
  title?: ReactNode
}

/**
 * 초대장 상단 비주얼 드롭인 컴포넌트.
 * `fundingId`만 넘기면 초대장 테마 색(글로우·로고)과 캐릭터 SVG(1~6, BE 제공)를 조회해
 * 색상 글로우 + 로고 + 별/컨페티 + 캐릭터를 E01과 동일한 위치·크기로 렌더한다.
 *
 * J 페이지 등 다른 섹션에서 조회 로직 없이 그대로 재사용하기 위한 컴포넌트.
 *
 * @example
 * <InvitationVisual fundingId={fundingId} />
 */
export default function InvitationVisual({ fundingId, title = null }: Props) {
  const { themeColor, whiteLogo, characterId, characterImageUrl } = useInvitationCard(fundingId)

  return (
    <InvitationHero
      characterImageUrl={characterImageUrl}
      characterId={characterId}
      logoColor={themeColor}
      whiteLogo={whiteLogo}
      title={title}
    />
  )
}
