import { create } from 'zustand';

export interface TogetherCreateState {
  // Step 1: 기본 정보
  roomName: string;
  recipientName: string;
  giftDate: string;
  memo: string;
  thumbnailImage: File | string | null;

  setStep1: (
    data: Partial<Pick<TogetherCreateState, 'roomName' | 'recipientName' | 'giftDate' | 'memo' | 'thumbnailImage'>>
  ) => void;
  reset: () => void;
}

const initialState = {
  roomName: '',
  recipientName: '',
  giftDate: '',
  memo: '',
  thumbnailImage: null,
};

export const useTogetherCreateStore = create<TogetherCreateState>((set) => ({
  ...initialState,

  setStep1: (data) => set((state) => ({ ...state, ...data })),

  reset: () => set(initialState),
}));
