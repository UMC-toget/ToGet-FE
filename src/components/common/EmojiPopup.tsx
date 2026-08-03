import CheckIcon from '../icons/CheckIcon'
import alertIcon from '../../assets/icon-alert-pink.svg'

export interface EmojiPopupButton {
  label: string
  onClick: () => void
  /** 'primary' = 검정 배경(강조) / 'secondary' = 회색 배경 */
  variant?: 'primary' | 'secondary'
}

interface EmojiPopupProps {
  open: boolean
  /** 'alert' = 핑크 느낌표(확인·경고) / 'success' = 핑크 체크(완료) */
  icon?: 'alert' | 'success'
  title: string
  /** \n으로 줄바꿈 가능 */
  description?: string
  /** 제목 스타일 override (예: 한 줄 고정이 필요할 때 'whitespace-nowrap text-b1-m font-semibold') */
  titleClassName?: string
  /** 버튼 1~2개. 배열 순서대로 좌→우 배치. 1개면 전체 너비, 2개면 각 130px */
  buttons: EmojiPopupButton[]
  /** 배경(딤) 탭 시 실행. 안전한 닫기 동작을 넣어두면 실수 방지. 미지정 시 딤 탭 무반응 */
  onDimClick?: () => void
}

/**
 * 이모티콘 있는 팝업 (피그마 '이모티콘 있는 팝업').
 * 핑크 원형 아이콘(느낌표 or 체크) + 제목 + 설명 + 버튼 1~2개.
 * 버튼 순서·색은 피그마 기준 그대로 배열로 전달하고, 배경 탭은 onDimClick으로 안전하게 제어합니다.
 *
 * @example
 * // 확인 팝업 (버튼 2개, 배경 탭 = 닫기)
 * <EmojiPopup open={open} title="입금을 완료하셨나요?" description="완료하기 버튼을 누르면, 변경이 불가해요."
 *   buttons={[
 *     { label: '완료하기', onClick: handleDone, variant: 'secondary' },
 *     { label: '변경하기', onClick: close, variant: 'primary' },
 *   ]}
 *   onDimClick={close} />
 *
 * // 완료 팝업 (체크 아이콘, 버튼 1개)
 * <EmojiPopup open={open} icon="success" title="입금 완료되었습니다"
 *   buttons={[{ label: '홈으로 돌아가기', onClick: goHome, variant: 'primary' }]} />
 */
export default function EmojiPopup({
  open,
  icon = 'alert',
  title,
  description,
  titleClassName = 'text-h3-sb',
  buttons,
  onDimClick,
}: EmojiPopupProps) {
  if (!open) return null

  const single = buttons.length === 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-[18px]">
      <button type="button" aria-label="닫기" onClick={onDimClick} className="absolute inset-0 bg-black/50" />
      <div className="relative flex w-[320px] flex-col items-center gap-5 rounded-[20px] bg-white px-6 py-7">
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col items-center gap-5">
            {icon === 'success' ? (
              <span className="flex size-12 items-center justify-center rounded-full bg-pink-500 text-white">
                <CheckIcon className="size-7" />
              </span>
            ) : (
              <img src={alertIcon} alt="" aria-hidden className="size-12" />
            )}
            <p className={`${titleClassName} text-black`}>{title}</p>
          </div>
          {description && (
            <p className="whitespace-pre-line text-center text-b2-r leading-normal text-gray-600">{description}</p>
          )}
        </div>
        <div className={`flex items-center gap-3 ${single ? 'w-full' : ''}`}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.onClick}
              className={`flex h-[42px] items-center justify-center rounded-lg text-sm font-semibold ${
                single ? 'w-full' : 'w-[130px]'
              } ${btn.variant === 'secondary' ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
