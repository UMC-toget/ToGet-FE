import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import BottomSheet from '../../components/common/BottomSheet'
import ConfirmModal from '../../components/common/ConfirmModal'
import PlusIcon from '../../components/icons/PlusIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import { useTogetherCreateStore } from '../../store/togetherCreateStore'
import type { SavedAccount } from '../../store/fundingCreateStore'
import { searchBanks } from '../../utils/bankData'
import bankShinhan from '../../assets/bank-shinhan.png'
import bankKakao from '../../assets/bank-kakao.png'

// 접근: 개설자 전용 | 선물 페이지 수정 2단계 — 계좌 정보 (G섹션 store 재사용)
const BANK_LOGOS: Partial<Record<string, string>> = {
  '신한은행': bankShinhan,
  '카카오뱅크': bankKakao,
}

type View = 'list' | 'add' | 'edit'
interface AccountForm {
  bankName: string
  accountNumber: string
  accountHolder: string
}
const emptyForm: AccountForm = { bankName: '', accountNumber: '', accountHolder: '' }

export default function GroupEditAccountPage() {
  const navigate = useNavigate()
  const { accounts, selectedAccountId, addAccount, updateAccount, selectAccount } = useTogetherCreateStore()

  const [view, setView] = useState<View>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AccountForm>(emptyForm)
  const [showBankSheet, setShowBankSheet] = useState(false)
  const [bankQuery, setBankQuery] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const isFormValid = Boolean(form.bankName.trim() && form.accountNumber.trim() && form.accountHolder.trim())
  const isEdit = view === 'edit'

  const openAdd = () => {
    setForm(emptyForm)
    setView('add')
  }

  const openEdit = (acc: SavedAccount) => {
    setForm({ bankName: acc.bankName, accountNumber: acc.accountNumber, accountHolder: acc.accountHolder })
    setEditingId(acc.id)
    setView('edit')
  }

  const confirmAdd = () => {
    addAccount(form)
    setShowConfirm(false)
    setView('list')
  }

  const handleSubmitEdit = () => {
    if (!editingId) return
    updateAccount(editingId, form)
    setEditingId(null)
    setView('list')
  }

  // ── 계좌 목록 화면 ───────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
        <Header
          title="2단계 : 계좌 정보"
          right={
            <button type="button" onClick={() => setShowLeaveConfirm(true)} className="text-b2-m text-gray-600">
              나가기
            </button>
          }
        />

        <div className="flex flex-1 flex-col overflow-y-auto pb-[120px]">
          <div className="flex flex-col gap-5 px-[18px] pt-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-h3-sb text-black">입금받을 계좌를 등록해 주세요</h2>
              <p className="text-caption1-r text-gray-600">참여자에게 해당 계좌번호가 안내돼요</p>
            </div>

            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-[14px] py-3"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-background">
                <PlusIcon className="size-6 text-gray-900" />
              </div>
              <span className="flex-1 text-left text-b2-m text-black">새로운 계좌 등록하기</span>
              <ChevronRightIcon className="size-6 text-black" />
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-6 flex-1 bg-background px-[18px] pb-6 pt-5">
              <p className="text-b1-m text-black">등록된 {accounts.length}개 계좌</p>
              <div className="mt-4 flex flex-col gap-2">
                {accounts.map(acc => {
                  const selected = acc.id === selectedAccountId
                  return (
                    <div
                      key={acc.id}
                      className="rounded-xl border border-gray-100 bg-white px-[14px] py-3"
                    >
                      <button
                        type="button"
                        onClick={() => selectAccount(acc.id)}
                        className="flex w-full items-start gap-3 text-left"
                      >
                        <div className="flex size-[63px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-background">
                          {BANK_LOGOS[acc.bankName] ? (
                            <img src={BANK_LOGOS[acc.bankName]} alt="" className="size-[50px] object-contain" />
                          ) : (
                            <span className="text-2xl">🏦</span>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                          <p className="text-caption1-r text-[#5B565A] mt-1">{acc.bankName}</p>
                          <div className="flex flex-col">
                            <p className="text-b2-m text-black">{acc.accountHolder}</p>
                            <p className="text-b2-m text-black">{acc.accountNumber}</p>
                          </div>
                        </div>
                        <span
                          aria-hidden
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-pink-500 bg-background' : 'border-gray-300'}`}
                        >
                          {selected && <span className="size-3 rounded-full bg-pink-500" />}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(acc)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-100 py-2 text-caption1-m text-black"
                      >
                        <PencilIcon className="size-5" />
                        계좌 수정하기
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <StickyBottomBar>
          <Button className="pointer-events-auto" disabled={!selectedAccountId} onClick={() => navigate(-1)}>
            다음
          </Button>
        </StickyBottomBar>

        <ConfirmModal
          open={showLeaveConfirm}
          title="페이지를 나가시겠어요?"
          description={'페이지를 나가면,\n작성한 내용이 모두 사라져요'}
          cancelText="나가기"
          confirmText="이어서 작성하기"
          onCancel={() => navigate(-1)}
          onConfirm={() => setShowLeaveConfirm(false)}
        />
      </div>
    )
  }

  // ── 계좌 등록 / 수정 화면 ────────────────────────────────────
  const bankResults = searchBanks(bankQuery)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title={isEdit ? '계좌 수정하기' : '새로운 계좌 등록하기'} onBack={() => setView('list')} />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-[18px] pb-[120px] pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3-sb text-black">선물 준비에 사용할 계좌를 {isEdit ? '수정해' : '등록해'} 주세요</h2>
          <p className="text-caption1-r text-gray-600">친구들이 선물에 함께할 때 이 계좌 정보를 확인할 수 있어요</p>
        </div>

        {/* 은행명 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">
            은행명 <span className="text-pink-500">*</span>
          </p>
          <button
            type="button"
            onClick={() => setShowBankSheet(true)}
            className="flex h-12 items-center justify-between rounded-lg bg-background px-4"
          >
            <span className={form.bankName ? 'text-b1-r text-black' : 'text-b1-r text-gray-400'}>
              {form.bankName || '은행명을 정확히 선택해주세요'}
            </span>
            <SearchIcon className="size-6 shrink-0 text-gray-400" />
          </button>
        </div>

        {/* 계좌번호 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">
            계좌번호 <span className="text-pink-500">*</span>
          </p>
          <div className="flex h-12 items-center rounded-lg bg-background px-4">
            <input
              type="text"
              inputMode="numeric"
              value={form.accountNumber}
              onChange={e => setForm({ ...form, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="본인의 계좌번호를 정확히 입력해주세요"
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 예금주 */}
        <div className="flex flex-col gap-2">
          <p className="text-b1-m text-black">
            예금주 <span className="text-pink-500">*</span>
          </p>
          <div className="flex h-12 items-center rounded-lg bg-background px-4">
            <input
              type="text"
              value={form.accountHolder}
              onChange={e => setForm({ ...form, accountHolder: e.target.value.replace(/[0-9]/g, '') })}
              placeholder="예금주 이름을 정확히 입력해 주세요"
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <StickyBottomBar>
        <Button
          className="pointer-events-auto"
          disabled={!isFormValid}
          onClick={isEdit ? handleSubmitEdit : () => setShowConfirm(true)}
        >
          {isEdit ? '수정 완료' : '등록 완료'}
        </Button>
      </StickyBottomBar>

      {/* 은행 선택 시트 */}
      <BottomSheet open={showBankSheet} size="half" onClose={() => { setShowBankSheet(false); setBankQuery('') }}>
        <div className="flex h-full flex-col gap-3 pt-2">
          <p className="text-h3-sb text-black">은행명</p>
          <div className="flex h-12 items-center gap-4 rounded-lg bg-background px-4">
            <input
              autoFocus
              type="text"
              value={bankQuery}
              onChange={e => setBankQuery(e.target.value)}
              placeholder="은행명을 검색 후 선택해주세요"
              className="flex-1 bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
            />
            <SearchIcon className="size-6 shrink-0 text-gray-400" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {bankResults.length === 0 ? (
              <p className="py-6 text-center text-caption1-r text-gray-400">일치하는 은행이 없어요</p>
            ) : (
              bankResults.map(bank => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, bankName: bank.name })
                    setShowBankSheet(false)
                    setBankQuery('')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-b1-r text-black"
                >
                  <span>{bank.emoji}</span>
                  <span>{bank.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </BottomSheet>

      {/* 등록 확인 모달 — 돈이 오가는 단계라 한 번 더 확인 */}
      <ConfirmModal
        open={showConfirm}
        title="계좌 정보를 확인해 주세요"
        description={'입력한 계좌로 선물 금액이 전달돼요.\n계좌 정보가 맞는지 다시 확인해 주세요'}
        cancelText="다시 확인할게요"
        confirmText="네, 확인했어요"
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmAdd}
      />
    </div>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M9.99967 6.66807L3.33301 13.3347V16.6681L6.66634 16.668L13.333 10.0014M9.99967 6.66807L12.3902 4.27752L12.3916 4.2761C12.7207 3.94703 12.8855 3.78221 13.0755 3.72047C13.2429 3.66609 13.4232 3.66609 13.5906 3.72047C13.7804 3.78216 13.9451 3.9468 14.2737 4.27541L15.7235 5.72524C16.0535 6.05525 16.2186 6.22033 16.2804 6.41061C16.3348 6.57798 16.3348 6.75826 16.2804 6.92563C16.2186 7.11577 16.0538 7.2806 15.7243 7.61015L15.7235 7.61085L13.333 10.0014M9.99967 6.66807L13.333 10.0014" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}
