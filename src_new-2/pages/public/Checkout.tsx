"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useCartStore } from "../../store/cartStore"
import { ordersAPI } from "../../api/orders"
import { useNavigate } from "react-router-dom"
import DeliveryDetailsModal from "../../components/DeliveryDetailsModal"
import ShippingMethodModal from "../../components/ShippingMethodModal"

interface DeliveryData {
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  customer_id: number
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null)
  const [shippingMethod, setShippingMethod] = useState<string>("")
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingTax, setShippingTax] = useState(0)
  const [showDeliveryModal, setShowDeliveryModal] = useState(true)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [notes, setNotes] = useState("")

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!deliveryData) throw new Error("Delivery details required")

      const orderData = {
        customer_id: deliveryData.customer_id,
        line_items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        billing: {
          first_name: deliveryData.first_name,
          last_name: deliveryData.last_name,
          email: deliveryData.email,
          phone: deliveryData.phone,
          address_1: deliveryData.address,
          city: deliveryData.city,
          state: deliveryData.state,
          country: deliveryData.country,
        },
        shipping: {
          first_name: deliveryData.first_name,
          last_name: deliveryData.last_name,
          address_1: deliveryData.address,
          city: deliveryData.city,
          state: deliveryData.state,
          country: deliveryData.country,
        },
        payment_method: paymentMethod,
        meta_data: [
          { key: "_sales_channel", value: "website" },
          { key: "_shipping_method", value: shippingMethod },
          { key: "_shipping_cost", value: shippingCost.toString() },
          { key: "_customer_notes", value: notes },
        ],
      }

      return ordersAPI.create(orderData)
    },
    onSuccess: () => {
      clearCart()
      navigate("/order-confirmation")
    },
  })

  const subtotal = getTotalPrice()
  const total = subtotal + shippingCost + shippingTax

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 pt-[100px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <button onClick={() => navigate("/products")} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-[100px]">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Section */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Delivery Details</h2>
            {deliveryData ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="text-gray-600">Name:</span> {deliveryData.first_name} {deliveryData.last_name}
                </p>
                <p>
                  <span className="text-gray-600">Email:</span> {deliveryData.email}
                </p>
                <p>
                  <span className="text-gray-600">Phone:</span> {deliveryData.phone}
                </p>
                <p>
                  <span className="text-gray-600">Address:</span> {deliveryData.address}, {deliveryData.city},{" "}
                  {deliveryData.state}
                </p>
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  Change
                </button>
              </div>
            ) : (
              <button onClick={() => setShowDeliveryModal(true)} className="btn btn-primary w-full">
                Add Delivery Details
              </button>
            )}
          </div>

          {/* Shipping Method */}
          {deliveryData && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
              {shippingMethod ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-4">
                    <span className="text-gray-600">Method:</span> {shippingMethod}
                  </p>
                  <button
                    onClick={() => setShowShippingModal(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowShippingModal(true)} className="btn btn-primary w-full">
                  Select Shipping Method
                </button>
              )}
            </div>
          )}

          {/* Payment & Notes */}
          {deliveryData && shippingMethod && (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold">Payment Method</h2>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input w-full">
                <option value="paystack">Paystack</option>
                <option value="stripe">Stripe</option>
                <option value="merchant_account">Merchant Account</option>
              </select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full h-24"
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Your Order</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    ₦{(Number.parseFloat(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-b py-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              {shippingMethod && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₦{shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₦{shippingTax.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span className="text-primary-600">₦{total.toLocaleString()}</span>
            </div>

            {deliveryData && shippingMethod && (
              <button
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending}
                className="btn btn-primary w-full py-3 text-lg mb-4"
              >
                {createOrderMutation.isPending ? "Processing..." : "Place Order"}
              </button>
            )}

            <button onClick={() => navigate("/products")} className="btn btn-secondary w-full">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeliveryDetailsModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSuccess={(data) => {
          setDeliveryData(data)
          setShowDeliveryModal(false)
          setShowShippingModal(true)
        }}
        initialData={deliveryData}
      />

      {deliveryData && (
        <ShippingMethodModal
          isOpen={showShippingModal}
          onClose={() => setShowShippingModal(false)}
          onSelect={(method, cost, tax) => {
            setShippingMethod(method)
            setShippingCost(cost)
            setShippingTax(tax)
            setShowShippingModal(false)
          }}
          state={deliveryData.state}
          city={deliveryData.city}
          items={items}
        />
      )}
    </div>
  )
}
