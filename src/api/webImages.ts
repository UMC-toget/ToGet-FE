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

/**
 * 웹 사진 검색 (검색어 기준 구글 이미지 검색 결과).
 */
export function searchWebImages(query: string, page = 0, size = 10) {
  return unwrap<WebImageSearchResult>(
    apiClient.get('/api/v1/images/search', { params: { query, page, size } }),
  )
}
import { apiClient, unwrap } from '../lib/apiClient'
