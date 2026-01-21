"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ordersAPI } from "../../api/orders"
import { customersAPI } from "../../api/customers"
import { productsAPI } from "../../api/products"
import { useNavigate } from "react-router-dom"

interface OrderItem {
  product_id: number
  name: string
  quantity: number
  price: string
}

const SALES_CHANNELS = [
  "website",
  "instagram",
  "whatsapp",
  "facebook",
  "twitter",
  "snapchat",
  "flutterwave",
  "jiji",
  "jumia",
  "konga",
  "paystack",
  "physical_sale",
]

const PAYMENT_METHODS = ["cash", "pos_terminal", "merchants_account", "stripe", "paystack"]
const PAYMENT_STATUSES = ["paid", "unpaid", "partially_paid"]

export default function CreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [salesChannel, setSalesChannel] = useState("physical_sale")
  const [paymentStatus, setPaymentStatus] = useState("paid")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [notes, setNotes] = useState("")

  // Data fetching
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersAPI.getAll({ per_page: 100 }),
  })

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsAPI.getAll({ per_page: 100 }),
  })

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomerId || orderItems.length === 0) {
        throw new Error("Customer and products are required")
      }

      const customer = customers?.data.find((c) => c.id === selectedCustomerId)
      if (!customer) throw new Error("Customer not found")

      const lineItems = orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))

      const metaData = [
        { key: "_sales_channel", value: salesChannel },
        { key: "_payment_status_custom", value: paymentStatus },
        { key: "_payment_method_custom", value: paymentMethod },
        { key: "_offline_sale", value: "yes" },
      ]

      if (notes) {
        metaData.push({ key: "_customer_notes", value: notes })
      }

      const orderData = {
        customer_id: selectedCustomerId,
        line_items: lineItems,
        payment_method: "manual",
        payment_method_title: paymentMethod,
        set_paid: paymentStatus === "paid",
        meta_data: metaData,
      }

      return ordersAPI.create(orderData)
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      navigate(`/dashboard/orders/${order.id}`)
    },
  })

  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity <= 0) return

    const product = products?.data.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = orderItems.find((item) => item.product_id === selectedProduct)
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.product_id === selectedProduct ? { ...item, quantity: item.quantity + productQuantity } : item,
        ),
      )
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: selectedProduct,
          name: product.name,
          quantity: productQuantity,
          price: product.price,
        },
      ])
    }

    setSelectedProduct(null)
    setProductQuantity(1)
  }

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.product_id !== productId))
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Order</h1>
        <p className="text-gray-600 mt-1">Create a new order from a sales channel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Order Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
              <select
                value={selectedCustomerId ?? ""}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
                className="input w-full"
              >
                <option value="">-- Select a customer --</option>
                {customers?.data.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sales Channel</label>
                <select value={salesChannel} onChange={(e) => setSalesChannel(e.target.value)} className="input w-full">
                  {SALES_CHANNELS.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
                <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="input w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for this order"
                className="input w-full h-20"
              />
            </div>
          </div>

          {/* Add Products */}
          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Products</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <select
                  value={selectedProduct ?? ""}
                  onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : null)}
                  className="input flex-1"
                >
                  <option value="">Select a product...</option>
                  {products?.data.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₦{product.price}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="input w-20"
                />

                <button onClick={handleAddProduct} className="btn btn-primary">
                  Add
                </button>
              </div>

              {/* Order Items Table */}
              {orderItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orderItems.map((item) => (
                        <tr key={item.product_id}>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">₦{item.price}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            ₦{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.product_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Payment</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Status</label>
              <div className="flex gap-3">
                {PAYMENT_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setPaymentStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      paymentStatus === status
                        ? "bg-green-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {status.replace(/_/g, " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method (Optional)</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input w-full">
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card sticky top-6 h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>

          {orderItems.length === 0 ? (
            <p className="text-gray-500">No items added yet</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 border-b pb-4">
                {orderItems.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">₦{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>₦{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => createOrderMutation.mutate()}
                disabled={!selectedCustomerId || orderItems.length === 0 || createOrderMutation.isPending}
                className="btn btn-primary w-full"
              >
                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
              </button>

              <button onClick={() => navigate("/dashboard/orders")} className="btn btn-secondary w-full">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
