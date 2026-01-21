import apiClient, { publicApiClient } from "../utils/axios"
import { API_ENDPOINTS, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } from "../config/api"
import type { Product } from "../types"

export const productsAPI_ = {
  getAll: async (params?: {
    page?: number
    per_page?: number
    search?: string
    category?: number
    status?: string
    stock_status?: string
    orderby?: string
  }): Promise<{ data: Product[]; total: number; totalPages: number }> => {
    const response = await publicApiClient.get(API_ENDPOINTS.PRODUCTS, {
      params: {
        ...params,
      },
    })

    return {
      data: response.data,
      total: Number.parseInt(response.headers["x-wp-total"] || "0"),
      totalPages: Number.parseInt(response.headers["x-wp-totalpages"] || "0"),
    }
  },

  getById: async (id: number): Promise<Product> => {
    const response = await publicApiClient.get(`${API_ENDPOINTS.PRODUCTS}/?id=${id}`, {

    })
    return response.data
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await publicApiClient.get(API_ENDPOINTS.PRODUCTS, {
      params: {
        slug,
      },
    })
    return response.data
  },

  create: async (productData: Partial<Product>): Promise<Product> => {
    const response = await publicApiClient.post(API_ENDPOINTS.PRODUCTS, productData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await publicApiClient.put(`${API_ENDPOINTS.PRODUCTS}/?id=${id}`, productData, {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await publicApiClient.delete(`${API_ENDPOINTS.PRODUCTS}/?id=${id}`, {
      params: {
        force: true,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
  },

  getCategories: async (): Promise<Array<{ id: number; name: string; slug: string; count: number }>> => {
    const response = await publicApiClient.get(API_ENDPOINTS.CATEGORIES, {
      params: {
        per_page: 100,
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
      },
    })
    return response.data
  },

  getCollections: async (): Promise<
    Array<{
      id: number
      name: string
      description: string
      image_url: string
      product_count: number
      product_ids: number[]
    }>
  > => {
    const response = await apiClient.get("/custom/v1/collections/")
    return response.data
  },

  getCollection: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/custom/v1/collections/${id}`)
    return response.data
  },

  createCollection: async (data: { name: string; description: string; product_ids: number[] }): Promise<any> => {
    const response = await apiClient.post("/custom/v1/collections/", data)
    return response.data
  },

  updateCollection: async (
    id: number,
    data: Partial<{ name: string; description: string; product_ids: number[] }>,
  ): Promise<any> => {
    const response = await apiClient.put(`/custom/v1/collections/${id}`, data)
    return response.data
  },

  deleteCollection: async (id: number): Promise<void> => {
    await apiClient.delete(`/custom/v1/collections/${id}`)
  },
}




export const productsAPI = {
  // ======================
  // PUBLIC
  // ======================
  getAll: async (params?: {
    page?: number
    per_page?: number
    search?: string
    category?: number
    stock_status?: "instock" | "outofstock" | "onbackorder"
  }): Promise<{ data: Product[]; total: number; totalPages: number }> => {
    const response = await publicApiClient.get(API_ENDPOINTS.PRODUCTS, {
      params,
    })

    console.log("FETCHED URL:", response.config.url)
    console.log("BASE URL:", response.config.baseURL)

    return {
      data: response.data,
      total: Number(response.headers["x-wp-total"] || 0),
      totalPages: Number(response.headers["x-wp-totalpages"] || 0),
    }
  },

  getById: async (id: number): Promise<Product> => {
    const response = await publicApiClient.get(`${API_ENDPOINTS.PRODUCTS}/${id}`)
    return response.data
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await publicApiClient.get(API_ENDPOINTS.PRODUCTS, {
      params: { slug },
    })
    return response.data
  },

  getCategories: async (): Promise<
    Array<{ id: number; name: string; slug: string; count: number; image?: string }>
  > => {
    const response = await publicApiClient.get(API_ENDPOINTS.CATEGORIES)
    return response.data
  },

  // ======================
  // ADMIN (TOKEN REQUIRED)
  // ======================
  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, data)
    return response.data
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`)
  },



  // ======================
  // SIDELINED
  // ======================
  getCollections: async (): Promise<
    Array<{
      id: number
      name: string
      description: string
      image_url: string
      product_count: number
      product_ids: number[]
    }>
  > => {
    const response = await apiClient.get("/custom/v1/collections/")
    return response.data
  },

  getCollection: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/custom/v1/collections/${id}`)
    return response.data
  },

  createCollection: async (data: { name: string; description: string; product_ids: number[] }): Promise<any> => {
    const response = await apiClient.post("/custom/v1/collections/", data)
    return response.data
  },

  updateCollection: async (
    id: number,
    data: Partial<{ name: string; description: string; product_ids: number[] }>,
  ): Promise<any> => {
    const response = await apiClient.put(`/custom/v1/collections/${id}`, data)
    return response.data
  },

  deleteCollection: async (id: number): Promise<void> => {
    await apiClient.delete(`/custom/v1/collections/${id}`)
  },
}
