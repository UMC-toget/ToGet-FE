import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import type { GroupFundingStatus } from '../../api/groupFundings'
import { MOCK_DASHBOARD } from './groupMock'
import { STATUS_LABELS, STATUS_ORDER } from './groupConstants'

// 접근: 개설자 전용 | 선물 페이지 수정하기 — 기본정보·계좌·초대장 수정 3단계 진입점
const EDIT_STEPS = [
  { label: '1단계 : 기본 정보', desc: '선물 페이지 제목, 날짜, 소개글, 페이지 이미지', path: 'basic' },
  { label: '2단계 : 계좌 정보', desc: '계좌 정보 수정', path: 'account' },
  { label: '3단계 : 초대장', desc: '초대장 제목, 내용, 색상, 캐릭터', path: 'invitation' },
]

export default function GroupEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<GroupFundingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getTogetherGiftDashboard(id)
      .then(data => setStatus(data.status))
      .catch(() => { if (import.meta.env.DEV) setStatus(MOCK_DASHBOARD.status) })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white">
      <Header title="선물 페이지 수정하기" />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-b2-r text-gray-400">불러오는 중...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-7 px-[18px] pb-[120px] pt-6">
          {/* 상태 선택 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-h3-sb text-black">수정하고 싶은 상태를 선택해 주세요</h2>
              <p className="text-caption1-r text-gray-600">함께 선물하기 상태를 수정할 수 있어요</p>
            </div>
            <div className="-mx-[18px] flex items-center gap-2 overflow-x-auto px-[18px] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STATUS_ORDER.map(s => (
                <span
                  key={s}
                  className={`shrink-0 rounded-full border px-4 py-2 text-b2-m ${
                    status === s
                      ? 'border-[#5B565A] bg-[#5B565A] text-white'
                      : 'border-[#C1BCC0] bg-white text-[#C1BCC0]'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </span>
              ))}
            </div>
          </div>

          {/* 단계 선택 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-h3-sb text-black">수정하고 싶은 단계를 선택해 주세요</h2>
              <p className="text-caption1-r text-gray-600">해당 단계의 내용을 수정할 수 있어요</p>
            </div>
            <div className="flex flex-col gap-3">
              {EDIT_STEPS.map(step => (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => navigate(`/group/${id}/edit/${step.path}`)}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-[14px] py-3"
                >
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-b1-m text-black">{step.label}</span>
                    <span className="text-b2-r text-gray-700">{step.desc}</span>
                  </div>
                  <ChevronRightIcon className="size-6 shrink-0 text-black" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 수정 완료 CTA */}
      <StickyBottomBar>
        <Button className="pointer-events-auto" onClick={() => navigate(-1)}>
          수정 완료
        </Button>
      </StickyBottomBar>
    </div>
  )
}
