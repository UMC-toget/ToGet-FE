import { Routes, Route } from 'react-router-dom'
import SplashPage from './pages/splash/SplashPage'
import LoginPage from './pages/login/LoginPage'
import ProfileSetupPage from './pages/signup/ProfileSetupPage'
import HomePage from './pages/home/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/profile" element={<ProfileSetupPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  )
}

export default App
