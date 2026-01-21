import apiClient from "../utils/axios"
import { API_BASE_URL } from "../config/api"

export const shippingAPI = {
  // Get all shipping zones
  getZones: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/toyfront/v1/shipping-zones`)
    return response.data
  },

  // Save shipping zone
  saveZone: async (zoneData: {
    zone_id?: number
    zone_name: string
    rates: Array<{
      rate_id?: number
      label: string
      cost: number
      order: number
    }>
  }) => {
    const response = await apiClient.post(`${API_BASE_URL}/toyfront/v1/shipping-zones`, zoneData)
    return response.data
  },

  // Delete shipping zone
  deleteZone: async (zoneId: number) => {
    const response = await apiClient.delete(`${API_BASE_URL}/toyfront/v1/shipping-zones/${zoneId}`)
    return response.data
  },
}
