import apiClient from "../utils/axios"
import { API_BASE_URL } from "../config/api"

export const paymentsAPI = {
  // Initialize payment for order
  initializePayment: async (orderId: number, paymentMethod: string, amount: number) => {
    const response = await apiClient.post(`${API_BASE_URL}/toyfront/v1/orders/${orderId}/payment`, {
      payment_method: paymentMethod,
      amount,
    })
    return response.data
  },

  // Verify Paystack payment
  verifyPaystackPayment: async (reference: string) => {
    const response = await apiClient.get(`${API_BASE_URL}/toyfront/v1/payments/paystack/verify`, {
      params: { reference },
    })
    return response.data
  },

  // Confirm Stripe payment
  confirmStripePayment: async (orderId: number, paymentIntentId: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/toyfront/v1/payments/stripe/confirm`, {
      order_id: orderId,
      payment_intent_id: paymentIntentId,
    })
    return response.data
  },

  // Confirm offline payment (admin)
  confirmOfflinePayment: async (orderId: number) => {
    const response = await apiClient.post(`${API_BASE_URL}/toyfront/v1/orders/${orderId}/confirm-payment`)
    return response.data
  },
}
