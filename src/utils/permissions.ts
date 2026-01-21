import type { User } from "../types"

type Permission =
  | "view_orders"
  | "create_orders"
  | "edit_orders"
  | "delete_orders"
  | "view_products"
  | "create_products"
  | "edit_products"
  | "delete_products"
  | "view_customers"
  | "create_customers"
  | "edit_customers"
  | "delete_customers"
  | "view_analytics"
  | "view_campaigns"
  | "create_campaigns"
  | "view_staff"
  | "create_staff"
  | "use_pos"

const rolePermissions: Record<User["role"], Permission[]> = {
  admin: [
    "view_orders",
    "create_orders",
    "edit_orders",
    "delete_orders",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "view_customers",
    "create_customers",
    "edit_customers",
    "view_analytics",
    "view_campaigns",
    "create_campaigns",
    "view_staff",
    "create_staff",
    "use_pos",
  ],
  cashier: ["view_orders", "create_orders", "view_products", "view_customers", "use_pos"],
  inventory_manager: [
    "view_orders",
    "view_products",
    "create_products",
    "edit_products",
    "view_customers",
    "view_analytics",
  ],
  marketer: ["view_orders", "view_products", "view_customers", "view_analytics", "view_campaigns", "create_campaigns"],
}

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user || !user.role) return false // early return if role is missing
  return rolePermissions[user.role].includes(permission)
}

export const canAccessRoute = (user: User | null, route: string): boolean => {
  if (!user) return false

  if (user.role === "admin") return true

  const routePermissions: Record<string, Permission> = {
    "/dashboard/orders": "view_orders",
    "/dashboard/products": "view_products",
    "/dashboard/inventory": "view_products",
    "/dashboard/customers": "view_customers",
    "/dashboard/campaigns": "view_campaigns",
    "/dashboard/analytics": "view_analytics",
    "/dashboard/staff": "view_staff",
    "/dashboard/pos": "use_pos",
  }

  const requiredPermission = routePermissions[route]
  return requiredPermission ? hasPermission(user, requiredPermission) : true
}
