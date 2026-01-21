import apiClient from "../utils/axios"
import { API_ENDPOINTS } from "../config/api"
import type { AnalyticsData } from "../types"

export const analyticsAPI = {
  getOverview: async (params?: {
    period?: "today" | "week" | "month" | "year"
    start_date?: string
    end_date?: string
  }): Promise<AnalyticsData> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/overview`, {
      params,
    })
    return response.data
  },

  getRevenue: async (params?: {
    period?: string
    start_date?: string
    end_date?: string
  }): Promise<{ labels: string[]; data: number[] }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/revenue`, {
      params,
    })
    return response.data
  },

  getTopProducts: async (
    limit = 10,
  ): Promise<
    Array<{
      product_id: number
      name: string
      sales_count: number
      revenue: string
    }>
  > => {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/top-products`, {
      params: { limit },
    })
    return response.data
  },

  getSalesByChannel: async (params?: {
    start_date?: string
    end_date?: string
  }): Promise<
    Array<{
      channel: string
      orders: number
      revenue: string
    }>
  > => {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/sales-by-channel`, {
      params,
    })
    return response.data
  },

  getCustomerGrowth: async (params?: {
    period?: string
  }): Promise<{ labels: string[]; data: number[] }> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/customer-growth`, {
      params,
    })
    return response.data
  },
}
