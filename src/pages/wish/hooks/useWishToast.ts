import { useState, useEffect, useCallback } from 'react'
import { useWishStore } from '../../../store/wishStore'

const TOAST_DURATION_MS = 3000

export function useWishToast() {
  const pendingToast = useWishStore((state) => state.pendingToast)
  const clearPendingToast = useWishStore((state) => state.clearPendingToast)
  const undoLastDelete = useWishStore((state) => state.undoLastDelete)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (pendingToast) {
      setToastMessage(pendingToast.message)
      setToastActionLabel(pendingToast.actionLabel)
      const timer = setTimeout(() => {
        setToastMessage(null)
        setToastActionLabel(undefined)
        clearPendingToast()
      }, TOAST_DURATION_MS)
      return () => clearTimeout(timer)
    }
  }, [pendingToast, clearPendingToast])

  const showToast = useCallback((message: string, actionLabel?: string) => {
    setToastMessage(message)
    setToastActionLabel(actionLabel)
    setTimeout(() => {
      setToastMessage(null)
      setToastActionLabel(undefined)
    }, TOAST_DURATION_MS)
  }, [])

  const handleUndo = useCallback(() => {
    undoLastDelete()
    setToastMessage(null)
    setToastActionLabel(undefined)
  }, [undoLastDelete])

  return {
    toastMessage,
    toastActionLabel,
    showToast,
    handleUndo,
  }
}
