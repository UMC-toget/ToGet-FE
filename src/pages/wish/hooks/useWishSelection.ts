import { useState, useCallback } from 'react'

export function useWishSelection() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [giftSelectedIds, setGiftSelectedIds] = useState<number[]>([])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  const toggleGiftSelect = useCallback((id: number) => {
    setGiftSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      const next = !prev
      if (next) {
        setGiftSelectedIds([])
      } else {
        setSelectedIds([])
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const clearGiftSelection = useCallback(() => {
    setGiftSelectedIds([])
  }, [])

  return {
    isEditMode,
    selectedIds,
    giftSelectedIds,
    toggleSelect,
    toggleGiftSelect,
    handleToggleEditMode,
    clearSelection,
    clearGiftSelection,
  }
}
