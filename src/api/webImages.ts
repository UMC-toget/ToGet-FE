export interface WebImageResult {
  imageUrl: string
  thumbnailUrl: string
  /** 이 이미지가 있는 원본 사이트 URL ("사이트 방문하기") */
  sourceUrl: string
}

export interface WebImageSearchResult {
  images: WebImageResult[]
  hasNext: boolean
}

// 결과 이미지 비율을 다양하게 섞어 매스너리(핀터레스트식) 레이아웃처럼 보이게 합니다.
const MOCK_ASPECTS: [number, number][] = [
  [400, 400],
  [400, 520],
  [400, 300],
  [400, 620],
  [400, 480],
  [400, 350],
  [400, 560],
  [400, 420],
  [400, 300],
  [400, 500],
  [400, 440],
  [400, 600],
]

/**
 * 웹 사진 검색 (검색어 기준 구글 이미지 검색 결과).
 *
 * TODO: 백엔드 프록시 API(GET /api/v1/images/search) 연동 전까지 목업 데이터를 반환합니다.
 * 백엔드 준비되면 이 함수 내부만 실제 axios 호출로 교체하면 되고, 반환 타입(WebImageSearchResult)은
 * 백엔드 응답 스펙과 동일하게 맞춰뒀습니다.
 */
export async function searchWebImages(query: string, page = 0): Promise<WebImageSearchResult> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const images: WebImageResult[] = MOCK_ASPECTS.map(([width, height], index) => {
    const seed = `${query}-${page}-${index}`
    const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
    return { imageUrl: url, thumbnailUrl: url, sourceUrl: `https://picsum.photos/seed/${encodeURIComponent(seed)}` }
  })

  return { images, hasNext: page < 2 }
}
