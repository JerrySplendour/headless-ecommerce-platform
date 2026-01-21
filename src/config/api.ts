// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/toyfront/wp-json"
// export const APP_BASE_URL = "http://localhost/toyfront/";
export const API_BASE_URL =  "https://imesglobe.com/wp-json"
export const APP_BASE_URL = "https://imesglobe.com/";
// https://imesglobe.com
export const API_ENDPOINTS = {
  // Auth
  AUTH_TOKEN: "/jwt-auth/v1/token",
  AUTH_VALIDATE: "/jwt-auth/v1/token/validate",

  // WooCommerce
  PRODUCTS: "/toyfront/v1/products",
  // ORDERS: "/wc/v3/orders",
  CUSTOMERS: "/wc/v3/customers",
  COUPONS: "/wc/v3/coupons",
  CATEGORIES: "/toyfront/v1/categories",

  // Custom Endpoints
  // ANALYTICS: "/toyfront/v1/analytics",
  SALES_CHANNELS: "/toyfront/v1/sales-channels",
  POS_ORDERS: "/toyfront/v1/pos/orders",
  STAFF: "/toyfront/v1/staff",
  CAMPAIGNS: "/toyfront/v1/campaigns",
  INVENTORY_ALERTS: "/toyfront/v1/inventory/alerts",
  CUSTOMER_GROUPS: "/toyfront/v1/customers/groups",


  ORDERS: "/custom/v1/orders",
  ANALYTICS: "/custom/v1/analytics",
} as const

export const WC_CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || ""
export const WC_CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || ""
