import axios from 'axios'
import { apiClient, unwrap } from '../lib/apiClient'

export interface PresignedUrlResult {
  /** S3에 파일을 직접 PUT 업로드할 때 사용하는 서명된 URL */
  presignedUrl: string
  /** 업로드 완료 후 실제로 접근 가능한 최종 이미지 URL */
  imageUrl: string
}

export function getPresignedUrl(payload: { prefix?: string; fileName: string; contentType: string }) {
  return unwrap<PresignedUrlResult>(apiClient.post('/api/v1/images/presigned-url', payload))
}

/**
 * presignedUrl로 S3에 파일을 직접 업로드합니다. Content-Type은 presigned URL 발급 시
 * 전달한 값과 정확히 일치해야 하며(다르면 S3가 403 SignatureDoesNotMatch를 반환), S3는
 * 인증 헤더가 필요 없으므로(오히려 있으면 서명 검증이 깨짐) apiClient가 아닌 순수 axios를 사용합니다.
 */
export async function uploadToPresignedUrl(presignedUrl: string, file: File | Blob, contentType: string) {
  await axios.put(presignedUrl, file, { headers: { 'Content-Type': contentType } })
}

/** prefix 디렉토리에 file을 업로드하고, 저장에 사용할 최종 imageUrl을 반환합니다 */
export async function uploadImage(prefix: string, file: File): Promise<string> {
  const { presignedUrl, imageUrl } = await getPresignedUrl({
    prefix,
    fileName: file.name,
    contentType: file.type,
  })
  await uploadToPresignedUrl(presignedUrl, file, file.type)
  return imageUrl
}
