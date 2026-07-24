import { Check } from 'lucide-react';

const STEPS = ['기본 정보', '받고 싶은 선물', '공개 범위', '계좌 정보', '초대장 만들기'];
const STEP_COUNT = STEPS.length;

interface StepIndicatorProps {
  currentStep: number; // 1-indexed
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="relative flex items-start px-1 mb-6">
      {/* 점선 커넥터 - 각 원의 중심을 가로지르도록 절대 위치로 배치 */}
      <div className="absolute top-3.5 left-0 right-0 flex items-center px-1" aria-hidden>
        {STEPS.slice(0, -1).map((_, idx) => {
          const isDone = idx + 1 < currentStep;
          return (
            <div
              key={idx}
              className={`flex-1 border-t border-dashed ${isDone ? 'border-gray-800' : 'border-gray-200'}`}
              style={{
                marginLeft: `${(100 / STEP_COUNT) / 2}%`,
                marginRight: `${(100 / STEP_COUNT) / 2}%`,
              }}
            />
          );
        })}
      </div>

      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="relative z-10 flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${isDone ? 'bg-gray-800 text-white' : isActive ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-400'}`}
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
