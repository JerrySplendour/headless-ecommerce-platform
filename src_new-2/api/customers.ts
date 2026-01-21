import apiClient from "../utils/axios"
import { API_ENDPOINTS, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "../config/api"
import type { Customer } from "../types"

export const customersAPI = {
  getAll: async (params?: {
    page?: number
    per_page?: number
    search?: string
    orderby?: string
    order?: string
  }): Promise<{ data: Customer[]; total: number; totalPages: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS, {
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

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`${API_ENDPOINTS.CUSTOMERS}/${id}`, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  create: async (customerData: {
    email: string
    first_name: string
    last_name: string
    username?: string
    password?: string
    billing?: any
    shipping?: any
  }): Promise<Customer> => {
    const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS, customerData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  update: async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put(`${API_ENDPOINTS.CUSTOMERS}/${id}`, customerData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`, {
      params: {
        force: true,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
  },

  getGroups: async (): Promise<Array<{ id: number; name: string; customer_count: number }>> => {
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMER_GROUPS)
    return response.data
  },
}
