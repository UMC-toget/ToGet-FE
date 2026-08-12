import { create } from 'zustand';
import { mergeSavedAccounts, type SavedAccount } from './fundingCreateStore';

export interface TogetherCreateState {
  // Step 1: 기본 정보
  roomName: string;
  recipientName: string;
  giftDate: string;
  memo: string;
  thumbnailImage: File | string | null;

  // Step 2: 계좌 정보
  accounts: SavedAccount[];
  selectedAccountId: string | null;

  // Step 3: 초대장 만들기
  inviteTitle: string;
  inviteContent: string;
  inviteBackgroundId: number | null;
  inviteColor: string;
  inviteCharacter: number;

  // 수정 화면에서 최초 서버값과 현재값을 비교하기 위한 원본 스냅샷
  editFundingId: string | null;
  originalSnapshot: TogetherEditableSnapshot | null;

  setStep1: (
    data: Partial<Pick<TogetherCreateState, 'roomName' | 'recipientName' | 'giftDate' | 'memo' | 'thumbnailImage'>>
  ) => void;
  addAccount: (data: Omit<SavedAccount, 'id'>) => void;
  hydrateAccounts: (accounts: SavedAccount[]) => void;
  updateAccount: (id: string, data: Partial<Omit<SavedAccount, 'id'>>) => void;
  selectAccount: (id: string) => void;
  setInvite: (
    data: Partial<Pick<TogetherCreateState, 'inviteTitle' | 'inviteContent' | 'inviteBackgroundId' | 'inviteColor' | 'inviteCharacter'>>
  ) => void;
  loadForEdit: (fundingId: string, data: TogetherEditableFields) => void;
  commitAsFunding: (fundingId: string) => void;
  reset: () => void;
}

export type TogetherEditableFields = Pick<
  TogetherCreateState,
  | 'roomName'
  | 'recipientName'
  | 'giftDate'
  | 'memo'
  | 'thumbnailImage'
  | 'accounts'
  | 'selectedAccountId'
  | 'inviteTitle'
  | 'inviteContent'
  | 'inviteBackgroundId'
  | 'inviteColor'
  | 'inviteCharacter'
>;

type TogetherEditableSnapshot = TogetherEditableFields;

const initialState = {
  roomName: '',
  recipientName: '',
  giftDate: '',
  memo: '',
  thumbnailImage: null,
  accounts: [],
  selectedAccountId: null,
  inviteTitle: '',
  inviteContent: '',
  inviteBackgroundId: null,
  inviteColor: '#FCE4F0',
  inviteCharacter: 1,
  editFundingId: null,
  originalSnapshot: null,
};

function extractEditableFields(state: TogetherEditableFields): TogetherEditableSnapshot {
  return {
    roomName: state.roomName,
    recipientName: state.recipientName,
    giftDate: state.giftDate,
    memo: state.memo,
    thumbnailImage: state.thumbnailImage,
    accounts: state.accounts,
    selectedAccountId: state.selectedAccountId,
    inviteTitle: state.inviteTitle,
    inviteContent: state.inviteContent,
    inviteBackgroundId: state.inviteBackgroundId,
    inviteColor: state.inviteColor,
    inviteCharacter: state.inviteCharacter,
  };
}

export const useTogetherCreateStore = create<TogetherCreateState>((set) => ({
  ...initialState,

  setStep1: (data) => set((state) => ({ ...state, ...data })),

  addAccount: (data) =>
    set((state) => {
      const id = crypto.randomUUID();
      return {
        accounts: [...state.accounts, { id, ...data }],
        selectedAccountId: id,
      };
    }),
  hydrateAccounts: (accounts) =>
    set((state) => mergeSavedAccounts(accounts, state.accounts, state.selectedAccountId)),
  updateAccount: (id, data) =>
    set((state) => ({
      accounts: state.accounts.map((acc) => (acc.id === id ? { ...acc, ...data } : acc)),
    })),
  selectAccount: (id) => set({ selectedAccountId: id }),

  setInvite: (data) => set((state) => ({ ...state, ...data })),

  loadForEdit: (fundingId, data) =>
    set({
      ...data,
      editFundingId: fundingId,
      originalSnapshot: structuredClone(extractEditableFields(data)),
    }),

  commitAsFunding: (fundingId) =>
    set((state) => ({
      editFundingId: fundingId,
      originalSnapshot: structuredClone(extractEditableFields(state)),
    })),

  reset: () => set(initialState),
}));

const TOGETHER_STEP_FIELDS: Record<number, (keyof TogetherEditableSnapshot)[]> = {
  1: ['roomName', 'recipientName', 'giftDate', 'memo', 'thumbnailImage'],
  3: ['inviteTitle', 'inviteContent', 'inviteBackgroundId', 'inviteColor', 'inviteCharacter'],
};

function getSelectedAccount(state: TogetherEditableFields) {
  const account = state.accounts.find((item) => item.id === state.selectedAccountId);
  return account
    ? {
        id: account.id,
        bankName: account.bankName,
        accountNumber: account.accountNumber.replace(/\D/g, ''),
        accountHolder: account.accountHolder,
      }
    : null;
}

/** 함께 선물 수정 화면에서 특정 단계가 최초 서버값과 달라졌는지 확인합니다. */
export function isTogetherStepDirty(state: TogetherCreateState, step: number): boolean {
  if (!state.originalSnapshot) return false;
  if (step === 2) {
    return JSON.stringify(getSelectedAccount(state)) !==
      JSON.stringify(getSelectedAccount(state.originalSnapshot));
  }
  const fields = TOGETHER_STEP_FIELDS[step] ?? [];
  return fields.some((key) => JSON.stringify(state[key]) !== JSON.stringify(state.originalSnapshot?.[key]));
}
