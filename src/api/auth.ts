import axios from "axios"
import { API_BASE_URL, API_ENDPOINTS } from "../config/api"
import type { User } from "../types"

export const authAPI = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH_TOKEN}`, {
      username,
      password,
    })

    return {
      token: response.data.token,
      user: {
        id: response.data.user_id,
        username: response.data.user_display_name,
        email: response.data.user_email,
        role: response.data.user_role,
        displayName: response.data.user_display_name,
      },
    }
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH_VALIDATE}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return true
    } catch {
      return false
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  },
}
