import { apiClient, unwrap } from '../lib/apiClient'

export interface PresignedUrlResult {
  /** S3에 파일을 직접 PUT 업로드할 때 사용하는 서명된 URL */
  presignedUrl: string
  /** 업로드 완료 후 실제로 접근 가능한 최종 이미지 URL */
  imageUrl: string
}

export function requestPresignedUrl(payload: { prefix?: string; fileName: string; contentType: string }) {
  return unwrap<PresignedUrlResult>(apiClient.post('/api/v1/images/presigned-url', payload))
}
