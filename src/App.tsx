import { Routes, Route } from 'react-router-dom'
import SplashPage from './pages/splash/SplashPage'
import LoginPage from './pages/login/LoginPage'
import ProfileSetupPage from './pages/signup/ProfileSetupPage'
import HomePage from './pages/home/HomePage'
import MyPage from './pages/my/MyPage'
import ProfileEditPage from './pages/my/ProfileEditPage'
import InvitationPage from './pages/invitation/InvitationPage'
import FundingDetailPage from './pages/funding/FundingDetailPage'
import MessagesPage from './pages/funding/MessagesPage'
import ParticipatePage from './pages/participate/ParticipatePage'
import CompletePage from './pages/participate/CompletePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/profile" element={<ProfileSetupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/my/profile" element={<ProfileEditPage />} />
      <Route path="/funding/:id/invitation" element={<InvitationPage />} />
      <Route path="/funding/:id" element={<FundingDetailPage />} />
      <Route path="/funding/:id/messages" element={<MessagesPage />} />
      <Route path="/funding/:id/participate" element={<ParticipatePage />} />
      <Route path="/funding/:id/complete" element={<CompletePage />} />
    </Routes>
  )
}

export default App
