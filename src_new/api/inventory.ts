import apiClient from "../utils/axios"
import { API_ENDPOINTS } from "../config/api"

export const inventoryAPI = {
  getLowStockAlerts: async (): Promise<
    Array<{
      product_id: number
      name: string
      stock_quantity: number
      threshold: number
    }>
  > => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY_ALERTS)
    return response.data
  },

  updateStock: async (productId: number, quantity: number): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.INVENTORY_ALERTS}/update`, {
      product_id: productId,
      stock_quantity: quantity,
    })
  },
}
