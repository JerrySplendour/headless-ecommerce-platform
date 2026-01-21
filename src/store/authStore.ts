import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types"

export type UserRole =
  | "administrator"
  | "shop_manager"
  | "staff"
  | "cashier"
  | "inventory_manager"
  | "marketer"
  | "customer"

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  administrator: ["*"], // All permissions
  shop_manager: [
    "view_dashboard",
    "manage_orders",
    "manage_products",
    "manage_inventory",
    "manage_customers",
    "manage_staff",
    "manage_campaigns",
    "view_analytics",
    "manage_shipping",
    "manage_payments",
  ],
  staff: ["view_dashboard", "view_orders", "view_products", "view_customers"],
  cashier: ["view_dashboard", "manage_orders", "use_pos", "view_products"],
  inventory_manager: ["view_dashboard", "manage_products", "manage_inventory", "view_orders"],
  marketer: ["view_dashboard", "manage_campaigns", "view_analytics", "view_customers"],
  customer: ["view_account", "view_orders", "place_orders"],
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => any
  getPrimaryRole: () => UserRole | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      hasRole: (role: string) => {
        const state = get()
        return state.user?.roles?.includes(role) ?? false
      },

      hasPermission: (permission: string) => {
        const state = get()
        if (!state.user?.roles) return false

        return state.user.roles.some((role) => {
          const permissions = ROLE_PERMISSIONS[role as UserRole]
          if (!permissions) return false
          return permissions.includes("*") || permissions.includes(permission)
        })
      },

      hasAnyPermission: () => {
        const state = get()
        return state.user;
      },

      getPrimaryRole: () => {
        const state = get()
        if (!state.user?.roles?.length) return null

        // Priority order
        const rolePriority: UserRole[] = [
          "administrator",
          "shop_manager",
          "inventory_manager",
          "marketer",
          "cashier",
          "staff",
          "customer",
        ]

        for (const role of rolePriority) {
          if (state.user.roles.includes(role)) {
            return role
          }
        }
        return "customer"
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
