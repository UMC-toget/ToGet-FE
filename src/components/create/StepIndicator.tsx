import { Check } from 'lucide-react';

const STEPS = ['기본 정보', '받고 싶은 선물', '공개 범위', '계좌 정보', '초대장 만들기'];

interface StepIndicatorProps {
  currentStep: number; // 1-indexed
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-1 mb-6">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
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
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 mx-1 mb-4 border-t border-dashed ${isDone ? 'border-gray-800' : 'border-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}