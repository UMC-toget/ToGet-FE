import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import ConfirmModal from '../../components/common/ConfirmModal'
import StepIndicator from '../../components/create/StepIndicator'
import TogetherStep1BasicInfo from '../../components/create/TogetherStep1BasicInfo'
import TogetherStep2Account from '../../components/create/TogetherStep2Account'
import TogetherStep3Invite from '../../components/create/TogetherStep3Invite'
import TogetherStepComplete from '../../components/create/TogetherStepComplete'

const STEPS = ['기본 정보', '계좌 정보', '초대장 만들기']
const TOTAL_STEPS = STEPS.length

/** 함께 선물 페이지 만들기 플로우 (G02) */
export default function GiftCreateTogetherPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showExitModal, setShowExitModal] = useState(false)
  const isComplete = step > TOTAL_STEPS

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
    else setShowExitModal(true)
  }

  const handleNext = () => setStep((s) => s + 1)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      {!isComplete && (
        <>
          <Header
            title="함께 선물 페이지 만들기"
            onBack={handleBack}
            right={
              <button type="button" onClick={() => setShowExitModal(true)} className="text-b2-m text-black">
                나가기
              </button>
            }
          />

          <div className="px-[18px] pt-5 pb-2">
            <StepIndicator currentStep={step} steps={STEPS} />
          </div>
        </>
      )}

      <div className="flex-1 px-[18px] pb-6 flex flex-col overflow-hidden">
        {step === 1 && <TogetherStep1BasicInfo onNext={handleNext} />}
        {step === 2 && <TogetherStep2Account onNext={handleNext} />}
        {step === 3 && <TogetherStep3Invite onNext={handleNext} />}
        {isComplete && <TogetherStepComplete />}
      </div>

      <ConfirmModal
        open={showExitModal}
        title="작성 중인 선물 페이지를 저장할까요?"
        description={'지금 나가면 현재까지 입력한 내용이 저장되고,\n다음에 다시 이어서 작성할 수 있어요'}
        cancelText="계속 작성하기"
        confirmText="저장하고 나가기"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => navigate('/home')}
      />
    </div>
  )
}
