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

// 수정 플로우에서 "무엇이 바뀌었는지" 비교할 때 쓰는 스냅샷. thumbnailImage는 기존 이미지가
// 서버에 저장된 URL(string)로 내려오는 걸 가정해서 File 대신 string으로 고정합니다.
export interface EditableSnapshot {
  title: string;
  anniversaryDate: string;
  preparationStartDate: string;
  preparationEndDate: string;
  greeting: string;
  thumbnailImage: string | null;
  wishlist: WishlistItem[];
  showProgress: boolean;
  showAmount: boolean;
  showParticipantCount: boolean;
  showParticipantNames: boolean;
  showMessages: boolean;
  accounts: SavedAccount[];
  selectedAccountId: string | null;
  inviteTitle: string;
  inviteContent: string;
  inviteColor: string;
  inviteCharacter: number;
}

export interface FundingCreateState {
  // Step 1: 기본 정보
  title: string;
  anniversaryDate: string;
  preparationStartDate: string;
  preparationEndDate: string;
  greeting: string;
  // 새로 업로드한 파일은 File, 수정 화면에서 불러온 기존 이미지는 문자열 URL
  thumbnailImage: File | string | null;

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

  // 수정 플로우 전용: 어떤 선물 페이지를 수정 중인지 + 불러온 시점의 원본 스냅샷
  // (원본과 비교해서 "변경됨" 뱃지를 계산하고, 실행취소 시 되돌리는 데 씁니다)
  editFundingId: string | null;
  originalSnapshot: EditableSnapshot | null;

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
  loadForEdit: (fundingId: string, data: EditableSnapshot) => void;
  /** 만들기 플로우를 막 끝낸 시점에 호출 - 지금 스토어에 있는 값을 그대로 이 fundingId의 "원본"으로 확정합니다.
   *  (편집 화면 진입 시 별도 목데이터로 덮어쓰지 않고, 방금 입력한 내용을 그대로 유지하기 위함) */
  commitAsFunding: (fundingId: string) => void;
  revertToOriginal: () => void;
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
  showMessages: false,
  accounts: [],
  selectedAccountId: null,
  inviteTitle: '',
  inviteContent: '',
  inviteColor: '#FCE4F0',
  inviteCharacter: 1,
  editFundingId: null,
  originalSnapshot: null,
};

// thumbnailImage는 File일 수도 있는데, 스냅샷/비교용으로는 항상 문자열(URL)로 통일해서 씁니다.
function normalizeThumbnail(image: FundingCreateState['thumbnailImage']): string | null {
  if (!image) return null;
  return typeof image === 'string' ? image : URL.createObjectURL(image);
}

function extractEditableFields(state: FundingCreateState): EditableSnapshot {
  return {
    title: state.title,
    anniversaryDate: state.anniversaryDate,
    preparationStartDate: state.preparationStartDate,
    preparationEndDate: state.preparationEndDate,
    greeting: state.greeting,
    thumbnailImage: normalizeThumbnail(state.thumbnailImage),
    wishlist: state.wishlist,
    showProgress: state.showProgress,
    showAmount: state.showAmount,
    showParticipantCount: state.showParticipantCount,
    showParticipantNames: state.showParticipantNames,
    showMessages: state.showMessages,
    accounts: state.accounts,
    selectedAccountId: state.selectedAccountId,
    inviteTitle: state.inviteTitle,
    inviteContent: state.inviteContent,
    inviteColor: state.inviteColor,
    inviteCharacter: state.inviteCharacter,
  };
}

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
        selectedAccountId: id, // 새로 등록한 계좌를 바로 선택 상태로
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

  // 수정 화면 진입 시 기존 데이터로 스토어를 채우고, 나중에 비교할 원본 스냅샷을 같이 저장합니다.
  loadForEdit: (fundingId, data) =>
    set(() => ({
      ...initialState,
      ...data,
      editFundingId: fundingId,
      originalSnapshot: JSON.parse(JSON.stringify(data)),
    })),

  // 만들기 플로우 완료 직후 호출 - 지금 값을 그대로 이 fundingId의 원본으로 확정 (덮어쓰지 않음)
  commitAsFunding: (fundingId) =>
    set((state) => {
      const snapshot = extractEditableFields(state);
      return {
        ...snapshot,
        editFundingId: fundingId,
        originalSnapshot: JSON.parse(JSON.stringify(snapshot)),
      };
    }),

  // "실행취소" - 수정 세션 동안 바뀐 값을 전부 원본 스냅샷으로 되돌립니다.
  revertToOriginal: () =>
    set((state) => (state.originalSnapshot ? { ...state.originalSnapshot } : state)),

  reset: () => set(initialState),
}));

// 각 단계가 어떤 필드를 다루는지 매핑 - "변경됨" 판정에 사용
const STEP_FIELDS: Record<number, (keyof EditableSnapshot)[]> = {
  1: ['title', 'anniversaryDate', 'preparationStartDate', 'preparationEndDate', 'greeting', 'thumbnailImage'],
  2: ['wishlist'],
  3: ['showProgress', 'showAmount', 'showParticipantCount', 'showParticipantNames', 'showMessages'],
  4: ['accounts', 'selectedAccountId'],
  5: ['inviteTitle', 'inviteContent', 'inviteColor', 'inviteCharacter'],
};

/** 특정 단계(1~5)의 필드가 원본 스냅샷과 달라졌는지 (수정 화면의 "변경됨" 뱃지/저장 버튼 활성화에 사용) */
export function isStepDirty(state: FundingCreateState, step: number): boolean {
  if (!state.originalSnapshot) return false;
  const fields = STEP_FIELDS[step] ?? [];
  return fields.some((key) => JSON.stringify(state[key]) !== JSON.stringify(state.originalSnapshot![key]));
}

/** 변경된 단계 번호 목록 */
export function getDirtySteps(state: FundingCreateState): number[] {
  return [1, 2, 3, 4, 5].filter((step) => isStepDirty(state, step));
}
