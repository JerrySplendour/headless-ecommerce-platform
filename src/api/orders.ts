import apiClient from "../utils/axios"
import { API_ENDPOINTS, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "../config/api"
import type { Order } from "../types"

export const ordersAPI = {
  getAll: async (params?: {
    page?: number
    per_page?: number
    status?: string
    customer?: number
    after?: string
    before?: string
    orderby?: string
  }): Promise<{ data: Order[]; total: number; totalPages: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS, {
      params: {
        ...params,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })

    return {
      data: response.data,
      total: Number.parseInt(response.headers["x-wp-total"] || "0"),
      totalPages: Number.parseInt(response.headers["x-wp-totalpages"] || "0"),
    }
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${id}`, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  create: async (orderData: {
    line_items: Array<{ product_id: number; quantity: number }>
    billing?: any
    shipping?: any
    payment_method?: string
    payment_method_title?: string
    set_paid?: boolean
    meta_data?: Array<{ key: string; value: string }>
  }): Promise<Order> => {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS, orderData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  update: async (id: number, orderData: Partial<Order>): Promise<Order> => {
    const response = await apiClient.put(`${API_ENDPOINTS.ORDERS}/${id}`, orderData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  updateStatus: async (id: number, status: Order["status"]): Promise<Order> => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.ORDERS}/${id}`,
      { status },
      {
        params: {
          consumer_key: WC_CONSUMER_KEY,
          consumer_secret: WC_CONSUMER_SECRET,
        },
      },
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.ORDERS}/${id}`, {
      params: {
        force: true,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
  },
}
