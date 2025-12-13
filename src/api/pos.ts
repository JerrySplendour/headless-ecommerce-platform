import apiClient from "../utils/axios"
import { API_ENDPOINTS } from "../config/api"
import type { POSOrder, Order } from "../types"

export const posAPI = {
  createOrder: async (orderData: POSOrder): Promise<Order> => {
    const response = await apiClient.post(API_ENDPOINTS.POS_ORDERS, {
      ...orderData,
      meta_data: [
        { key: "sales_channel", value: "walk-in" },
        { key: "payment_method", value: orderData.payment_method },
      ],
    })
    return response.data
  },

  getOrders: async (params?: {
    page?: number
    per_page?: number
    date_from?: string
    date_to?: string
  }): Promise<{ data: Order[]; total: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.POS_ORDERS, { params })
    return {
      data: response.data,
      total: Number.parseInt(response.headers["x-wp-total"] || "0"),
    }
  },
}
