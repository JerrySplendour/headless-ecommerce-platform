"use client"

import { Link } from "react-router-dom"
import { useCartStore } from "../../store/cartStore"
import { useMutation } from "@tanstack/react-query"
import { ordersAPI } from "../../api/orders"
import { useState } from "react"

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const [billingInfo, setBillingInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    city: "",
    state: "",
    country: "",
  })
  const [showCheckout, setShowCheckout] = useState(false)

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => ordersAPI.create(orderData),
    onSuccess: () => {
      clearCart()
      alert("Order placed successfully!")
      setShowCheckout(false)
    },
    onError: () => {
      alert("Failed to place order. Please try again.")
    },
  })

  const handleCheckout = () => {
    const orderData = {
      line_items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      billing: billingInfo,
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      meta_data: [{ key: "sales_channel", value: "website" }],
    }

    createOrderMutation.mutate(orderData)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart to continue shopping</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card">
            {items.map((item) => (
              <div key={item.product_id} className="flex gap-4 pb-6 mb-6 border-b last:border-b-0 last:mb-0 last:pb-0">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">${item.price} each</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">
                    ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            {!showCheckout ? (
              <button onClick={() => setShowCheckout(true)} className="w-full btn btn-primary py-3 text-lg mb-4">
                Proceed to Checkout
              </button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Billing Information</h3>
                <input
                  type="text"
                  placeholder="First Name"
                  className="input"
                  value={billingInfo.first_name}
                  onChange={(e) => setBillingInfo({ ...billingInfo, first_name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input"
                  value={billingInfo.last_name}
                  onChange={(e) => setBillingInfo({ ...billingInfo, last_name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input"
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="input"
                  value={billingInfo.phone}
                  onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="input"
                  value={billingInfo.address_1}
                  onChange={(e) => setBillingInfo({ ...billingInfo, address_1: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="City"
                  className="input"
                  value={billingInfo.city}
                  onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="State"
                  className="input"
                  value={billingInfo.state}
                  onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Country"
                  className="input"
                  value={billingInfo.country}
                  onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                />
                <button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="w-full btn btn-primary py-3 text-lg"
                >
                  {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            )}

            <Link to="/products" className="block w-full btn btn-secondary text-center py-2">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
