export interface User {
  id: number
  username: string
  email: string
  role: "admin" | "cashier" | "inventory_manager" | "marketer"
  displayName: string
  token?: string
  roles: string[]
  isVerified: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: string
  regular_price: string
  sale_price: string
  images: Array<{
    id: number
    src: string
    alt: string
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  stock_status: "instock" | "outofstock" | "onbackorder"
  stock_quantity: number
  manage_stock: boolean
  variations: number[]
  attributes: Array<{
    id: number
    name: string
    options: string[]
  }>
}

export interface Order {
  id: number
  number: string
  status: "pending" | "processing" | "on-hold" | "completed" | "cancelled" | "refunded" | "failed"
  date_created: string
  total: string
  currency: string
  customer_id: number
  billing: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address_1: string
    city: string
    state: string
    country: string
  }
  line_items: Array<{
    id: number
    name: string
    product_id: number
    quantity: number
    total: string
    price: string
  }>
  meta_data: Array<{
    key: string
    value: string
  }>
}

export interface Customer {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  date_created: string
  orders_count: number
  total_spent: string
  avatar_url: string
  meta_data: Array<{
    key: string
    value: string
  }>
}

export interface Campaign {
  id: number
  title: string
  code: string
  type: "percentage" | "fixed_cart" | "fixed_product"
  amount: string
  date_created: string
  date_expires: string
  usage_count: number
  usage_limit: number
  status: "active" | "inactive" | "expired"
}

export interface AnalyticsData {
  revenue: {
    total: number
    change: number
  }
  orders: {
    total: number
    change: number
  }
  customers: {
    total: number
    change: number
  }
  products_sold: {
    total: number
    change: number
  }
}

export interface SalesChannel {
  id: number
  name: string
  slug: string
  orders_count: number
  revenue: string
}

export interface StaffMember {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "cashier" | "inventory_manager" | "marketer"
  date_created: string
  status: "active" | "inactive"
}

export interface CartItem {
  product_id: number
  name: string
  price: string
  quantity: number
  image: string
}

export interface POSOrder {
  items: Array<{
    product_id: number
    quantity: number
    price: string
  }>
  payment_method: "cash" | "transfer"
  customer_name?: string
  customer_phone?: string
  notes?: string
}
