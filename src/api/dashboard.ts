import apiClient from "../utils/axios"
import { API_BASE_URL } from "../config/api"

export const dashboardAPI = {
  getMetrics: async (period: "week" | "month" | "year" = "week") => {
    const response = await apiClient.get(`${API_BASE_URL}/toyfront/v1/dashboard-metrics`, {
      params: { period },
    })
    return response.data
  },
}
