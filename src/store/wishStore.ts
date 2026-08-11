import { create } from 'zustand'

/** '받고 싶은'(내가 받고 싶은 선물) / '주고 싶은'(내가 주고 싶은 선물) 위시 유형 */
export type WishType = 'receive' | 'give'

export interface CustomWishItem {
  id: number
  brand: string
  name: string
  price: number
  image: string
  purchaseUrl?: string
  wishType: WishType
  wishTypes?: WishType[]
  createdAt: number
}

export interface ToastInfo {
  message: string
  actionLabel?: string
  undoType?: 'delete' | 'edit' | 'create'
}

interface WishState {
  /** 상품 id -> 등록된 위시 유형 목록. 한 상품에 receive/give 둘 다 등록할 수 있습니다 */
  wishes: Record<number, WishType[]>
  /** 커스텀 생성/수정된 위시 상품 목록 */
  customWishes: Record<number, CustomWishItem>
  /** 마지막 삭제/변경 작업 백업 (실행취소용) */
  deletedItemsBackup: { id: number; wishTypes: WishType[]; customItem?: CustomWishItem }[]
  pendingToast: ToastInfo | null

  addWish: (productId: number, type: WishType, customData?: Partial<CustomWishItem>) => void
  updateWish: (
    productId: number,
    updates: {
      name?: string
      price?: number
      purchaseUrl?: string
      image?: string
      wishType?: WishType
      wishTypes?: WishType[]
    },
  ) => void
  removeWish: (productId: number, type?: WishType) => void
  bulkRemoveWishes: (productIds: number[]) => void
  undoLastDelete: () => void
  setPendingToast: (toast: ToastInfo | null) => void
  clearPendingToast: () => void
}

const INITIAL_WISHES: Record<number, WishType[]> = {}

export const useWishStore = create<WishState>((set, get) => ({
  wishes: INITIAL_WISHES,
  customWishes: {},
  deletedItemsBackup: [],
  pendingToast: null,

  addWish: (productId, type, customData) => {
    set((state) => {
      const current = state.wishes[productId] ?? []
      const nextTypes = current.includes(type) ? current : [...current, type]
      const nextWishes = { ...state.wishes, [productId]: nextTypes }

      let nextCustom = state.customWishes
      if (customData) {
        nextCustom = {
          ...state.customWishes,
          [productId]: {
            id: productId,
            brand: customData.brand || '위시 선물',
            name: customData.name || '선물 항목',
            price: customData.price || 0,
            image: customData.image || '',
            purchaseUrl: customData.purchaseUrl || '',
            wishType: type,
            wishTypes: nextTypes,
            createdAt: Date.now(),
          },
        }
      }
      return {
        wishes: nextWishes,
        customWishes: nextCustom,
        pendingToast: {
          message: '1개의 선물이 등록 되었습니다',
          actionLabel: '실행취소',
          undoType: 'create',
        },
      }
    })
  },

  updateWish: (productId, updates) => {
    set((state) => {
      const existingTypes = state.wishes[productId] ?? ['receive']
      const updatedTypes = updates.wishTypes
        ? updates.wishTypes
        : updates.wishType
          ? [updates.wishType]
          : existingTypes

      const existingCustom = state.customWishes[productId]
      const updatedCustom: CustomWishItem = {
        id: productId,
        brand: existingCustom?.brand || '위시 선물',
        name: updates.name ?? existingCustom?.name ?? '선물 항목',
        price: updates.price ?? existingCustom?.price ?? 0,
        image: updates.image ?? existingCustom?.image ?? '',
        purchaseUrl: updates.purchaseUrl ?? existingCustom?.purchaseUrl ?? '',
        wishType: updatedTypes[0] || 'receive',
        wishTypes: updatedTypes,
        createdAt: existingCustom?.createdAt ?? Date.now(),
      }

      return {
        wishes: { ...state.wishes, [productId]: updatedTypes },
        customWishes: { ...state.customWishes, [productId]: updatedCustom },
        pendingToast: {
          message: '1개의 선물을 수정 완료 했습니다',
          actionLabel: '실행취소',
          undoType: 'edit',
        },
      }
    })
  },

  removeWish: (productId, type) => {
    const state = get()
    if (!(productId in state.wishes)) return

    const currentTypes = state.wishes[productId] ?? []
    const customItem = state.customWishes[productId]

    let nextTypes: WishType[] = []
    if (type !== undefined) {
      nextTypes = currentTypes.filter((t) => t !== type)
    }

    const wishes = { ...state.wishes }
    const customWishes = { ...state.customWishes }

    if (type === undefined || nextTypes.length === 0) {
      delete wishes[productId]
      delete customWishes[productId]
    } else {
      wishes[productId] = nextTypes
    }

    set({
      wishes,
      customWishes,
      deletedItemsBackup: [{ id: productId, wishTypes: currentTypes, customItem }],
      pendingToast: {
        message: '1개의 선물을 삭제 했습니다',
        actionLabel: '실행취소',
        undoType: 'delete',
      },
    })
  },

  bulkRemoveWishes: (productIds) => {
    const state = get()
    const backups: { id: number; wishTypes: WishType[]; customItem?: CustomWishItem }[] = []
    const wishes = { ...state.wishes }
    const customWishes = { ...state.customWishes }

    productIds.forEach((id) => {
      if (wishes[id]) {
        backups.push({ id, wishTypes: wishes[id], customItem: customWishes[id] })
        delete wishes[id]
        delete customWishes[id]
      }
    })

    set({
      wishes,
      customWishes,
      deletedItemsBackup: backups,
      pendingToast: {
        message: `${backups.length}개의 선물을 삭제 했습니다`,
        actionLabel: '실행취소',
        undoType: 'delete',
      },
    })
  },

  undoLastDelete: () => {
    const state = get()
    if (state.deletedItemsBackup.length === 0) return

    const restoredWishes = { ...state.wishes }
    const restoredCustom = { ...state.customWishes }

    state.deletedItemsBackup.forEach((item) => {
      restoredWishes[item.id] = item.wishTypes
      if (item.customItem) {
        restoredCustom[item.id] = item.customItem
      }
    })

    set({
      wishes: restoredWishes,
      customWishes: restoredCustom,
      deletedItemsBackup: [],
      pendingToast: null,
    })
  },

  setPendingToast: (toast) => set({ pendingToast: toast }),
  clearPendingToast: () => set({ pendingToast: null }),
}))
