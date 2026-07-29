import { create } from 'zustand';
import type { SavedAccount } from './fundingCreateStore';

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

  setStep1: (
    data: Partial<Pick<TogetherCreateState, 'roomName' | 'recipientName' | 'giftDate' | 'memo' | 'thumbnailImage'>>
  ) => void;
  addAccount: (data: Omit<SavedAccount, 'id'>) => void;
  updateAccount: (id: string, data: Partial<Omit<SavedAccount, 'id'>>) => void;
  selectAccount: (id: string) => void;
  reset: () => void;
}

const initialState = {
  roomName: '',
  recipientName: '',
  giftDate: '',
  memo: '',
  thumbnailImage: null,
  accounts: [],
  selectedAccountId: null,
};

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
  updateAccount: (id, data) =>
    set((state) => ({
      accounts: state.accounts.map((acc) => (acc.id === id ? { ...acc, ...data } : acc)),
    })),
  selectAccount: (id) => set({ selectedAccountId: id }),

  reset: () => set(initialState),
}));
