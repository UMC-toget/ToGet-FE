import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import AuthProvider from './contexts/AuthProvider.tsx'
import { queryClient } from './lib/queryClient.ts'
import { GOOGLE_CLIENT_ID, KAKAO_JS_KEY } from './lib/oauthConfig.ts'
import { initKakao } from './lib/kakao.ts'

initKakao(KAKAO_JS_KEY)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
