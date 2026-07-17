import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import StepIndicator from '../components/create/StepIndicator';
import Step1BasicInfo from '../components/create/Step1BasicInfo';
import Step2Wishlist from '../components/create/Step2Wishlist';
import Step3Visibility from '../components/create/Step3Visibility';
import Step4Account from '../components/create/Step4Account';
import Step5Invite from '../components/create/Step5Invite';
import StepComplete from '../components/create/StepComplete';

const TOTAL_STEPS = 5;

export default function FundingCreatePage() {
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isComplete = step > TOTAL_STEPS;

  const handleBack = () => {
    if (step === 1) {
      setShowSaveModal(true);
    } else {
      setStep((s) => s - 1);
    }
  };

  // "나가기"는 어느 단계에서든 항상 노출되는 버튼 (뒤로가기와 별개)
  const handleExit = () => setShowSaveModal(true);

  const handleNext = () => setStep((s) => s + 1);

  const handleGoHome = () => {
    // 실제 프로젝트에서는 navigate('/') 사용
    setStep(1);
  };

  const handleViewFunding = () => {
    // 실제 프로젝트에서는 navigate('/funding/:id') 사용
    alert('선물 페이지로 이동합니다.');
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col" style={{ minHeight: '80vh' }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          {!isComplete ? (
            <button
              onClick={handleBack}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="뒤로가기"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <span className="w-6" />
          )}

          <h1 className="text-sm font-semibold text-gray-700">내 선물 페이지 만들기</h1>

          {!isComplete ? (
            <button
              onClick={handleExit}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              나가기
            </button>
          ) : (
            <span className="w-8" />
          )}
        </div>

        {/* 스텝 인디케이터 */}
        {!isComplete && (
          <div className="px-4 pb-2">
            <StepIndicator currentStep={step} />
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="flex-1 px-4 pb-6 flex flex-col overflow-hidden">
          {step === 1 && <Step1BasicInfo onNext={handleNext} />}
          {step === 2 && <Step2Wishlist onNext={handleNext} />}
          {step === 3 && <Step3Visibility onNext={handleNext} />}
          {step === 4 && <Step4Account onNext={handleNext} />}
          {step === 5 && <Step5Invite onNext={handleNext} />}
          {isComplete && <StepComplete onViewFunding={handleViewFunding} onGoHome={handleGoHome} />}
        </div>

        {/* 임시저장 모달 - 페이지 레벨로 옮겨서 어느 단계에서든 "나가기"로 띄울 수 있음 */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                작성 중인 선물 페이지를<br />임시 저장할까요?
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                지금 나가면 현재까지 입력한 내용이 저장되고,<br />다음에 다시 이어서 작성할 수 있어요
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
                >
                  계속 작성하기
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    handleGoHome();
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium"
                >
                  저장하고 나가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}