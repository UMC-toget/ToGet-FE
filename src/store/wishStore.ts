import { create } from 'zustand'

/** '받고 싶은'(내가 받고 싶은 선물) / '주고 싶은'(내가 주고 싶은 선물) 위시 유형 */
export type WishType = 'receive' | 'give'

interface WishState {
  /** 상품 id -> 등록된 위시 유형 목록. 한 상품에 receive/give 둘 다 등록할 수 있습니다 */
  wishes: Record<number, WishType[]>
  addWish: (productId: number, type: WishType) => void
  /** type을 생략하면 해당 상품의 위시를 전부 해제합니다 */
  removeWish: (productId: number, type?: WishType) => void
}

// TODO: BE 연동 후 위시 등록/해제를 API 호출로 교체하고, 초기 상태도 서버 응답으로 채워야 함
export const useWishStore = create<WishState>((set) => ({
  wishes: {},
  addWish: (productId, type) =>
    set((state) => {
      const current = state.wishes[productId] ?? []
      if (current.includes(type)) return state
      return { wishes: { ...state.wishes, [productId]: [...current, type] } }
    }),
  removeWish: (productId, type) =>
    set((state) => {
      if (!(productId in state.wishes)) return state
      const wishes = { ...state.wishes }
      if (type === undefined) {
        delete wishes[productId]
        return { wishes }
      }
      const remaining = wishes[productId].filter((t) => t !== type)
      if (remaining.length === 0) delete wishes[productId]
      else wishes[productId] = remaining
      return { wishes }
    }),
}))
