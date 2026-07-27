import { requestPresignedUrl } from '../api/images'

/**
 * prefix 디렉토리에 file을 업로드하고, 저장에 사용할 최종 imageUrl을 반환합니다.
 * S3는 인증 헤더가 필요 없고 오히려 있으면 서명 검증이 깨지므로(403 SignatureDoesNotMatch)
 * apiClient가 아닌 순수 fetch로 PUT합니다.
 */
export async function uploadImage(prefix: string, file: File): Promise<string> {
  const { presignedUrl, imageUrl } = await requestPresignedUrl({
    prefix,
    fileName: file.name,
    contentType: file.type,
  })

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!response.ok) {
    throw new Error(`S3 이미지 업로드에 실패했어요. (status: ${response.status})`)
  }

  return imageUrl
}
