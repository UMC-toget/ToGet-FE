import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useFundingCreateStore, isStepDirty } from '../../store/fundingCreateStore';
import Step1BasicInfo from '../../components/create/Step1BasicInfo';
import Step2Wishlist from '../../components/create/Step2Wishlist';
import Step3Visibility from '../../components/create/Step3Visibility';
import Step4Account from '../../components/create/Step4Account';
import Step5Invite from '../../components/create/Step5Invite';
import Toast from '../../components/common/Toast';
import {
  updateFundingAccount,
  updateFundingBasicInfo,
  updateFundingGifts,
  updateFundingInvitation,
  updateFundingVisibility,
} from '../../api/fundings';
import { BANK_NAME_LABELS, createUserAccount, getUserAccounts, type BankName } from '../../api/userAccounts';
import { uploadImage } from '../../utils/uploadImage';

const STEP_TITLES: Record<string, string> = {
  '1': '1단계 : 기본 정보',
  '2': '2단계 : 받고 싶은 선물',
  '3': '3단계 : 공개 범위',
  '4': '4단계 : 계좌 정보',
  '5': '5단계 : 초대장',
};

const BANK_NAME_ALIASES: Partial<Record<string, BankName>> = {
  국민은행: 'KB',
  우체국예금: 'POST_OFFICE',
  대구은행: 'IM_BANK',
};

function resolveBankCode(displayName: string): BankName | undefined {
  return BANK_NAME_ALIASES[displayName] ??
    (Object.entries(BANK_NAME_LABELS) as Array<[BankName, string]>).find(([, label]) => label === displayName)?.[0];
}

/**
 * D 섹션: 내 선물 페이지 수정하기 - 개별 단계 수정 폼 (/funding/:id/edit/:step)
 * 만들기 플로우의 Step1~5 컴포넌트를 그대로 재사용하되, "다음" 대신 "수정 저장"으로 라벨을 바꾸고
 * 원본과 달라진 게 없으면 저장 버튼을 비활성화합니다. 저장하면 선택 화면으로 돌아갑니다.
 */
export default function FundingEditStepPage() {
  const { id, step } = useParams();
  const navigate = useNavigate();
  const state = useFundingCreateStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const dirty = step ? isStepDirty(state, Number(step)) : false;

  const handleBack = () => navigate(`/funding/${id}/edit`);

  const handleDone = async () => {
    if (!id || !step || !dirty || isSaving) return;
    setIsSaving(true);
    setSaveError('');

    try {
      if (step === '1') {
        const thumbnailImageUrl = state.thumbnailImage instanceof File
          ? await uploadImage('fundings/thumbnails', state.thumbnailImage)
          : state.thumbnailImage;
        await updateFundingBasicInfo(id, {
          title: state.title,
          anniversaryDate: state.anniversaryDate,
          startDate: state.preparationStartDate,
          endDate: state.preparationEndDate,
          introduction: state.greeting,
          thumbnailImageUrl,
        });
        state.setStep1({ thumbnailImage: thumbnailImageUrl });
      }

      if (step === '2') {
        const gifts = await Promise.all(state.wishlist.map(async (gift) => ({
          fundingGiftId: /^\d+$/.test(gift.id) ? Number(gift.id) : null,
          giftName: gift.name,
          giftPrice: gift.price,
          giftPurchaseUrl: gift.link ?? null,
          giftImageUrl: gift.imageFile
            ? await uploadImage('fundings/gifts', gift.imageFile)
            : gift.imageUrl ?? null,
        })));
        await updateFundingGifts(id, gifts);
      }

      if (step === '3') {
        await updateFundingVisibility(id, {
          showProgress: state.showProgress,
          showParticipantCount: state.showParticipantCount,
          showParticipantNames: state.showParticipantNames,
          showMessages: state.showMessages,
          showAmount: state.showAmount,
        });
      }

      if (step === '4') {
        const selectedAccount = state.accounts.find((account) => account.id === state.selectedAccountId);
        if (!selectedAccount) throw new Error('사용할 계좌를 선택해 주세요.');
        const bankName = resolveBankCode(selectedAccount.bankName);
        if (!bankName) throw new Error('선택한 은행 정보를 확인해 주세요.');
        const normalizedAccount = selectedAccount.accountNumber.replace(/\D/g, '');
        const registeredAccounts = await getUserAccounts();
        const registeredAccount = registeredAccounts.find((account) =>
          account.bankName === bankName &&
          account.account === normalizedAccount &&
          account.accountOwner === selectedAccount.accountHolder,
        );
        const userAccountId = registeredAccount?.userAccountId ?? (await createUserAccount({
          bankName,
          accountOwner: selectedAccount.accountHolder,
          account: normalizedAccount,
        })).userAccountId;
        await updateFundingAccount(id, userAccountId);
      }

      if (step === '5') {
        if (!state.inviteBackgroundId) throw new Error('초대장 배경색을 선택해 주세요.');
        await updateFundingInvitation(id, {
          characterId: state.inviteCharacter,
          backgroundId: state.inviteBackgroundId,
          title: state.inviteTitle,
          content: state.inviteContent,
        });
      }

      navigate(`/funding/${id}/edit`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '수정 내용을 저장하지 못했어요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <button
          onClick={handleBack}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-sm font-semibold text-gray-700">{STEP_TITLES[step ?? ''] ?? '수정하기'}</h1>
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col overflow-hidden">
        {step === '1' && <Step1BasicInfo onNext={handleDone} submitLabel={isSaving ? '저장 중...' : '수정 저장'} disabled={!dirty || isSaving} />}
        {step === '2' && <Step2Wishlist onNext={handleDone} submitLabel={isSaving ? '저장 중...' : '수정 저장'} disabled={!dirty || isSaving} />}
        {step === '3' && <Step3Visibility onNext={handleDone} submitLabel={isSaving ? '저장 중...' : '수정 저장'} disabled={!dirty || isSaving} />}
        {step === '4' && <Step4Account onNext={handleDone} submitLabel={isSaving ? '저장 중...' : '수정 저장'} disabled={!dirty || isSaving} />}
        {step === '5' && <Step5Invite onNext={handleDone} submitLabel={isSaving ? '저장 중...' : '수정 저장'} disabled={!dirty || isSaving} />}
      </div>
      <Toast open={Boolean(saveError)} message={saveError} standalone />
    </div>
  );
}
