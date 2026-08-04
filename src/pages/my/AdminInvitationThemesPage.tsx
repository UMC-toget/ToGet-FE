import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import CheckIcon from '../../components/icons/CheckIcon'
import { fetchInvitationBackgrounds, fetchCharacters } from '../../api/metaApi'
import { createInvitationBackground, deleteInvitationBackground, createCharacter, deleteCharacter } from '../../api/invitationThemes'
import { uploadImage } from '../../utils/uploadImage'
import { useRequireAdmin } from '../../hooks/useRequireAdmin'

type Tab = 'color' | 'character'

const HEX_CODE_PATTERN = /^#[0-9a-fA-F]{6}$/
const CHARACTER_IMAGE_PREFIX = 'characters'

/** [관리자 전용] 초대장 관리: 초대장 배경 색상 / 캐릭터의 조회·추가·삭제 */
export default function AdminInvitationThemesPage() {
  useRequireAdmin()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('color')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [colorSheetOpen, setColorSheetOpen] = useState(false)
  const [hexInput, setHexInput] = useState('#')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const characterFileInputRef = useRef<HTMLInputElement>(null)

  const { data: colors = [] } = useQuery({
    queryKey: ['invitationBackgrounds'],
    queryFn: fetchInvitationBackgrounds,
  })
  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: fetchCharacters,
  })

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const changeTab = (next: Tab) => {
    setTab(next)
    exitSelectMode()
  }

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const createColorMutation = useMutation({
    mutationFn: (hexCode: string) => createInvitationBackground({ name: hexCode, hexCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitationBackgrounds'] })
      setColorSheetOpen(false)
      setHexInput('#')
    },
    onError: () => setErrorMessage('색상 추가에 실패했어요. 다시 시도해 주세요.'),
  })

  const createCharacterMutation = useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadImage(CHARACTER_IMAGE_PREFIX, file)
      return createCharacter({ name: `캐릭터 ${characters.length + 1}`, imageUrl })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
    onError: () => setErrorMessage('캐릭터 추가에 실패했어요. 다시 시도해 주세요.'),
  })

  const deleteColorsMutation = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => deleteInvitationBackground(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitationBackgrounds'] })
      exitSelectMode()
    },
    onError: () => setErrorMessage('색상 삭제에 실패했어요. 다시 시도해 주세요.'),
  })

  const deleteCharactersMutation = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => deleteCharacter(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] })
      exitSelectMode()
    },
    onError: () => setErrorMessage('캐릭터 삭제에 실패했어요. 다시 시도해 주세요.'),
  })

  const handleAddClick = () => {
    if (tab === 'color') {
      setColorSheetOpen(true)
      return
    }
    // 캐릭터는 바텀시트 없이, 사진 업로드처럼 바로 파일 선택창을 띄운다
    characterFileInputRef.current?.click()
  }

  const handleDeleteClick = () => {
    if (selectMode) {
      const ids = Array.from(selectedIds)
      if (ids.length === 0) return
      if (tab === 'color') deleteColorsMutation.mutate(ids)
      else deleteCharactersMutation.mutate(ids)
      return
    }
    setSelectMode(true)
  }

  const handleConfirmAddColor = () => {
    if (!HEX_CODE_PATTERN.test(hexInput)) {
      setErrorMessage('색상 코드를 #RRGGBB 형식으로 입력해 주세요.')
      return
    }
    createColorMutation.mutate(hexInput)
  }

  const itemCount = tab === 'color' ? colors.length : characters.length
  const selectedLabel = tab === 'color' ? '색상' : '캐릭터'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-12">
      <Header
        title="초대장 관리"
        right={
          selectMode ? (
            <button type="button" onClick={exitSelectMode} className="text-b2-m text-gray-600">
              취소
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-5 px-[18px] py-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeTab('color')}
            className={`rounded-full px-4 py-2 text-b2-m ${tab === 'color' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
          >
            초대장 색상
          </button>
          <button
            type="button"
            onClick={() => changeTab('character')}
            className={`rounded-full px-4 py-2 text-b2-m ${tab === 'character' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
          >
            캐릭터
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-h3-sb text-black">{tab === 'color' ? '초대장 색상' : '캐릭터'}</h2>
          <span className="text-caption1-r text-gray-500">총 {itemCount}개</span>
        </div>

        {tab === 'color' ? (
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => selectMode && toggleSelected(color.id)}
                className="relative size-11 shrink-0 rounded-full border border-gray-200"
                style={{ backgroundColor: color.hexCode }}
                aria-label={color.name}
              >
                {selectMode && (
                  <span
                    className={`absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border border-gray-200 ${
                      selectedIds.has(color.id) ? 'bg-gray-900 text-white' : 'bg-white text-transparent'
                    }`}
                  >
                    <CheckIcon className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {characters.map((character, index) => (
              <button
                key={character.id}
                type="button"
                onClick={() => selectMode && toggleSelected(character.id)}
                className="relative flex flex-col items-center gap-2 rounded-xl bg-background p-4"
              >
                <img src={character.imageUrl} alt={character.name} className="size-24 object-contain" />
                <span className="rounded-full bg-pink-500 px-2 py-0.5 text-caption2-r text-white">
                  No.{String(index + 1).padStart(2, '0')}
                </span>
                {selectMode && (
                  <span
                    className={`absolute right-2 top-2 flex size-5 items-center justify-center rounded-full border border-gray-200 ${
                      selectedIds.has(character.id) ? 'bg-gray-900 text-white' : 'bg-white text-transparent'
                    }`}
                  >
                    <CheckIcon className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={characterFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) createCharacterMutation.mutate(file)
          e.target.value = ''
        }}
      />

      {selectMode ? (
        <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] items-center justify-between border-t border-gray-100 bg-white px-[18px] py-4">
          <p className="text-b2-m text-black">{selectedIds.size}개의 {selectedLabel}이 선택됨</p>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={selectedIds.size === 0}
            className="text-pink-500 disabled:text-gray-300"
            aria-label="삭제"
          >
            삭제
          </button>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] gap-3 border-t border-gray-100 bg-white px-[18px] py-4">
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-300 text-sm font-semibold text-black"
          >
            삭제하기
          </button>
          <button
            type="button"
            onClick={handleAddClick}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white"
          >
            추가하기
          </button>
        </div>
      )}

      {colorSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setColorSheetOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative mx-auto flex w-full max-w-[402px] flex-col gap-5 rounded-t-3xl bg-white px-[18px] pb-8 pt-6">
            <p className="text-b1-m text-black">색상 코드</p>
            <input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
              placeholder="#FFFFFF"
              className="h-12 w-full rounded-lg bg-background px-4 text-b1-m text-black outline-none"
            />
            <button
              type="button"
              onClick={handleConfirmAddColor}
              disabled={createColorMutation.isPending}
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:bg-gray-300"
            >
              추가
            </button>
          </div>
        </div>
      )}

      <Toast open={errorMessage !== null} message={errorMessage ?? ''} standalone />
    </div>
  )
}
