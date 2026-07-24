import CheckIcon from '../../components/icons/CheckIcon'

const STEP_LABELS = ['참여자 정보', '축하 메세지', '참여 금액 선택', '마음 전하기'] as const

interface ProcessBarProps {
  /** 현재 진행 중인 단계 (1~4) */
  currentStep: number
}

/** E03 참여 프로세스 바 (피그마 #1057:4870) */
export default function ProcessBar({ currentStep }: ProcessBarProps) {
  return (
    <div className="flex items-start">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1
        const isDone = step < currentStep
        const isActive = step === currentStep
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              {/* 단계 사이 연결선은 각 원의 좌우 반선 2개로 나눠서 그림 */}
              <div
                className={`h-[1.5px] flex-1 ${
                  index === 0 ? 'bg-transparent' : step <= currentStep ? 'bg-gray-900' : 'bg-gray-100'
                }`}
              />
              <div
                className={`flex size-[30px] items-center justify-center rounded-full ${
                  isDone || isActive ? 'bg-gray-900' : 'bg-gray-100'
                }`}
              >
                {isDone ? (
                  <CheckIcon className="size-6 text-white" />
                ) : (
                  <span className={`text-caption1-m font-bold ${isActive ? 'text-white' : 'text-[#978F96]'}`}>
                    {step}
                  </span>
                )}
              </div>
              <div
                className={`h-[1.5px] flex-1 ${
                  index === STEP_LABELS.length - 1
                    ? 'bg-transparent'
                    : step < currentStep
                      ? 'bg-gray-900'
                      : 'bg-gray-100'
                }`}
              />
            </div>
            <span
              className={`whitespace-nowrap text-caption2-m leading-normal ${isDone || isActive ? 'text-black' : 'text-gray-300'}`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
