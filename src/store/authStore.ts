import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },
      clearAuth: () => {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
