import { useEffect, useState } from 'react'
import { getInvitationCard } from '../../api/fundings'
import { fetchCharacters } from '../../api/metaApi'
import { getInviteThemeColor, isWhiteInviteTheme } from './inviteTheme'

export interface InvitationCardData {
  /** 초대장 제목(카드 본문용) */
  title: string
  /** 초대장 내용(카드 본문용) */
  content: string
  /** 개설자 이름 */
  creatorName: string | null
  /** 로고·글로우 테마 색(피그마 채도 팔레트) */
  themeColor: string
  /** 화이트 배경 테마(id8) 여부 */
  whiteLogo: boolean
  /** 캐릭터 id — 위치·크기 보정에 사용 */
  characterId: number | null
  /** BE characters API가 내려주는 캐릭터 SVG URL */
  characterImageUrl?: string
}

const DEFAULT: InvitationCardData = {
  title: '따뜻한 선물 초대장이 도착했어요',
  content: '',
  creatorName: null,
  themeColor: '#FE71A5',
  whiteLogo: false,
  characterId: null,
  characterImageUrl: undefined,
}

/**
 * 펀딩 id로 초대장 카드 데이터(제목/내용/테마색/캐릭터 SVG)를 조회하는 훅.
 * E01 초대장 페이지와 초대장 비주얼 공용 컴포넌트(InvitationVisual)가 함께 쓴다.
 * API 실패 시 기본값을 유지한다.
 */
export function useInvitationCard(fundingId?: string): InvitationCardData {
  const [data, setData] = useState<InvitationCardData>(DEFAULT)

  useEffect(() => {
    if (!fundingId) return

    const load = async () => {
      try {
        const [card, characters] = await Promise.all([
          getInvitationCard(fundingId),
          fetchCharacters().catch(() => []),
        ])

        // BE characters API가 SVG로 내려주므로 그대로 사용(위치·크기는 characterId 기반 보정 유지).
        const character = characters.find((c) => c.id === card.characterId)

        setData({
          title: card.title,
          content: card.content,
          creatorName: card.creatorName,
          themeColor: getInviteThemeColor(card.backgroundId),
          whiteLogo: isWhiteInviteTheme(card.backgroundId),
          characterId: card.characterId ?? null,
          characterImageUrl: character?.imageUrl,
        })
      } catch {
        // API 실패 시 기본값 유지
      }
    }

    load()
  }, [fundingId])

  return data
}
