import { Routes, Route } from 'react-router-dom'
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
import ParticipantViewPage from './pages/group/ParticipantViewPage'
import LetterPage from './pages/group/LetterPage'
import SettlePage from './pages/group/SettlePage'
import HostSettlePage from './pages/group/HostSettlePage'
import CandidateDetailPage from './pages/group/CandidateDetailPage'
import CandidateCommentsPage from './pages/group/CandidateCommentsPage'
import CandidateNewPage from './pages/group/CandidateNewPage'
import ConfirmPage from './pages/group/ConfirmPage'
import ConfirmEditPage from './pages/group/ConfirmEditPage'
import GroupEditPage from './pages/group/GroupEditPage'
import GroupEditBasicPage from './pages/group/GroupEditBasicPage'
import GroupEditAccountPage from './pages/group/GroupEditAccountPage'
import GroupEditInvitationPage from './pages/group/GroupEditInvitationPage'
import PurchaseUploadPage from './pages/group/PurchaseUploadPage'
import GroupMessagesPage from './pages/group/GroupMessagesPage'
import ReviewWritePage from './pages/gift-review/ReviewWritePage'
import ReviewCompletePage from './pages/gift-review/ReviewCompletePage'
import GiftReviewDetailPage from './pages/gift-review/GiftReviewDetailPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import TermsOfServicePage from './pages/legal/TermsOfServicePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/profile" element={<ProfileSetupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/wish" element={<WishPage />} />
      <Route path="/wish/:id/edit" element={<WishEditPage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/my/profile" element={<ProfileEditPage />} />
      <Route path="/my/accounts" element={<AccountListPage />} />
      <Route path="/my/accounts/new" element={<AccountFormPage />} />
      <Route path="/my/accounts/:id/edit" element={<AccountFormPage />} />
      <Route path="/gift/about" element={<GiftAboutPage />} />
      <Route path="/gift/create/my" element={<FundingCreatePage />} />
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
      <Route path="/group/:id/candidates/:candidateId" element={<CandidateDetailPage />} />
      <Route path="/group/:id/candidates/:candidateId/comments" element={<CandidateCommentsPage />} />
      <Route path="/group/:id/candidates/new" element={<CandidateNewPage />} />
      <Route path="/group/:id/participants" element={<ParticipantViewPage />} />
      <Route path="/group/:id/participants/manage" element={<ParticipantsPage />} />
      <Route path="/group/:id/letter" element={<LetterPage />} />
      <Route path="/group/:id/settle" element={<SettlePage />} />
      <Route path="/group/:id/settle/host" element={<HostSettlePage />} />
      <Route path="/gift/review/write/:type/:fundingId?" element={<ReviewWritePage />} />
      <Route path="/group/:id/confirm" element={<ConfirmPage />} />
      <Route path="/group/:id/confirm/edit" element={<ConfirmEditPage />} />
      <Route path="/group/:id/edit" element={<GroupEditPage />} />
      <Route path="/group/:id/edit/basic" element={<GroupEditBasicPage />} />
      <Route path="/group/:id/edit/account" element={<GroupEditAccountPage />} />
      <Route path="/group/:id/edit/invitation" element={<GroupEditInvitationPage />} />
      <Route path="/group/:id/purchase-upload" element={<PurchaseUploadPage />} />
      <Route path="/group/:id/messages" element={<GroupMessagesPage />} />
      <Route path="/gift/review/complete/:type" element={<ReviewCompletePage />} />
      <Route path="/gift/review/:id/:fundingId?" element={<GiftReviewDetailPage />} />
    </Routes>
  )
}

export default App;