import apiClient from "../utils/axios"
import { API_ENDPOINTS, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "../config/api"
import type { Campaign } from "../types"

export const campaignsAPI = {
  getAll: async (params?: {
    page?: number
    per_page?: number
  }): Promise<{ data: Campaign[]; total: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.COUPONS, {
      params: {
        ...params,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })

    return {
      data: response.data,
      total: Number.parseInt(response.headers["x-wp-total"] || "0"),
    }
  },

  getById: async (id: number): Promise<Campaign> => {
    const response = await apiClient.get(`${API_ENDPOINTS.COUPONS}/${id}`, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  create: async (campaignData: {
    code: string
    discount_type: "percent" | "fixed_cart" | "fixed_product"
    amount: string
    date_expires?: string
    usage_limit?: number
    description?: string
  }): Promise<Campaign> => {
    const response = await apiClient.post(API_ENDPOINTS.COUPONS, campaignData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  update: async (id: number, campaignData: Partial<Campaign>): Promise<Campaign> => {
    const response = await apiClient.put(`${API_ENDPOINTS.COUPONS}/${id}`, campaignData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.COUPONS}/${id}`, {
      params: {
        force: true,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
  },

  getPerformance: async (
    id: number,
  ): Promise<{
    total_usage: number
    total_revenue: string
    orders: number
  }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.CAMPAIGNS}/${id}/performance`)
    return response.data
  },
}
