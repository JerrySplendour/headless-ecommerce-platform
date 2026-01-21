import apiClient from "../utils/axios"
import { API_BASE_URL } from "../config/api"

export const checkoutAPI = {
  // Guest checkout - creates account if email doesn't exist
  guestCheckout: async (deliveryDetails: {
    email: string
    first_name: string
    last_name: string
    phone: string
    address: string
    city: string
    state: string
    country: string
    zipcode?: string
  }) => {
    const response = await apiClient.post(`${API_BASE_URL}/toyfront/v1/guest-checkout`, deliveryDetails)
    return response.data
  },

  // Calculate shipping cost based on method and location
  calculateShipping: async (shippingMethod: string, state: string, city: string, items: any[]) => {
    const response = await apiClient.post(`${API_BASE_URL}/toyfront/v1/shipping-cost`, {
      shipping_method: shippingMethod,
      state,
      city,
      items,
    })
    return response.data
  },
}
