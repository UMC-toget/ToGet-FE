import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Pencil } from 'lucide-react';
import { useFundingCreateStore } from '../../store/fundingCreateStore';
import type { SavedAccount } from '../../store/fundingCreateStore';
import { searchBanks } from '../../utils/bankData';

interface Props {
  onNext: () => void;
}

type View = 'list' | 'add' | 'edit';

interface AccountFormState {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

const emptyForm: AccountFormState = { bankName: '', accountNumber: '', accountHolder: '' };

export default function Step4Account({ onNext }: Props) {
  const { accounts, selectedAccountId, addAccount, updateAccount, selectAccount } = useFundingCreateStore();

  const [view, setView] = useState<View>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [showBankSheet, setShowBankSheet] = useState(false);
  const [bankQuery, setBankQuery] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isFormValid = Boolean(form.bankName.trim() && form.accountNumber.trim() && form.accountHolder.trim());

  const openAdd = () => {
    setForm(emptyForm);
    setView('add');
  };

  const openEdit = (acc: SavedAccount) => {
    setForm({ bankName: acc.bankName, accountNumber: acc.accountNumber, accountHolder: acc.accountHolder });
    setEditingId(acc.id);
    setView('edit');
  };

  const handleSubmitAdd = () => {
    if (!isFormValid) return;
    setShowConfirm(true);
  };

  const confirmAdd = () => {
    addAccount(form);
    setShowConfirm(false);
    setView('list');
  };

  const handleSubmitEdit = () => {
    if (!editingId) return;
    updateAccount(editingId, form);
    setView('list');
    setEditingId(null);
  };

  const bankResults = searchBanks(bankQuery);

  // ── 계좌 목록 화면 ──────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">선물 준비에 사용할 계좌를 선택해 주세요</h2>
            <p className="text-xs text-gray-400 mt-1">친구들이 선물에 함께할 때 이 계좌 정보를 확인할 수 있어요</p>
          </div>

          <button
            onClick={openAdd}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">+</span> 새로운 계좌 등록하기
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          {accounts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">등록된 {accounts.length}개 계좌</p>
              {accounts.map((acc) => {
                const selected = acc.id === selectedAccountId;
                return (
                  <div
                    key={acc.id}
                    className={`border rounded-xl p-4 transition-colors ${selected ? 'border-gray-800 bg-gray-50' : 'border-gray-100'}`}
                  >
                    <button
                      onClick={() => selectAccount(acc.id)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                        🏦
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{acc.bankName}</p>
                        <p className="text-xs text-gray-500">{acc.accountHolder}</p>
                        <p className="text-xs text-gray-500">{acc.accountNumber}</p>
                      </div>
                      <span
                        aria-hidden
                        className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected ? 'border-pink-400 bg-pink-400' : 'border-gray-300'}`}
                      />
                    </button>
                    <button
                      onClick={() => openEdit(acc)}
                      className="w-full mt-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={12} /> 계좌 수정하기
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!selectedAccountId}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    );
  }

  // ── 계좌 등록 / 수정 화면 ────────────────────────────────────
  const isEdit = view === 'edit';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setView('list')} className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-gray-900">{isEdit ? '계좌 수정하기' : '새로운 계좌 등록하기'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <p className="text-xs text-gray-400 -mt-2">
          선물 준비에 사용할 계좌를 {isEdit ? '수정해' : '등록해'} 주세요<br />
          친구들이 선물에 함께할 때 이 계좌 정보를 확인할 수 있어요
        </p>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">은행명 *</label>
          <button
            onClick={() => setShowBankSheet(true)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm text-left focus:border-gray-800 transition-colors"
          >
            <span className={form.bankName ? 'text-gray-800' : 'text-gray-400'}>
              {form.bankName || '은행명을 정확히 선택해주세요'}
            </span>
            <Search size={16} className="text-gray-400" />
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">계좌번호 *</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="본인의 계좌번호를 정확히 입력해주세요"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-800 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">예금주 *</label>
          <input
            type="text"
            placeholder="예금주 이름을 정확히 입력해 주세요"
            value={form.accountHolder}
            onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-800 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={isEdit ? handleSubmitEdit : handleSubmitAdd}
        disabled={!isEdit && !isFormValid}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl mt-4 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isEdit ? '수정 완료' : '등록 완료'}
      </button>

      {/* 은행 검색 시트: 포함검색 + 초성검색("ㅅㅎ") + 영문 유사어 검색("shin") 지원 */}
      {showBankSheet && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-t-2xl p-4 max-h-[70vh] flex flex-col">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 mb-2">은행명</p>
            <div className="relative mb-3">
              <input
                autoFocus
                type="text"
                value={bankQuery}
                onChange={(e) => setBankQuery(e.target.value)}
                placeholder="은행명을 검색 후 선택해주세요"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-gray-800 transition-colors"
              />
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {bankResults.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">일치하는 은행이 없어요</p>
              )}
              {bankResults.map((bank) => {
                const idx = bankQuery ? bank.name.indexOf(bankQuery) : -1;
                return (
                  <button
                    key={bank.name}
                    onClick={() => {
                      setForm({ ...form, bankName: bank.name });
                      setShowBankSheet(false);
                      setBankQuery('');
                    }}
                    className="w-full flex items-center justify-between px-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{bank.emoji}</span>
                      <span>
                        {idx !== -1 ? (
                          <>
                            {bank.name.slice(0, idx)}
                            <span className="text-pink-400 font-semibold">
                              {bank.name.slice(idx, idx + bankQuery.length)}
                            </span>
                            {bank.name.slice(idx + bankQuery.length)}
                          </>
                        ) : (
                          bank.name
                        )}
                      </span>
                    </span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setShowBankSheet(false); setBankQuery(''); }}
              className="w-full mt-3 py-3 text-sm text-gray-400"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 계좌 확인 모달 (등록 시에만) — 돈이 오가는 단계라 한 번 더 확인시킴 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            <div className="text-3xl mb-2">❗</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">계좌 정보를 확인해 주세요</h3>
            <p className="text-xs text-gray-500 mb-5">
              입력한 계좌로 선물 금액이 전달돼요.<br />계좌 정보가 맞는지 다시 확인해 주세요
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
              >
                다시 확인할게요
              </button>
              <button
                onClick={confirmAdd}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium"
              >
                네, 확인했어요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}