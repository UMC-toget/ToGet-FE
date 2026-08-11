import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import AccountFormFields from '../common/AccountFormFields';
import AccountCard from '../common/AccountCard';
import AccountConfirmModal from '../common/AccountConfirmModal';
import { useTogetherCreateStore } from '../../store/togetherCreateStore';
import type { SavedAccount } from '../../store/fundingCreateStore';
import { BANK_NAME_LABELS } from '../../api/userAccounts';
import type { BankName } from '../../api/userAccounts';
import { useUserAccounts } from '../../hooks/useUserAccounts';

interface Props {
  onNext: () => void;
  initialSelectedAccountId?: string | number | null;
}

type View = 'list' | 'add' | 'edit';

interface AccountFormState {
  bankCode: BankName | '';
  accountNumber: string;
  accountHolder: string;
}

const emptyForm: AccountFormState = { bankCode: '', accountNumber: '', accountHolder: '' };

// 예전 로컬 은행 목록과 라벨이 다른 일부 표기(레거시로 저장된 계좌) 보정용
const BANK_NAME_ALIASES: Partial<Record<string, BankName>> = {
  국민은행: 'KB',
  우체국예금: 'POST_OFFICE',
  대구은행: 'IM_BANK',
};

function resolveBankCode(displayName: string): BankName | undefined {
  return BANK_NAME_ALIASES[displayName] ??
    (Object.entries(BANK_NAME_LABELS) as Array<[BankName, string]>).find(
      ([, label]) => label === displayName,
    )?.[0];
}

export default function TogetherStep2Account({ onNext, initialSelectedAccountId }: Props) {
  const { accounts, selectedAccountId, addAccount, hydrateAccounts, updateAccount, selectAccount } = useTogetherCreateStore();
  const { data: registeredAccounts, isLoading: isAccountsLoading } = useUserAccounts();

  const [view, setView] = useState<View>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!registeredAccounts) return;
    hydrateAccounts(registeredAccounts.map((account) => ({
      id: String(account.userAccountId),
      bankName: BANK_NAME_LABELS[account.bankName],
      accountNumber: account.account,
      accountHolder: account.accountOwner,
    })));
  }, [hydrateAccounts, registeredAccounts]);

  useEffect(() => {
    if (!registeredAccounts || initialSelectedAccountId == null) return;
    const accountId = String(initialSelectedAccountId);
    const accountExists = registeredAccounts.some(
      (account) => String(account.userAccountId) === accountId,
    );
    if (accountExists) selectAccount(accountId);
  }, [initialSelectedAccountId, registeredAccounts, selectAccount]);

  const isFormValid = Boolean(form.bankCode && form.accountNumber.trim() && form.accountHolder.trim());

  const openAdd = () => {
    setForm(emptyForm);
    setView('add');
  };

  const openEdit = (acc: SavedAccount) => {
    setForm({
      bankCode: resolveBankCode(acc.bankName) ?? '',
      accountNumber: acc.accountNumber,
      accountHolder: acc.accountHolder,
    });
    setEditingId(acc.id);
    setView('edit');
  };

  const handleSubmitAdd = () => {
    if (!isFormValid) return;
    setShowConfirm(true);
  };

  const confirmAdd = () => {
    if (form.bankCode === '') return;
    addAccount({ bankName: BANK_NAME_LABELS[form.bankCode], accountNumber: form.accountNumber, accountHolder: form.accountHolder });
    setShowConfirm(false);
    setView('list');
  };

  const handleSubmitEdit = () => {
    if (!editingId || form.bankCode === '') return;
    updateAccount(editingId, { bankName: BANK_NAME_LABELS[form.bankCode], accountNumber: form.accountNumber, accountHolder: form.accountHolder });
    setView('list');
    setEditingId(null);
  };

  // ── 계좌 목록 화면 ──────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="space-y-5 pb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">입금받을 계좌를 등록해 주세요</h2>
              <p className="text-xs text-gray-400 mt-1">참여자에게 해당 계좌번호가 안내돼요</p>
            </div>

            <button
              onClick={openAdd}
              className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg text-gray-500 shrink-0">
                +
              </span>
              <span className="flex-1 text-left">새로운 계좌 등록하기</span>
              <ChevronRight size={16} className="text-gray-400 shrink-0" />
            </button>
            {isAccountsLoading && (
              <p className="text-center text-xs text-gray-400">등록된 계좌를 불러오는 중이에요</p>
            )}
          </div>

          {accounts.length > 0 && (
            <div className="flex-1 -mx-[18px] px-[18px] pt-5 pb-6 bg-gray-100">
              <div className="px-3">
                <p className="text-sm font-medium text-black mb-3">등록된 {accounts.length}개 계좌</p>
                <div className="space-y-2">
                  {accounts.map((acc) => {
                    const selected = acc.id === selectedAccountId;
                    const bankCode = resolveBankCode(acc.bankName);
                    if (!bankCode) return null;
                    return (
                      <div key={acc.id} role="button" tabIndex={0} onClick={() => selectAccount(acc.id)} className="cursor-pointer">
                        <AccountCard bankCode={bankCode} accountOwner={acc.accountHolder} account={acc.accountNumber} selected={selected} selectable>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(acc);
                            }}
                            className="w-full py-2 text-xs font-medium text-black bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                          >
                            <Pencil size={16} /> 계좌 수정하기
                          </button>
                        </AccountCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!selectedAccountId}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    );
  }

  // ── 계좌 등록 / 수정 화면 ────────────────────────────────────
  const isEdit = view === 'edit';

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setView('list')} className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-gray-900">{isEdit ? '계좌 수정하기' : '새로운 계좌 등록하기'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <p className="text-xs text-gray-400">
          선물 준비에 사용할 계좌를 {isEdit ? '수정해' : '등록해'} 주세요<br />
          친구들이 선물에 함께할 때 이 계좌 정보를 확인할 수 있어요
        </p>

        {/* AccountFormFields는 자체 px-[18px] 좌우 여백을 가진 채 페이지 최상단에서 쓰이도록 설계되어,
            부모(px-[18px])의 여백과 겹치지 않도록 -mx-[18px]로 상쇄합니다. */}
        <div className="-mx-[18px]">
          <AccountFormFields
            showIntro={false}
            accountHolder={form.accountHolder}
            onAccountHolderChange={(value) => setForm({ ...form, accountHolder: value })}
            accountNumber={form.accountNumber}
            onAccountNumberChange={(value) => setForm({ ...form, accountNumber: value })}
            bankCode={form.bankCode}
            onBankCodeChange={(bank) => setForm({ ...form, bankCode: bank })}
          />
        </div>
      </div>

      <button
        onClick={isEdit ? handleSubmitEdit : handleSubmitAdd}
        disabled={!isEdit && !isFormValid}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isEdit ? '수정 완료' : '등록 완료'}
      </button>

      {/* 계좌 확인 모달 (등록 시에만) — 돈이 오가는 단계라 한 번 더 확인시킴 */}
      <AccountConfirmModal open={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={confirmAdd} />
    </div>
  );
}
