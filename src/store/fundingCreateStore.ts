import { create } from 'zustand';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  link?: string;
  imageUrl?: string;
}

export interface SavedAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface FundingCreateState {
  // Step 1: 기본 정보
  title: string;
  anniversaryDate: string;
  preparationStartDate: string;
  preparationEndDate: string;
  greeting: string;
  thumbnailImage: File | null;

  // Step 2: 위시리스트
  wishlist: WishlistItem[];

  // Step 3: 공개 범위
  showProgress: boolean;
  showAmount: boolean;
  showParticipantCount: boolean;
  showParticipantNames: boolean;
  showMessages: boolean;

  // Step 4: 계좌 정보 (다중 계좌 등록 + 선택)
  accounts: SavedAccount[];
  selectedAccountId: string | null;

  // Step 5: 초대장
  inviteTitle: string;
  inviteContent: string;
  inviteColor: string;
  inviteCharacter: number;

  // actions
  setStep1: (data: Partial<Pick<FundingCreateState, 'title' | 'anniversaryDate' | 'preparationStartDate' | 'preparationEndDate' | 'greeting' | 'thumbnailImage'>>) => void;
  addWishlistItem: (item: WishlistItem) => void;
  removeWishlistItem: (id: string) => void;
  setVisibility: (data: Partial<Pick<FundingCreateState, 'showProgress' | 'showAmount' | 'showParticipantCount' | 'showParticipantNames' | 'showMessages'>>) => void;
  addAccount: (data: Omit<SavedAccount, 'id'>) => void;
  updateAccount: (id: string, data: Partial<Omit<SavedAccount, 'id'>>) => void;
  removeAccount: (id: string) => void;
  selectAccount: (id: string) => void;
  setInvite: (data: Partial<Pick<FundingCreateState, 'inviteTitle' | 'inviteContent' | 'inviteColor' | 'inviteCharacter'>>) => void;
  reset: () => void;
}

const initialState = {
  title: '',
  anniversaryDate: '',
  preparationStartDate: '',
  preparationEndDate: '',
  greeting: '',
  thumbnailImage: null,
  wishlist: [],
  showProgress: true,
  showAmount: true,
  showParticipantCount: true,
  showParticipantNames: true,
  showMessages: true,
  accounts: [],
  selectedAccountId: null,
  inviteTitle: '',
  inviteContent: '',
  inviteColor: '#FBCFE8',
  inviteCharacter: 1,
};

export const useFundingCreateStore = create<FundingCreateState>((set) => ({
  ...initialState,

  setStep1: (data) => set((state) => ({ ...state, ...data })),

  addWishlistItem: (item) => set((state) => ({ wishlist: [...state.wishlist, item] })),
  removeWishlistItem: (id) => set((state) => ({ wishlist: state.wishlist.filter((i) => i.id !== id) })),

  setVisibility: (data) => set((state) => ({ ...state, ...data })),

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
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== id),
      selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
    })),
  selectAccount: (id) => set({ selectedAccountId: id }),

  setInvite: (data) => set((state) => ({ ...state, ...data })),

  reset: () => set(initialState),
}));