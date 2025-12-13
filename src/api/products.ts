import apiClient from "../utils/axios"
import { API_ENDPOINTS, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "../config/api"
import type { Product } from "../types"

export const productsAPI = {
  getAll: async (params?: {
    page?: number
    per_page?: number
    search?: string
    category?: number
    status?: string
    stock_status?: string
    orderby?: string
  }): Promise<{ data: Product[]; total: number; totalPages: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS, {
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

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS, {
      params: {
        slug,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data[0]
  },

  create: async (productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, productData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, productData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      params: {
        force: true,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
  },

  getCategories: async (): Promise<Array<{ id: number; name: string; slug: string; count: number }>> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES, {
      params: {
        per_page: 100,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },
}
