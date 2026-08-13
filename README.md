# ✉️ ToGet - 선물 펀딩 서비스 (Frontend)

> UMC 10기 **투겟(ToGet)** 팀에서 설계한 선물 펀딩 서비스의 프론트엔드 저장소입니다.
> 마음을 모아 함께 선물을 준비하는 모바일 웹 서비스를 목표로 합니다.

## 📑 목차

- [프로젝트 소개](#-프로젝트-소개)
- [프로젝트 팀원](#-프로젝트-팀원)
- [Tech Stack](#️-tech-stack)
- [실행 방법](#-실행-방법)
- [프로젝트 구조](#-프로젝트-구조)
- [화면 흐름](#-화면-흐름)
- [상태 관리 & 데이터](#-상태-관리--데이터)
- [브랜치 · 커밋 · PR 컨벤션](#-브랜치--커밋--pr-컨벤션)
- [배포](#-배포)
- [관련 문서](#-관련-문서)


## 🎁 프로젝트 소개

ToGet은 생일·졸업·집들이 등 특별한 날의 선물을 **여러 사람이 함께 준비**할 수 있도록 돕는 선물 펀딩 서비스입니다.<br><br>
받고 싶은 선물을 모아 선물 페이지(펀딩)를 만들고, 초대장을 공유해 친구들과 함께 금액을 모으고, 선물이 전달된 뒤에는 후기와 감사 인사를 남기는 흐름을 제공합니다. <br>

- 현재 저장소는 모바일 우선(Mobile-first) 반응형 웹으로 구현되었으며, 최대 너비 **402px** 기준의 모바일 레이아웃을 중심으로 설계되었습니다.

- **스플래시 → 홈(비로그인도 열람 가능) → 로그인(카카오/구글, 신규 가입자는 프로필 설정) → 위시 등록/수정 → 마이페이지(내 정보 · 계좌 관리) → 선물 만들기(내 선물/함께 선물) → 펀딩 상세/참여/후기 · 함께 선물 참여(후보 투표/정산) → 관리자(상품·초대장 테마 관리)**까지 전체 서비스 흐름의 화면이 구현되어 있습니다. <br>
- **모든 화면이 실제 백엔드 API와 연동**되어 있습니다(Mock 데이터 없음).


## 👥 프로젝트 팀원

<table>
  <tr height="160px">
    <td width="300px" align="center">
      <a href="https://github.com/jhy335501">
        <img height="120px" width="120px" src="https://avatars.githubusercontent.com/jhy335501" />
      </a>
    </td>
    <td width="300px" align="center">
      <a href="https://github.com/snow-jun-0">
        <img height="120px" width="120px" src="https://avatars.githubusercontent.com/snow-jun-0" />
      </a>
    </td>
    <td width="300px" align="center">
      <a href="https://github.com/HongYeonLee">
        <img height="120px" width="120px" src="https://avatars.githubusercontent.com/HongYeonLee" />
      </a>
    </td>
    <td width="300px" align="center">
      <a href="https://github.com/sumin0423">
        <img height="120px" width="120px" src="https://avatars.githubusercontent.com/sumin0423" />
      </a>
    </td>
    <td width="300px" align="center">
      <a href="https://github.com/OCJune">
        <img height="120px" width="120px" src="https://avatars.githubusercontent.com/OCJune" />
      </a>
    </td>
  </tr>
  <tr height="30px">
    <td align="center"><a href="https://github.com/jhy335501"><b>장하영</b></a></td>
    <td align="center"><a href="https://github.com/snow-jun-0"><b>우준영</b></a></td>
    <td align="center"><a href="https://github.com/HongYeonLee"><b>이홍연</b></a></td>
    <td align="center"><a href="https://github.com/sumin0423"><b>최수민</b></a></td>
    <td align="center"><a href="https://github.com/OCJune"><b>오창준</b></a></td>
  </tr>
  <tr height="30px">
    <td align="center">초대장 · 펀딩 상세/참여 · 메세지 · 함께 선물 참여</td>
    <td align="center">선물 만들기 진입 · 선물 후기</td>
    <td align="center">온보딩 · 홈 · 마이 · 공통/API</td>
    <td align="center">선물 만들기 플로우(5단계)</td>
    <td align="center">위시(위시리스트) 기능</td>
  </tr>
</table>

## ⚙️ Tech Stack

> 아래 버전은 `package.json` 기준입니다.

| 구분 | 기술 | 버전 |
| --- | --- | --- |
| Language | TypeScript | `6.0.2` |
| Library | React / React DOM | `19.2.7` |
| Routing | react-router-dom | `7.18.1` |
| 서버 상태 | @tanstack/react-query | `5.101.2` |
| 클라이언트 상태 | zustand | `5.0.14` |
| HTTP 클라이언트 | axios | `1.18.1` |
| 아이콘 | lucide-react (+ 자체 SVG 아이콘 컴포넌트) | `1.23.0` |
| Styling | Tailwind CSS | `4.3.2` |
| | @tailwindcss/vite | `4.3.2` |
| Build Tool | Vite | `8.1.1` |
| | @vitejs/plugin-react | `6.0.3` |
| Lint | ESLint / typescript-eslint | `10.6.0` / `8.62.0` |
| Package Manager | pnpm | `pnpm-lock.yaml` 사용 |
| Deploy | Vercel | GitHub Actions 연동 |

**상태 관리**: 인증은 React `Context API`(`AuthProvider`), 서버 상태는 `TanStack Query`, 화면 간 공유되는 클라이언트 전역 상태는 `Zustand`(`wishStore`, `fundingCreateStore`, `togetherCreateStore`)로 분리해 관리합니다. <br><br>
**데이터**: 인증·프로필·계좌·위시·펀딩(내 선물/함께 선물)·후기 등 모든 도메인이 `axios` 기반 `apiClient`로 **실제 API 연동**되어 있습니다.

## 🚀 실행 방법

이 프로젝트는 **pnpm**을 패키지 매니저로 사용합니다. (`pnpm-lock.yaml` 기준)

```bash
# 1. 저장소 클론
git clone https://github.com/UMC-toget/ToGet-FE.git
cd ToGet-FE

# 2. dev 브랜치로 이동 (통합 개발 브랜치)
git checkout dev

# 3. 의존성 설치
pnpm install

# 4. 개발 서버 실행 (http://localhost:5173)
pnpm dev

# 5. 프로덕션 빌드 (타입 체크 + 번들)
pnpm build

# 6. 빌드 결과 미리보기
pnpm preview

# 7. 린트 검사
pnpm lint
```

> ℹ️ 백엔드 주소는 `VITE_API_BASE_URL` 환경 변수로 주입합니다. (미설정 시 기본값 `https://dev.api.toget.kr`, `src/lib/apiClient.ts` 참고)
> 로컬에서 다른 백엔드를 바라보려면 `.env.local`에 `VITE_API_BASE_URL`을 지정하세요.
> Swagger 문서: [dev.api.toget.kr/swagger-ui](https://dev.api.toget.kr/swagger-ui/index.html)

## 📁 프로젝트 구조

```
src/
├── App.tsx                     # 라우트 정의 (Routes/Route)
├── main.tsx                    # 진입점 (QueryClientProvider + BrowserRouter + AuthProvider)
├── index.css                   # Tailwind + 디자인 토큰(@theme: 색상/타이포)
│
├── api/                        # 백엔드 API 모듈 (axios, 16개 — 전부 실제 연동)
│   ├── auth.ts                  # 소셜 로그인/로그아웃/토큰 갱신
│   ├── users.ts                 # 프로필 조회/수정/탈퇴, 내 펀딩 목록
│   ├── userAccounts.ts          # 등록 계좌 CRUD + 은행 코드/라벨
│   ├── wishlists.ts             # 위시 CRUD
│   ├── fundings.ts / groupFundings.ts   # 내 선물 / 함께 선물 생성·조회·수정
│   ├── contributions.ts         # 참여(펀딩) 제출
│   ├── reviews.ts               # 선물 후기
│   ├── invitationThemes.ts      # 초대장 배경·캐릭터 (관리자 CRUD 포함)
│   ├── products.ts              # 관리자 상품 관리
│   └── metaApi.ts / decorations.ts / images.ts / webImages.ts 등
│
├── lib/                        # 통신/인증/분석 인프라
│   ├── apiClient.ts             # axios 인스턴스 + 토큰 주입/401 자동 갱신 인터셉터
│   ├── queryClient.ts           # TanStack Query 클라이언트
│   ├── tokenStorage.ts          # access/refresh 토큰 localStorage 관리
│   ├── oauthConfig.ts / kakao.ts   # 구글/카카오 소셜 로그인 설정 및 SDK 연동
│   ├── admin.ts                 # 관리자 이메일 판별
│   └── analytics.ts             # GA4 이벤트 트래킹
│
├── store/                      # Zustand 스토어
│   ├── fundingCreateStore.ts    # 내 선물 만들기 5단계 입력값 + 수정 스냅샷
│   ├── togetherCreateStore.ts   # 함께 선물 만들기 입력값
│   └── wishStore.ts             # 위시 등록/해제 상태
│
├── contexts/                   # AuthProvider (로그인 상태 Context)
├── hooks/                      # useAuth, useMyProfile, useUserAccounts, useRequireAuth, useRequireAdmin 등 (Query/가드 훅)
├── constants/                  # 전역 상수 (예: fundingFieldLimits.ts)
├── types/                      # funding.ts 등 공용 타입
│
├── components/
│   ├── common/                 # 공통 UI (Button/TextField/Header/BottomSheet/BottomNav/MenuRow/
│   │                           #  ConfirmModal/Toast/LetterCard/DefaultAvatar/CategoryChips/
│   │                           #  PhotoActionSheet·ImageCropper(이미지 등록/크롭) 등)
│   ├── create/                 # 내 선물(Step1~5)·함께 선물(TogetherStep1~3) 개설 폼 스텝
│   ├── invitation/             # 초대장 비주얼 드롭인 컴포넌트 (InvitationVisual 등, E01·J 공용)
│   └── icons/                  # SVG 아이콘 컴포넌트
│
├── pages/
│   ├── splash/ login/ signup/  # 온보딩 (스플래시/소셜 로그인/프로필 설정)
│   ├── home/                   # 홈 (둘러보기·내 펀딩 목록)
│   ├── wish/                   # 위시 조회/등록(WishCreatePage)/검색(WishSearchPage)/수정
│   ├── my/                     # 마이페이지·내 정보 수정·계좌·내 펀딩 목록·관리자(상품/초대장 테마)
│   ├── gift-about/             # 선물 페이지 이용 방법
│   ├── gift-create/            # 선물 만들기 진입 시트 + 함께 선물 만들기 플로우
│   ├── FundingCreatePage.tsx   # 내 선물 만들기 5단계 플로우
│   ├── funding/                # 펀딩 상세·수정·메세지
│   ├── invitation/             # 펀딩 초대장
│   ├── participate/            # 펀딩 참여(4단계)·완료
│   ├── group/                  # 함께 선물 참여 — H섹션
│   │                           #  (GroupPage/CandidatesPage/CandidateNewPage/ConfirmPage/
│   │                           #   ParticipantsPage/LetterPage/SettlePage/HostSettlePage/GroupEditPage)
│   ├── gift-review/            # 선물 후기 작성(내용→초대장)/완료/조회
│   └── legal/                  # 개인정보처리방침·이용약관
│
├── assets/                     # 로고/캐릭터/은행 로고 등 (+ mock 이미지)
└── utils/                      # formatDate, cropImage, recommendAmounts, colorOpacity 등 유틸
```

## 🧭 화면 흐름

```
[/] SplashPage
   │  4초 후 자동 이동 (replace) — 비로그인 사용자도 로그인 없이 서비스를
   │  볼 수 있어야 한다는 구글 OAuth 브랜딩 요건상, 로그인이 아니라 홈으로 이동
   ▼
[/home] HomePage (B01 비로그인 / B02 로그인) ──[배너 "로그인" 버튼]──▶ [/login] LoginPage
   │                                                                       │ 카카오/구글
   │                                                        (신규 가입자) [/signup/profile]
   │                                                                       │
   │◀──────────────────────────────────────────────────────────────────────┘
   │
   ├─[배너 "선물 페이지 만들기"]─▶ GiftCreateSheet(바텀시트) ─┬─▶ [/gift/create/my] 내 선물 5단계 개설
   │                                                          └─▶ [/gift/create/together] 함께 선물 개설
   │
        ┌─────────────────────────────────────┬──────────────────────────┤ BottomNav
        ▼                        ▼             ▼                          ▼
   [/wish] WishPage      (배너/+ 버튼)         [/my] MyPage         [/gift/about]
   위시 조회             [/wish/create] 등록     마이페이지            이용 방법
   [/wish/:id/edit] 수정  [/wish/search] 검색      │
                                                    ├─ [/my/fundings/my] 내 선물 목록
                                                    ├─ [/my/fundings/together] 함께 선물 목록
                                                    ├─ [/my/accounts] 계좌 관리
                                                    ├─ [/my/profile] 내 정보 수정
                                                    └─(관리자)─┬─ [/admin/products] 상품 관리
                                                               └─ [/admin/invitation-themes] 초대장 테마 관리

[/funding/:id] 펀딩 상세(개설자/참여자, 내 선물)
   ├── [/funding/:id/invitation]   초대장
   ├── [/funding/:id/edit], [/edit/:step]   수정
   ├── [/funding/:id/messages]     축하 메세지 전체보기
   ├── [/funding/:id/participate] → [/funding/:id/complete]   참여 4단계 → 완료
   └── [/gift/review/write/:type/:fundingId?] → .../invitation → [/gift/review/complete/:type/:fundingId?]
       후기 내용 작성 → 초대장 꾸미기 → 완료 → [/gift/review/:id/:fundingId?] 조회

[/group/:id] 함께 선물 메인 (H 섹션 — 그룹 펀딩 참여)
   ├── [/group/:id/candidates]                선물 후보 목록/투표 (최대 3표)
   │     ├── [/group/:id/candidates/new]         후보 등록 (공동관리자 이상)
   │     └── [/group/:id/candidates/:id], .../comments   후보 상세/댓글
   ├── [/group/:id/participants]              참여자 목록 (뷰/관리)
   ├── [/group/:id/confirm], .../edit         선물 확정
   ├── [/group/:id/letter]                    편지 남기기
   ├── [/group/:id/settle], .../settle/host   정산하기 (참여자/개설자 뷰)
   ├── [/group/:id/purchase-upload]           구매 인증 업로드
   ├── [/group/:id/messages]                  메세지 전체보기
   └── [/group/:id/edit], .../basic·account·invitation   선물 페이지 수정 (개설자 전용)
```

## 🗂 상태 관리 & 데이터

| 항목 | 방식 |
| --- | --- |
| 전역 인증 상태 | `AuthProvider` (Context) — `isLoggedIn`, `login()`, `logout()`, 토큰 만료 시 자동 로그아웃 구독 |
| 서버 상태 | `TanStack Query` — `useMyProfile`, `useUserAccounts` 등 (`lib/queryClient.ts`) |
| 클라이언트 전역 상태 | `Zustand` — `wishStore`(위시 등록/유형), `fundingCreateStore`(내 선물 만들기 5단계 입력값), `togetherCreateStore`(함께 선물 만들기 입력값) |
| 로컬 상태 | 각 페이지/컴포넌트의 `useState` (입력값, 시트 열림, 스텝, 필터 선택 등) |
| 화면 간 전달 | `react-router-dom`의 `navigate(state)` (마이페이지 토스트 메시지, 후기 데이터 등) |
| 토큰 저장 | `localStorage` (`toget_access_token` / `toget_refresh_token`, `lib/tokenStorage.ts`) |

**API 연동 현황**

`src/api/` 아래 16개 모듈(`auth` `users` `userAccounts` `wishlists` `fundings` `groupFundings` `contributions` `reviews` `decorations` `individualDraft` `togetherDraft` `invitationThemes` `products` `metaApi` `images` `webImages`) 전부 `apiClient`(axios) 기반의 **실제 백엔드 연동**입니다.

| 도메인 | 상태 |
| --- | --- |
| 소셜 로그인(카카오/구글)·로그아웃·토큰 자동 갱신 | ✅ 연동 |
| 프로필 조회/수정/탈퇴·계좌 CRUD | ✅ 연동 |
| 위시 CRUD | ✅ 연동 |
| 내 선물·함께 선물 페이지 생성/수정/임시저장 | ✅ 연동 |
| 함께 선물 대시보드·선물 후보 조회/투표/등록·정산 조회/입금 신고/상태 변경·참여자 역할 변경 | ✅ 연동 |
| 초대장 테마·캐릭터 (조회 + 관리자 등록/수정/삭제) | ✅ 연동 |
| 선물 후기 작성/조회 | ✅ 연동 |
| 관리자 상품 관리 (`/admin/products`) | ✅ 연동 |
| GA4(Google Analytics) 이벤트 트래킹 | ✅ 연동 (`VITE_GA_MEASUREMENT_ID` 미설정 시 비활성) |

> 모든 API 응답은 `ApiEnvelope<T>`(`{ isSuccess, code, message, result }`) 형태이며, `apiClient`의 `unwrap()`이 `result`만 반환하고 실패 시 `ApiError`를 던집니다. <br> <br>
> `apiClient`는 요청에 access token을 주입하고, 401 응답 시 refresh token으로 자동 재발급 후 원요청을 재시도합니다.

## 🌿 브랜치 · 커밋 · PR 컨벤션

[📄깃 워크플로우 노션](https://app.notion.com/p/54781f992be583148d9f015b187a55ec?source=copy_link)

**브랜치**

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포용 고정 브랜치 (직접 push 금지) |
| `dev` | 통합 개발 브랜치 (feature 브랜치의 병합 대상) |
| `feat/#<이슈번호>-<slug>` | 기능 개발 (예: `feat/#10-home-page`) |
| `fix/#<이슈번호>-<slug>` | 버그 수정 |
| `chore/#<이슈번호>-<slug>` | 설정·문서·리팩토링 |

**커밋 메시지**

```
<prefix>: <내용>

예) feat: 홈 배너 UI 구현
    fix: 프로필 아이콘 깨짐 수정
    chore: 디자인 토큰 및 폴더 구조 세팅
```

prefix: `feat` · `fix` · `docs` · `refactor` · `test` · `chore` · `ci` · `build`

**라벨**

이슈·PR 모두 `prefix`(✨feat/🐛fix/📄docs/♻️refactor/🧪test/🧹chore/🔄ci/🛠️build, 서버 API 연동 시 📢API 추가) · `status`(status:todo/in-progress/review/done/blocked) · `priority`(priority:high/mid/low) 3개 라벨을 붙입니다.

**PR**

- Base 브랜치는 `dev`로 설정 (`main`은 `dev`에서만 PR 생성 가능 — `main-merge-guard` 워크플로우가 강제)
- 이슈 번호 연결(`closes #N`), Assignee 지정, 라벨 3종 지정
- 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`)의 체크리스트 준수
- 하나의 커밋에 하나의 논리적 변경

## 🚢 배포

- **플랫폼**: Vercel. Vercel 무료 플랜에서 GitHub **조직(Organization)** 저장소 연동 배포가 제한되어, 개인 저장소(`HongYeonLee/ToGet-FE`)를 미러로 두고 그쪽을 Vercel과 연동하는 방식으로 우회합니다.
- **배포 주소**: [`https://www.toget.kr`](https://www.toget.kr) (`to-get-fe.vercel.app` 등 Vercel 기본 도메인으로도 접근 가능)
- **GitHub Actions** (`.github/workflows/`)
  - `deploy.yml` — `main` push 시 저장소 전체를 미러 저장소(`HongYeonLee/ToGet-FE`)의 `main`으로 push. Vercel은 이 미러 저장소 연동을 통해 실제 프로덕션 배포를 실행합니다.
  - `preview.yaml` — `main`/`dev` 대상 PR 생성 시 Vercel Preview 배포 후 PR에 미리보기 URL 코멘트
  - `main-merge-guard.yml` — `main` 대상 PR의 head 브랜치가 `dev`인지 검증(다른 브랜치의 직접 병합 차단)
  - `dev-to-main-release.yml` — `dev`에 머지됐지만 아직 `main`에 반영 안 된 PR이 5개 이상 쌓이면 release PR(dev → main)을 자동 생성
  - `close-issues-on-dev-merge.yaml` — `dev` 머지 시 PR 본문의 `closes #N`으로 연결된 이슈를 자동으로 닫음
  - `pr-status-done-on-merge.yml` — PR 머지 시 낡은 `status:*` 라벨을 정리하고 `status:done`으로 교체

> 환경 변수: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`(저장소 Secrets), `VITE_API_BASE_URL`(백엔드 주소), `VITE_GA_MEASUREMENT_ID`(GA4 측정 ID, 선택). <br>


## 📚 관련 문서

- [PR 템플릿](./.github/PULL_REQUEST_TEMPLATE.md)
- [이슈 템플릿](./.github/ISSUE_TEMPLATE)
- [디자인 (Figma)](https://www.figma.com/design/RUHJugPsPKg5TRpbYn7VdG)
- [백엔드 Swagger 문서](https://dev.api.toget.kr/swagger-ui/index.html)
