import { useState, useEffect, useCallback, useRef } from 'react'
import { deleteWishlistItem, updateWishlistItem } from '../../../api/wishlists'
import type { WishlistUpdateRequest } from '../../../api/wishlists'

const TOAST_DURATION_MS = 2000
const PENDING_TOAST_KEY = 'toget:wishPendingToast'

type PendingWishUndo =
  | { type: 'create'; wishlistItemId: number }
  | { type: 'edit'; wishlistItemId: number; previousData: WishlistUpdateRequest }

interface PendingToastPayload {
  message: string
  undo?: PendingWishUndo
}

function readPendingToast(): PendingToastPayload | null {
  const raw = sessionStorage.getItem(PENDING_TOAST_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingToastPayload
  } catch {
    return null
  }
}

/**
 * 다른 페이지에서 이 페이지로 돌아오면서 토스트(+선택적으로 실행취소)를 띄우고 싶을 때 사용합니다.
 * navigate 직전에 setPendingToast(...)를 호출해 두면, 이 훅을 쓰는 화면이 마운트되는 즉시
 * 그 토스트가 자동으로 뜨고 사라집니다. (location.state는 StrictMode의 render 이중 호출과
 * 타이밍이 겹치면 값이 유실될 수 있어 sessionStorage로 전달합니다.)
 */
export function setPendingToast(message: string, undo?: PendingWishUndo) {
  sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({ message, undo }))
}

function buildUndoAction(undo: PendingWishUndo, onRefetch?: () => void): () => void {
  return async () => {
    try {
      if (undo.type === 'create') {
        await deleteWishlistItem(undo.wishlistItemId)
      } else {
        await updateWishlistItem(undo.wishlistItemId, undo.previousData)
      }
      onRefetch?.()
    } catch (err) {
      console.error('위시 실행취소 실패:', err)
    }
  }
}

/** onRefetch: pendingToast의 실행취소가 성공했을 때 목록을 다시 불러오기 위한 콜백 */
export function useWishToast(onRefetch?: () => void) {
  const [toastMessage, setToastMessage] = useState<string | null>(() => readPendingToast()?.message ?? null)
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(() =>
    readPendingToast()?.undo ? '실행취소' : undefined,
  )
  const onActionRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    // StrictMode에서 이 effect가 mount→cleanup→mount로 두 번 호출될 수 있습니다. 첫 호출에서
    // sessionStorage를 이미 비웠다면 두 번째 호출에는 pending이 없을 수 있으므로, "취소 콜백 등록"과
    // "타이머 예약"을 분리해서 두 번째 호출에서도 타이머는 항상 다시 걸리도록 합니다.
    const pending = readPendingToast()
    if (pending) {
      sessionStorage.removeItem(PENDING_TOAST_KEY)
      if (pending.undo) {
        onActionRef.current = buildUndoAction(pending.undo, onRefetch)
      }
    }

    if (toastMessage === null) return
    const timer = setTimeout(() => {
      setToastMessage(null)
      setToastActionLabel(undefined)
      onActionRef.current = undefined
    }, TOAST_DURATION_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    setToastMessage(message)
    setToastActionLabel(actionLabel)
    onActionRef.current = onAction
    setTimeout(() => {
      setToastMessage(null)
      setToastActionLabel(undefined)
      onActionRef.current = undefined
    }, TOAST_DURATION_MS)
  }, [])

  const handleToastAction = useCallback(() => {
    onActionRef.current?.()
    setToastMessage(null)
    setToastActionLabel(undefined)
    onActionRef.current = undefined
  }, [])

  return {
    toastMessage,
    toastActionLabel,
    showToast,
    handleToastAction,
  }
}

