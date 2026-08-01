import CheckIcon from '../icons/CheckIcon'

interface ProcessBarProps {
  /** 단계 라벨 목록 */
  steps: readonly string[]
  /** 현재 진행 중인 단계 (1-based) */
  currentStep: number
}

export default function ProcessBar({ steps, currentStep }: ProcessBarProps) {
  return (
    <div className="flex items-start">
      {steps.map((label, index) => {
        const step = index + 1
        const isDone = step < currentStep
        const isActive = step === currentStep
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
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
                  index === steps.length - 1
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
