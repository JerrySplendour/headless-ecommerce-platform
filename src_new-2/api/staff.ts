import apiClient from "../utils/axios"
import { API_ENDPOINTS } from "../config/api"
import type { StaffMember } from "../types"

export const staffAPI = {
  getAll: async (): Promise<StaffMember[]> => {
    const response = await apiClient.get(API_ENDPOINTS.STAFF)
    return response.data
  },

  getById: async (id: number): Promise<StaffMember> => {
    const response = await apiClient.get(`${API_ENDPOINTS.STAFF}/${id}`)
    return response.data
  },

  create: async (staffData: {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    role: "cashier" | "inventory_manager" | "marketer"
  }): Promise<StaffMember> => {
    const response = await apiClient.post(API_ENDPOINTS.STAFF, staffData)
    return response.data
  },

  update: async (id: number, staffData: Partial<StaffMember>): Promise<StaffMember> => {
    const response = await apiClient.put(`${API_ENDPOINTS.STAFF}/${id}`, staffData)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.STAFF}/${id}`)
  },

  updateStatus: async (id: number, status: "active" | "inactive"): Promise<StaffMember> => {
    const response = await apiClient.put(`${API_ENDPOINTS.STAFF}/${id}`, { status })
    return response.data
  },
}
