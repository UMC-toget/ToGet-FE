import { Check } from 'lucide-react';

const DEFAULT_STEPS = ['기본 정보', '받고 싶은 선물', '공개 범위', '계좌 정보', '초대장 만들기'];

interface StepIndicatorProps {
  currentStep: number; // 1-indexed
  /** 단계 라벨 목록. 기본값은 내 선물 페이지 만들기(5단계) 플로우 */
  steps?: string[];
}

export default function StepIndicator({ currentStep, steps = DEFAULT_STEPS }: StepIndicatorProps) {
  const stepCount = steps.length;

  return (
    <div className="relative flex items-start px-1 mb-6">
      {/* 점선 커넥터 - 원의 중심(= (idx + 0.5) / stepCount 지점)끼리를 잇되,
          원 반지름(14px)만큼은 양쪽에서 빼서 원과 겹치지 않게 함 */}
      <div className="absolute top-3.5 left-0 right-0 px-1" aria-hidden>
        {steps.slice(0, -1).map((_, idx) => {
          const isDone = idx + 1 < currentStep;
          const leftPct = ((idx + 0.5) / stepCount) * 100;
          const widthPct = (1 / stepCount) * 100;
          return (
            <div
              key={idx}
              className={`absolute border-t border-dashed ${isDone ? 'border-gray-800' : 'border-gray-200'}`}
              style={{
                left: `calc(${leftPct}% + 14px)`,
                width: `calc(${widthPct}% - 28px)`,
              }}
            />
          );
        })}
      </div>

      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="relative z-10 flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${isDone ? 'bg-gray-800 text-white' : isActive ? 'bg-gray-800 text-white' : 'bg-gray-200/70 text-gray-400'}`}
            >
              {isDone ? <Check size={14} /> : stepNum}
            </div>
            <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
