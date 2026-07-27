import { Routes, Route } from 'react-router-dom'
import SplashPage from './pages/splash/SplashPage'
import LoginPage from './pages/login/LoginPage'
import ProfileSetupPage from './pages/signup/ProfileSetupPage'
import HomePage from './pages/home/HomePage'
import WishPage from './pages/wish/WishPage'
import WishEditPage from './pages/wish/WishEditPage'
import MyPage from './pages/my/MyPage'
import ProfileEditPage from './pages/my/ProfileEditPage'
import AccountListPage from './pages/my/AccountListPage'
import AccountFormPage from './pages/my/AccountFormPage'
import FundingCreatePage from './pages/FundingCreatePage';
import GiftAboutPage from './pages/gift-about/GiftAboutPage'
import GiftCreateMyPage from './pages/gift-create/GiftCreateMyPage'
import GiftCreateTogetherPage from './pages/gift-create/GiftCreateTogetherPage'
import InvitationPage from './pages/invitation/InvitationPage'
import FundingDetailPage from './pages/funding/FundingDetailPage'
import FundingEditSelectPage from './pages/funding/FundingEditSelectPage'
import FundingEditStepPage from './pages/funding/FundingEditStepPage'
import MessagesPage from './pages/funding/MessagesPage'
import ParticipatePage from './pages/participate/ParticipatePage'
import CompletePage from './pages/participate/CompletePage'
import GroupPage from './pages/group/GroupPage'
import CandidatesPage from './pages/group/CandidatesPage'
import ParticipantsPage from './pages/group/ParticipantsPage'
import LetterPage from './pages/group/LetterPage'
import SettlePage from './pages/group/SettlePage'
import CandidateNewPage from './pages/group/CandidateNewPage'
import ReviewWritePage from './pages/gift-review/ReviewWritePage'
import ReviewCompletePage from './pages/gift-review/ReviewCompletePage'
import GiftReviewDetailPage from './pages/gift-review/GiftReviewDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/profile" element={<ProfileSetupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/wish" element={<WishPage />} />
      <Route path="/wish/:id/edit" element={<WishEditPage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/my/profile" element={<ProfileEditPage />} />
      <Route path="/my/accounts" element={<AccountListPage />} />
      <Route path="/my/accounts/new" element={<AccountFormPage />} />
      <Route path="/my/accounts/:id/edit" element={<AccountFormPage />} />
      <Route path="/funding/create" element={<FundingCreatePage />} />
      <Route path="/gift/about" element={<GiftAboutPage />} />
      <Route path="/gift/create/my" element={<GiftCreateMyPage />} />
      <Route path="/gift/create/together" element={<GiftCreateTogetherPage />} />
      <Route path="/funding/:id/invitation" element={<InvitationPage />} />
      <Route path="/funding/:id" element={<FundingDetailPage />} />
      <Route path="/funding/:id/edit" element={<FundingEditSelectPage />} />
      <Route path="/funding/:id/edit/:step" element={<FundingEditStepPage />} />
      <Route path="/funding/:id/messages" element={<MessagesPage />} />
      <Route path="/funding/:id/participate" element={<ParticipatePage />} />
      <Route path="/funding/:id/complete" element={<CompletePage />} />
      {/* H 섹션: 함께 선물 참여 */}
      <Route path="/group/:id" element={<GroupPage />} />
      <Route path="/group/:id/candidates" element={<CandidatesPage />} />
      <Route path="/group/:id/candidates/new" element={<CandidateNewPage />} />
      <Route path="/group/:id/participants" element={<ParticipantsPage />} />
      <Route path="/group/:id/letter" element={<LetterPage />} />
      <Route path="/group/:id/settle" element={<SettlePage />} />
      <Route path="/gift/review/write/:type" element={<ReviewWritePage />} />
      <Route path="/gift/review/complete/:type" element={<ReviewCompletePage />} />
      <Route path="/gift/review/:id" element={<GiftReviewDetailPage />} />
    </Routes>
  )
}

export default App;