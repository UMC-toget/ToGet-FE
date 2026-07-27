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

- **스플래시 → 로그인(카카오/구글) → 프로필 설정(회원가입) → 홈(선물 둘러보기 · 내가 개최한 선물 모으기) → 위시 등록/수정 → 마이페이지(내 정보 · 계좌 관리) → 선물 만들기 → 펀딩 상세/참여/후기**까지 전체 서비스 흐름의 화면이 구현되어 있습니다. <br>
- **프로필·계좌·내 펀딩 목록 등 일부 도메인은 실제 백엔드 API와 연동**되고 상품·위시·펀딩 등 나머지는 Mock 데이터로 렌더링됩니다. <br>

> 소셜 로그인·로그아웃은 클라이언트 구현이 별도 브랜치에 완료되어 있으나 백엔드 데이터베이스 미구축으로 인해 `dev`에는 아직 병합되지 않았습니다. <br>
> 미연동 지점은 코드 내 `// TODO` 주석으로 표시되어 있습니다.


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
  </tr>
  <tr height="30px">
    <td align="center"><a href="https://github.com/jhy335501"><b>장하영</b></a></td>
    <td align="center"><a href="https://github.com/snow-jun-0"><b>우준영</b></a></td>
    <td align="center"><a href="https://github.com/HongYeonLee"><b>이홍연</b></a></td>
    <td align="center"><a href="https://github.com/sumin0423"><b>최수민</b></a></td>
  </tr>
  <tr height="30px">
    <td align="center">초대장 · 펀딩 상세/참여 · 메세지</td>
    <td align="center">선물 만들기 진입 · 선물 후기</td>
    <td align="center">온보딩 · 홈 · 위시 · 마이 · 공통/API</td>
    <td align="center">선물 만들기 플로우(5단계)</td>
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

**상태 관리**: 인증은 React `Context API`(`AuthProvider`), 서버 상태는 `TanStack Query`, 화면 간 공유되는 클라이언트 전역 상태는 `Zustand`(`wishStore`, `fundingCreateStore`)로 분리해 관리합니다. <br><br>
**데이터**: 프로필·계좌·토큰 갱신은 `axios` 기반 `apiClient`로 **실제 API 연동**되어 있고, 상품·위시·펀딩·후기 등은 Mock 데이터를 사용합니다. 연동 여부는 각 페이지 상단 주석과 코드 내 `// TODO`로 표시되어 있습니다.

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
├── api/                        # 백엔드 API 모듈 (axios)
│   ├── auth.ts                  # 소셜 로그인
│   ├── users.ts                 # 프로필 조회/수정/탈퇴, 내 펀딩 목록
│   └── userAccounts.ts          # 등록 계좌 CRUD + 은행 코드/라벨
│
├── lib/                        # 통신 인프라
│   ├── apiClient.ts             # axios 인스턴스 + 토큰 주입/401 자동 갱신 인터셉터
│   ├── queryClient.ts           # TanStack Query 클라이언트
│   └── tokenStorage.ts          # access/refresh 토큰 localStorage 관리
│
├── store/                      # Zustand 스토어
│   ├── fundingCreateStore.ts    # 선물 만들기 5단계 입력값 + 수정 스냅샷
│   └── wishStore.ts             # 위시 등록/해제 상태
│
├── contexts/                   # AuthProvider (로그인 상태 Context)
├── hooks/                      # useAuth, useMyProfile, useUserAccounts (Query 훅)
├── types/                      # funding.ts 등 공용 타입
│
├── components/
│   ├── common/                 # 공통 UI (Button/TextField/Header/BottomSheet/BottomNav/
│   │                           #  MenuRow/ConfirmModal/Toast/LetterCard/DefaultAvatar)
│   ├── create/                 # 선물 만들기 5단계 + 이미지 등록/크롭 (Step1~5, PhotoActionSheet, ImageCropper)
│   └── icons/                  # SVG 아이콘 컴포넌트
│
├── pages/
│   ├── splash/ login/ signup/  # 온보딩 (스플래시/소셜 로그인/프로필 설정)
│   ├── home/ wish/             # 홈(둘러보기·내 펀딩) / 위시 (WishPage/WishEditPage/WishEditModeSheet)
│   ├── my/                     # 마이페이지·내 정보 수정·계좌 목록/등록/수정
│   ├── gift-about/             # 선물 페이지 이용 방법
│   ├── gift-create/            # 선물 만들기 진입 시트 (+ 임시 진입 페이지)
│   ├── FundingCreatePage.tsx   # 선물 만들기 5단계 플로우
│   ├── funding/                # 펀딩 상세·수정·메세지
│   ├── invitation/             # 펀딩 초대장
│   ├── participate/            # 펀딩 참여(4단계)·완료
│   └── gift-review/            # 선물 후기 작성/완료/조회
│
├── assets/                     # 로고/캐릭터/은행 로고 등 (+ mock 이미지)
└── utils/                      # formatDate, cropImage, recommendAmounts 등 유틸
```

## 🧭 화면 흐름

```
[/] SplashPage
   │  2초 후 자동 이동 (replace)
   ▼
[/login] LoginPage ── 카카오/구글 ──▶ [/signup/profile] (신규 가입자) ──▶ [/home] HomePage
                                                                              │
        ┌─────────────────────────────────────┬──────────────────────────┤ BottomNav
        ▼                        ▼             ▼                          ▼
   [/wish] WishPage      [/funding/create]   [/my] MyPage         [/gift/about]
   위시 조회 → 등록/수정   선물 만들기 5단계    마이페이지            이용 방법
   (카드 "⋮" → 수정/삭제)     │ 완료               │
                              ▼                    ▼
                     [/funding/:id] ◀──────  [/my/accounts] 계좌 관리 (API)
                     펀딩 상세(개설자/참여자)    [/my/profile] 내 정보 수정 (API)
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                 ▼
      [/participate]   [/messages]        [/gift/review/write/:type]
      펀딩 참여 4단계   메세지 전체보기      선물 후기 작성 → 완료 → 조회
```

전체 화면 목록, 진입 경로, 라우팅 표, 담당자, 공통 컴포넌트 사용 방식 등 상세 내용은
**[프론트엔드 명세서](./프론트엔드-명세서.md)** 를 참고하세요.

## 🗂 상태 관리 & 데이터

| 항목 | 방식 |
| --- | --- |
| 전역 인증 상태 | `AuthProvider` (Context) — `isLoggedIn`, `login()`, `logout()`, 토큰 만료 시 자동 로그아웃 구독 |
| 서버 상태 | `TanStack Query` — `useMyProfile`, `useUserAccounts` 등 (`lib/queryClient.ts`) |
| 클라이언트 전역 상태 | `Zustand` — `wishStore`(위시 등록/유형), `fundingCreateStore`(선물 만들기 5단계 입력값) |
| 로컬 상태 | 각 페이지/컴포넌트의 `useState` (입력값, 시트 열림, 스텝, 필터 선택 등) |
| 화면 간 전달 | `react-router-dom`의 `navigate(state)` (마이페이지 토스트 메시지, 후기 데이터 등) |
| 토큰 저장 | `localStorage` (`toget_access_token` / `toget_refresh_token`, `lib/tokenStorage.ts`) |

**API 연동 현황**

| 도메인 | 상태 |
| --- | --- |
| 프로필 조회/수정/탈퇴 (`/api/v1/users/me`) | ✅ 연동 |
| 계좌 CRUD (`/api/v1/user-accounts`) | ✅ 연동 |
| 토큰 자동 갱신 (`/api/v1/auth/tokens/refresh`) | ✅ 연동 |
| 내 펀딩 목록 (`/api/v1/users/me/fundings`) | ✅ 연동 |
| 로그아웃 (`/api/v1/auth/tokens/me` DELETE) | 🟡 `dev`는 클라이언트 토큰 정리만 수행. 서버 로그아웃 API 연동은 `feat/#131-logout-api` 브랜치에서 구현 완료, `dev` 미병합 |
| 소셜 로그인 (`/api/v1/auth/tokens/{provider}`) | 🟡 구글(`feat/#104-google-login`)·카카오(`feat/#129-kakao-login`) 모두 클라이언트 SDK 연동까지 완료됐으나 `dev` 미병합. 백엔드 이슈(구글: DB 미구축 / 카카오: 토큰 검증 오류 `USER401_1`)로 실제 로그인은 미검증 |
| 상품·위시·펀딩·후기 | ❌ Mock (연동 예정) |

> 모든 API 응답은 `ApiEnvelope<T>`(`{ isSuccess, code, message, result }`) 형태이며, `apiClient`의 `unwrap()`이 `result`만 반환하고 실패 시 `ApiError`를 던집니다. <br> <br>
> `apiClient`는 요청에 access token을 주입하고, 401 응답 시 refresh token으로 자동 재발급 후 원요청을 재시도합니다. <br><br>
> 연동 여부는 각 페이지 상단 주석과 코드 내 `// TODO`로도 표시되어 있습니다. 

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

prefix: `feat` · `fix` · `chore` · `docs` · `refactor` · `style`

**PR**

- Base 브랜치는 `dev`로 설정
- 이슈 번호 연결(`closes #N`), Assignee/Reviewer/라벨 지정
- 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`)의 체크리스트 준수
- 하나의 커밋에 하나의 논리적 변경

## 🚢 배포

- **플랫폼**: Vercel
- **자동화**: GitHub Actions
  - `preview.yaml` — `main`/`dev` 대상 PR 생성 시 Vercel Preview 배포 후 PR에 미리보기 URL 코멘트
  - `deploy.yml` — `main` push 시 배포 파이프라인 실행
- **배포 주소**: `https://to-get-fe.vercel.app/`

> 환경 변수: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`(저장소 Secrets), `VITE_API_BASE_URL`(백엔드 주소). <br>


## 📚 관련 문서

- [프론트엔드 명세서](./프론트엔드-명세서.md) — 화면 목록 · 라우팅 · 공통 컴포넌트 · 상태 관리 · 트러블 슈팅
- [PR 템플릿](./.github/PULL_REQUEST_TEMPLATE.md)
- [이슈 템플릿](./.github/ISSUE_TEMPLATE)
- [디자인 (Figma)](https://www.figma.com/design/RUHJugPsPKg5TRpbYn7VdG)
- [백엔드 Swagger 문서](https://dev.api.toget.kr/swagger-ui/index.html)
