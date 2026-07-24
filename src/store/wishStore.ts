import { create } from 'zustand'

/** '받고 싶은'(내가 받고 싶은 선물) / '주고 싶은'(내가 주고 싶은 선물) 위시 유형 */
export type WishType = 'receive' | 'give'

interface WishState {
  /** 상품 id -> 위시 유형 */
  wishes: Record<number, WishType>
  addWish: (productId: number, type: WishType) => void
  removeWish: (productId: number) => void
}

// TODO: BE 연동 후 위시 등록/해제를 API 호출로 교체하고, 초기 상태도 서버 응답으로 채워야 함
export const useWishStore = create<WishState>((set) => ({
  wishes: {},
  addWish: (productId, type) =>
    set((state) => ({ wishes: { ...state.wishes, [productId]: type } })),
  removeWish: (productId) =>
    set((state) => {
      const wishes = { ...state.wishes }
      delete wishes[productId]
      return { wishes }
    }),
}))
