import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import axios from '../api/axios'
import { User, LoginDto, RegisterDto } from './types'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
  login: (creds: LoginDto) => Promise<void>
  register: (creds: RegisterDto) => Promise<void>
  logout: () => void
  checkSession: () => Promise<boolean>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools((set: any, get: any) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,

      login: async (creds: LoginDto) => {
        set({ loading: true, error: null })
        try {
          const res = await axios.post('/auth/login', creds)
          const { token, user } = res.data
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user, isAuthenticated: true, token, loading: false })
        } catch (err: any) {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Login failed'
          set({ error: msg, loading: false })
        }
      },

      register: async (creds: RegisterDto) => {
        set({ loading: true, error: null })
        try {
          const res = await axios.post('/auth/register', creds)
          const { token, user } = res.data
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user, isAuthenticated: true, token, loading: false })
        } catch (err: any) {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Registration failed'
          set({ error: msg, loading: false })
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({ user: null, isAuthenticated: false, token: null })
      },

      checkSession: async () => {
        const token = get().token
        if (!token) return false
        try {
          const res = await axios.get('/auth/me')
          const user: User = res.data.user
          set({ user, isAuthenticated: true })
          return true
        } catch {
          return false
        }
      },

      clearError: () => set({ error: null }),
    })),
    { name: 'auth-storage', partialize: (state: any) => ({ token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
)