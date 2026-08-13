import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import BottomSheet from '../../components/common/BottomSheet'
import SelectModeBar from '../../components/common/SelectModeBar'
import SelectCheckBadge from '../../components/common/SelectCheckBadge'
import { fetchInvitationBackgrounds, fetchCharacters } from '../../api/metaApi'
import {
  createInvitationBackground,
  updateInvitationBackground,
  deleteInvitationBackground,
  createCharacter,
  deleteCharacter,
} from '../../api/invitationThemes'
import { uploadImage } from '../../utils/uploadImage'
import { useRequireAdmin } from '../../hooks/useRequireAdmin'

type Tab = 'color' | 'character'
/** 색상 바텀시트 상태 — 추가하기로 열면 add, 기존 스와치를 누르면 그 색상이 채워진 edit */
type ColorSheetState = { mode: 'add' } | { mode: 'edit'; id: number }

const HEX_CODE_PATTERN = /^#[0-9a-fA-F]{6}$/
const CHARACTER_IMAGE_PREFIX = 'characters'
const ERROR_TOAST_DURATION_MS = 2500

/** [관리자 전용] 초대장 관리: 초대장 배경 색상 / 캐릭터의 조회·추가·삭제 */
export default function AdminInvitationThemesPage() {
  useRequireAdmin()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('color')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [colorSheet, setColorSheet] = useState<ColorSheetState | null>(null)
  const [hexInput, setHexInput] = useState('#')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const characterFileInputRef = useRef<HTMLInputElement>(null)

  // 에러 토스트는 잠시 뜬 뒤 자동으로 사라져야 합니다 (Toast 컴포넌트 자체는 타이밍을 제어하지 않음)
  useEffect(() => {
    if (errorMessage === null) return
    const timer = setTimeout(() => setErrorMessage(null), ERROR_TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [errorMessage])

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

  const closeColorSheet = () => {
    setColorSheet(null)
    setHexInput('#')
  }

  const createColorMutation = useMutation({
    mutationFn: (hexCode: string) => createInvitationBackground({ name: hexCode, hexCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitationBackgrounds'] })
      closeColorSheet()
    },
    onError: () => setErrorMessage('색상 추가에 실패했어요. 다시 시도해 주세요.'),
  })

  const updateColorMutation = useMutation({
    mutationFn: ({ id, hexCode }: { id: number; hexCode: string }) =>
      updateInvitationBackground(id, { name: hexCode, hexCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitationBackgrounds'] })
      closeColorSheet()
    },
    onError: () => setErrorMessage('색상 수정에 실패했어요. 다시 시도해 주세요.'),
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
      setColorSheet({ mode: 'add' })
      setHexInput('#')
      return
    }
    // 캐릭터는 바텀시트 없이, 사진 업로드처럼 바로 파일 선택창을 띄운다
    characterFileInputRef.current?.click()
  }

  /** 기존 색상 스와치를 누르면(삭제 선택 모드가 아닐 때) 그 색상 코드가 채워진 바텀시트로 이동합니다 */
  const handleColorSwatchClick = (color: { id: number; hexCode: string }) => {
    if (selectMode) {
      toggleSelected(color.id)
      return
    }
    setColorSheet({ mode: 'edit', id: color.id })
    setHexInput(color.hexCode)
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

  const handleConfirmColor = () => {
    if (!colorSheet) return
    if (!HEX_CODE_PATTERN.test(hexInput)) {
      setErrorMessage('색상 코드를 #RRGGBB 형식으로 입력해 주세요.')
      return
    }
    // 수정 중인 항목 본인은 중복 체크에서 제외 (값을 안 바꾸고 그대로 수정해도 통과해야 함)
    const isDuplicate = colors.some(
      (c) => c.hexCode.toLowerCase() === hexInput.toLowerCase() && (colorSheet.mode !== 'edit' || c.id !== colorSheet.id),
    )
    if (isDuplicate) {
      setErrorMessage('이미 등록된 색상이에요.')
      return
    }
    if (colorSheet.mode === 'add') {
      createColorMutation.mutate(hexInput)
    } else {
      updateColorMutation.mutate({ id: colorSheet.id, hexCode: hexInput })
    }
  }

  const itemCount = tab === 'color' ? colors.length : characters.length
  const selectedLabel = tab === 'color' ? '색상' : '캐릭터'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-12">
      <Header title="초대장 관리" />

      <div className="flex flex-col gap-4 px-[18px] py-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeTab('color')}
            className={`rounded-full px-4 text-b2-m ${tab === 'color' ? 'bg-gray-900 py-[11px] text-white' : 'border border-gray-300 bg-white py-[10px] text-gray-700'}`}
          >
            초대장 색상
          </button>
          <button
            type="button"
            onClick={() => changeTab('character')}
            className={`rounded-full px-4 text-b2-m ${tab === 'character' ? 'bg-gray-900 py-[11px] text-white' : 'border border-gray-300 bg-white py-[10px] text-gray-700'}`}
          >
            캐릭터
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-b1-m text-black">{tab === 'color' ? '초대장 색상' : '캐릭터'}</h2>
            {selectMode ? (
              <button type="button" onClick={exitSelectMode} className="text-b2-r text-gray-400">
                취소
              </button>
            ) : (
              <span className="text-b2-r text-gray-400">총 {itemCount}개</span>
            )}
          </div>

          {tab === 'color' ? (
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleColorSwatchClick(color)}
                  // 흰색만 배경(흰 화면)과 구분되는 테두리가 있고, 나머지 색상은 테두리 없음 (피그마 기준)
                  className={`relative size-[35px] shrink-0 rounded-[4px] ${
                    color.hexCode.toLowerCase() === '#ffffff' ? 'border-[1.5px] border-[#D9D9D9]' : ''
                  }`}
                  // 백엔드 hexCode가 이미 "원색 + 50%"로 합성된 값이라 그대로 씁니다 (추가 불투명도 적용 시 이중 블렌딩됨)
                  style={{ backgroundColor: color.hexCode }}
                  aria-label={color.name}
                >
                  {selectMode && <SelectCheckBadge selected={selectedIds.has(color.id)} position="inset-0 m-auto" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {characters.map((character, index) => (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => selectMode && toggleSelected(character.id)}
                  className="relative flex flex-col items-center gap-1.5 rounded-xl bg-background p-4"
                >
                  <img src={character.imageUrl} alt={character.name} className="size-30 object-contain" />
                  <span className="rounded-[3.46px] bg-pink-500 px-1.5 py-[4.73px] text-caption2-r text-white">
                    No.{String(index + 1).padStart(2, '0')}
                  </span>
                  {selectMode && <SelectCheckBadge selected={selectedIds.has(character.id)} position="right-3 top-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
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
        <SelectModeBar count={selectedIds.size} label={selectedLabel} onDelete={handleDeleteClick} />
      ) : (
        <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[402px] gap-3 bg-white px-[18px] py-4">
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-600 text-sm font-semibold text-black"
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

      <BottomSheet open={colorSheet !== null} onClose={closeColorSheet}>
        <div className="flex w-full flex-col gap-5">
          <p className="text-h3-sb text-black">색상 코드</p>
          <input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
            placeholder="#FFFFFF"
            className="h-12 w-full rounded-lg bg-background px-4 text-b1-m text-black outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmColor}
            disabled={createColorMutation.isPending || updateColorMutation.isPending}
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            {colorSheet?.mode === 'edit' ? '수정' : '추가'}
          </button>
        </div>
      </BottomSheet>

      <Toast
        open={errorMessage !== null}
        message={errorMessage ?? ''}
        standalone
        // 바텀시트(z-50)가 열려 있어도 가려지지 않도록 위, 그 위에 뜨도록 함
        zIndexClass={colorSheet !== null ? 'z-[60]' : 'z-40'}
        bottomClass={colorSheet !== null ? 'bottom-[280px]' : undefined}
      />
    </div>
  )
}
