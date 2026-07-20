# ✉️ ToGet - 선물 펀딩 서비스 (Frontend)

> UMC 10기 **투겟(ToGet)** 팀에서 설계한 선물 펀딩 서비스의 프론트엔드 저장소입니다.
> 마음을 모아 함께 선물을 준비하는 모바일 웹 서비스를 목표로 합니다.

<br />

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

<br />

## 🎁 프로젝트 소개

ToGet은 생일·졸업·집들이 등 특별한 날의 선물을 **여러 사람이 함께 준비**할 수 있도록 돕는 선물 펀딩 서비스입니다.
현재 저장소는 모바일 우선(Mobile-first) 반응형 웹으로 구현되었으며, 최대 너비 **402px** 기준의 모바일 레이아웃을 중심으로 설계되었습니다.

이번 단계에서 구현된 핵심 화면은 **스플래시 → 로그인 → 프로필 설정(회원가입) → 홈 → 마이페이지 → 내 정보 수정** 흐름이며,
모든 데이터는 Mock 데이터를 기반으로 렌더링되고, 실제 API 연동 지점은 코드 내 `// TODO` 주석으로 표시되어 있습니다.

<br />

## 💁‍♂️ 프로젝트 팀원

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
</table>

<br />

## ⚙️ Tech Stack

> 아래 버전은 `package.json` 기준입니다. (교차 검증 완료)

| 구분 | 기술 | 버전 |
| --- | --- | --- |
| Language | TypeScript | `~6.0.2` |
| Library | React / React DOM | `^19.2.7` |
| Routing | react-router-dom | `^7.18.1` |
| Styling | Tailwind CSS | `^4.3.2` |
| | @tailwindcss/vite | `^4.3.2` |
| Build Tool | Vite | `^8.1.1` |
| | @vitejs/plugin-react | `^6.0.3` |
| Lint | ESLint / typescript-eslint | `^10.6.0` / `^8.62.0` |
| Package Manager | pnpm | `pnpm-lock.yaml` 사용 |
| Deploy | Vercel | GitHub Actions 연동 |

**상태 관리**: React `Context API` + `useState` (전역 로그인 상태는 `AuthProvider`로 관리)
**데이터**: 현재 전량 Mock 데이터 기반 — 별도 데이터 패칭/상태 라이브러리(TanStack Query, Zustand, axios 등)는 **미설치** 상태입니다.

<br />

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

> ℹ️ 현재 API 연동 전 단계로 별도의 환경 변수(`.env`)는 필요하지 않습니다.
> 소셜 로그인/회원/상품 API 연동 시 `VITE_` 접두사 환경 변수를 추가하고 이 항목을 갱신해 주세요.

<br />

## 📁 프로젝트 구조

```
src/
├── App.tsx                     # 라우트 정의 (Routes/Route)
├── main.tsx                    # 진입점 (BrowserRouter + AuthProvider)
├── index.css                   # Tailwind + 디자인 토큰(@theme: 색상/타이포)
│
├── assets/                     # 로고, 캐릭터 SVG, 소셜 아이콘
│   └── mock/                   # 상품 목업 이미지 (product-*.png)
│
├── components/
│   ├── common/                 # 공통 UI 컴포넌트
│   │   ├── Button.tsx           # 하단 CTA 버튼 (h52, radius12)
│   │   ├── TextField.tsx        # 라벨 + 글자수 카운터 입력창
│   │   ├── Header.tsx           # 상단 네비게이션 바 (뒤로가기/타이틀)
│   │   ├── BottomSheet.tsx      # 하단에서 올라오는 시트 (딤 + 그래버)
│   │   ├── BottomNav.tsx        # 하단 탭 네비 + 플로팅(+) 버튼
│   │   ├── MenuRow.tsx          # 메뉴 리스트 행
│   │   ├── ConfirmModal.tsx     # 확인 모달 (동의 체크박스 옵션)
│   │   └── Toast.tsx            # 하단 스낵바 토스트
│   └── icons/                  # SVG 아이콘 컴포넌트 (Home/Gift/Profile/Check 등)
│
├── contexts/
│   ├── auth.ts                 # AuthContext 정의
│   └── AuthProvider.tsx        # 로그인 상태 Provider
│
├── hooks/
│   └── useAuth.ts              # 로그인 상태/login/logout 훅
│
├── pages/
│   ├── splash/                 # SplashPage (진입 스플래시)
│   ├── login/                  # LoginPage (카카오/구글 소셜 로그인)
│   ├── signup/                 # ProfileSetupPage + TermsBottomSheet + ProfileAvatar
│   ├── home/                   # HomePage + HomeBanner + GiftBrowseSection
│   │                           #  + ProductCard + PriceFilterSheet + products.ts(Mock)
│   └── my/                     # MyPage + ProfileEditPage + mockUser.ts(Mock)
│
└── utils/
    └── formatDate.ts           # 날짜 포맷 유틸 (YYYY.MM.DD)
```

<br />

## 🧭 화면 흐름

```
[/] SplashPage
   │  2초 후 자동 이동 (replace)
   ▼
[/login] LoginPage ──── 카카오/구글 로그인 ────▶ [/signup/profile] ProfileSetupPage
                                                          │  약관 동의 후 "동의하고 시작하기"
                                                          ▼
                                                   [/home] HomePage ◀──┐
                                                          │            │ BottomNav
                                                          ▼            │
                                                   [/my] MyPage ───────┘
                                                          │  프로필 클릭
                                                          │  (로그인 시)          (비로그인 시 → /login)
                                                          ▼
                                            [/my/profile] ProfileEditPage
                                                          │  로그아웃 / 계정 삭제
                                                          ▼
                                            [/my] MyPage (Toast 노출)
```

전체 화면 목록, 진입 경로, 라우팅 표, 담당자, 공통 컴포넌트 사용 방식 등 상세 내용은
**[프론트엔드 명세서](./프론트엔드-명세서.md)** 를 참고하세요.

<br />

## 🗂 상태 관리 & 데이터

| 항목 | 방식 |
| --- | --- |
| 전역 상태 | `AuthProvider` (Context) — `isLoggedIn`, `login()`, `logout()` |
| 로컬 상태 | 각 페이지/컴포넌트의 `useState` (닉네임 입력, 시트 열림, 필터 선택 등) |
| 화면 간 전달 | `react-router-dom`의 `navigate(state)` (예: 마이페이지 토스트 메시지) |
| 데이터 소스 | Mock — `products.ts`, `mockUser.ts`, `HomeBanner`의 닉네임 상수 |
| API 연동 | 미연동. 연동 지점은 코드 내 `// TODO` 주석으로 표시 |

<br />

## 🌿 브랜치 · 커밋 · PR 컨벤션

**브랜치**

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포용 고정 브랜치 (직접 push 금지) |
| `dev` | 통합 개발 브랜치 (feature 브랜치의 병합 대상) |
| `feat/#<이슈번호>-<slug>` | 기능 개발 (예: `feat/#10-home-page`) |
| `fix/#<이슈번호>-<slug>` | 버그 수정 (예: `fix/#14-profile-icon`) |
| `chore/#<이슈번호>-<slug>` | 설정·문서·리팩토링 |

> ⚠️ 고정 브랜치명은 `main`으로 통일합니다. (`master` 사용 금지)

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

<br />

## 🚢 배포

- **플랫폼**: Vercel
- **자동화**: GitHub Actions
  - `preview.yaml` — `main`/`dev` 대상 PR 생성 시 Vercel Preview 배포 후 PR에 미리보기 URL 코멘트
  - `deploy.yml` — `main` push 시 배포 파이프라인 실행
- **배포 주소**: `https://…` *(운영 URL 확정 후 기입 예정)*

> 환경 변수(`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)는 저장소 Secrets로 관리됩니다.

<br />

## 📚 관련 문서

- [프론트엔드 명세서](./프론트엔드-명세서.md) — 화면 목록 · 라우팅 · 공통 컴포넌트 · 상태 관리 · 트러블 슈팅
- [PR 템플릿](./.github/PULL_REQUEST_TEMPLATE.md)
- [이슈 템플릿](./.github/ISSUE_TEMPLATE)
- [디자인 (Figma)](https://www.figma.com/design/RUHJugPsPKg5TRpbYn7VdG)
