import axios, { AxiosError } from "axios"
import { API_BASE_URL } from "../config/api"
import type { User } from "../types"


type LoginErrorCode =
  | "INVALID_CREDENTIALS"
  | "MISSING_FIELDS"
  | "EMAIL_NOT_VERIFIED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"


export class LoginError extends Error {
  code: LoginErrorCode
  status?: number

  constructor(message: string, code: LoginErrorCode, status?: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

export const authAPI = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await axios.post(
        "https://imesglobe.com/wp-json/custom/v1/login",
        { username, password }
      )

      const token = response.data?.token
      if (!token) {
        throw new LoginError("Invalid server response", "SERVER_ERROR", 500)
      }

      // ✅ FETCH REAL USER HERE
      const user = await authAPI.fetchMe(token)

      return { token, user }
    } catch (err) {
      const error = err as AxiosError<any>

      if (!error.response) {
        throw new LoginError("Network error. Check your connection.", "NETWORK_ERROR")
      }

      const status = error.response.status
      const code = error.response.data?.code

      if (status === 401) {
        throw new LoginError("Invalid username or password", "INVALID_CREDENTIALS", 401)
      }

      if (status === 400) {
        throw new LoginError("Username and password are required", "MISSING_FIELDS", 400)
      }

      if (code === "email_not_verified") {
        throw new LoginError("Please verify your email before logging in", "EMAIL_NOT_VERIFIED", 403)
      }

      throw new LoginError("Server error. Try again later.", "SERVER_ERROR", status)
    }
  },

  fetchMe: async (token: string): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/wp/v2/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = response.data

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      displayName: data.name,
      roles: data.roles || ["customer"],
      role: data.roles?.[0] as "admin" | "cashier" | "inventory_manager" | "marketer", // pick the first role
      isVerified: data.is_verified,
    }
  },

  register: async (
    username: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{ message: string; user_id: number }> => {
    const response = await axios.post(`${API_BASE_URL}/custom/v1/register`, {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })

    return response.data
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/custom/v1/check-username`, {
      params: { username },
    })
    return response.data.available
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/custom/v1/check-email`, {
      params: { email },
    })
    return response.data.available
  },

  verifyEmail: async (email: string, token: string): Promise<{ message: string }> => {
    const response = await axios.get(`${API_BASE_URL}/custom/v1/verify-email`, {
      params: { email, token },
    })
    return response.data
  },

  resendVerificationEmail: async (token: string): Promise<{ message: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/custom/v1/resend-verification`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await axios.post(
        `${API_BASE_URL}/custom/v1/check-token`,
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
