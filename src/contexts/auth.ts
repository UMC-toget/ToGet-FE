import { createContext } from 'react'

export interface AuthState {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)
