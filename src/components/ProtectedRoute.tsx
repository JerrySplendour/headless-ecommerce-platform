import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
}

export default function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
}: ProtectedRouteProps) {
  const store = useAuthStore()
  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) {
    return <div>Loading</div> // or loading spinner
  }

  if (!store.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles?.length && !requiredRoles.some(store.hasRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requiredPermissions?.length && !store.hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
