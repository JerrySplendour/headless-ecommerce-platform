"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { useCartStore } from "../../store/cartStore"
import { ordersAPI } from "../../api/orders"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import DeliveryDetailsModal from "../../components/DeliveryDetailsModal"
import ShippingMethodModal from "../../components/ShippingMethodModal"
import PaymentGateway from "../../components/PaymentGateway"

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
  const { user, isAuthenticated } = useAuthStore()

  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null)
  const [shippingMethod, setShippingMethod] = useState<string>("")
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingTax, setShippingTax] = useState(0)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [notes, setNotes] = useState("")
  const [saveDetails, setSaveDetails] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [orderCreated, setOrderCreated] = useState<any>(null)

  useEffect(() => {
    if (isAuthenticated && user && !deliveryData) {
      // Try to get saved address from localStorage or user meta
      const savedAddress = localStorage.getItem(`saved_address_${user.id}`)
      if (savedAddress) {
        try {
          const parsed = JSON.parse(savedAddress)
          setDeliveryData(parsed)
          setCurrentStep(2)
        } catch {
          // Invalid saved data, continue with empty form
        }
      }
    }
  }, [isAuthenticated, user, deliveryData])

  useEffect(() => {
    if (!deliveryData && items.length > 0) {
      setShowDeliveryModal(true)
    }
  }, [])

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
        set_paid: false,
        meta_data: [
          { key: "_sales_channel", value: "website" },
          { key: "_shipping_method", value: shippingMethod },
          { key: "_shipping_cost", value: shippingCost.toString() },
          { key: "_customer_notes", value: notes },
        ],
      }

      return ordersAPI.create(orderData)
    },
    onSuccess: (data) => {
      if (saveDetails && user) {
        localStorage.setItem(`saved_address_${user.id}`, JSON.stringify(deliveryData))
      }
      setOrderCreated(data)
      setCurrentStep(4)
    },
  })

  const handlePaymentSuccess = () => {
    clearCart()
    navigate("/order-confirmation", { state: { orderId: orderCreated?.id } })
  }

  const subtotal = getTotalPrice()
  const total = subtotal + shippingCost + shippingTax

  const steps = [
    { id: 1, name: "Delivery", completed: !!deliveryData },
    { id: 2, name: "Shipping", completed: !!shippingMethod },
    { id: 3, name: "Review", completed: false },
    { id: 4, name: "Payment", completed: false },
  ]

  if (items.length === 0 && !orderCreated) {
    return (
      <div className="container mx-auto px-4 py-16 pt-[100px]">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
          <button onClick={() => navigate("/products")} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pt-[100px]">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Checkout</h1>

          {/* Progress Steps */}
          <nav aria-label="Progress" className="hidden sm:block">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.name}
                  className={`relative ${stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                        step.completed || currentStep > step.id
                          ? "bg-primary-600"
                          : currentStep === step.id
                            ? "border-2 border-primary-600 bg-white"
                            : "border-2 border-gray-300 bg-white"
                      }`}
                    >
                      {step.completed || currentStep > step.id ? (
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span
                          className={`text-sm font-medium ${currentStep === step.id ? "text-primary-600" : "text-gray-500"}`}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        currentStep >= step.id ? "text-primary-600" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 left-10 -ml-px h-0.5 w-full bg-gray-200">
                      <div
                        className={`h-full transition-all duration-300 ${
                          step.completed || currentStep > step.id ? "bg-primary-600 w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {!isAuthenticated && (
              <div className="card bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800">Have an account?</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      <Link to="/login" className="font-medium underline hover:text-blue-800">
                        Log in
                      </Link>{" "}
                      to use your saved address and track your orders easily.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                {deliveryData && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Complete
                  </span>
                )}
              </div>

              {deliveryData ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Name</span>
                      <span className="font-medium text-gray-900">
                        {deliveryData.first_name} {deliveryData.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Email</span>
                      <span className="font-medium text-gray-900">{deliveryData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Phone</span>
                      <span className="font-medium text-gray-900">{deliveryData.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Address</span>
                      <span className="font-medium text-gray-900">
                        {deliveryData.address}, {deliveryData.city}, {deliveryData.state}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium mt-4 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Details
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Shipping Method</h2>
                  {shippingMethod && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Selected
                    </span>
                  )}
                </div>

                {shippingMethod ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{shippingMethod}</p>
                          <p className="text-sm text-gray-500">Estimated delivery: 3-5 business days</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">₦{shippingCost.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setShowShippingModal(true)}
                      className="text-primary-600 hover:text-primary-700 font-medium mt-4 text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      Change Method
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
            {deliveryData && shippingMethod && currentStep < 4 && (
              <div className="card space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "paystack", name: "Paystack", icon: "💳" },
                      { id: "stripe", name: "Stripe", icon: "💳" },
                      { id: "bank_transfer", name: "Bank Transfer", icon: "🏦" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-xl">{method.icon}</span>
                        <span
                          className={`font-medium ${paymentMethod === method.id ? "text-primary-700" : "text-gray-700"}`}
                        >
                          {method.name}
                        </span>
                        {paymentMethod === method.id && (
                          <svg
                            className="w-5 h-5 text-primary-600 absolute top-2 right-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full h-24"
                    placeholder="Any special instructions for your order..."
                  />
                </div>

                {isAuthenticated && (
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveDetails}
                      onChange={(e) => setSaveDetails(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Save delivery details</span>
                      <p className="text-sm text-gray-500">Use this address for future orders</p>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* Payment Gateway Step */}
            {currentStep === 4 && orderCreated && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h2>
                <PaymentGateway
                  orderId={orderCreated.id}
                  amount={total}
                  email={deliveryData?.email || ""}
                  paymentMethod={paymentMethod}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => console.error("Payment failed:", error)}
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg?height=64&width=64&query=product"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      ₦{(Number.parseFloat(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-b py-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₦{subtotal.toLocaleString()}</span>
                </div>
                {shippingMethod && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">₦{shippingCost.toLocaleString()}</span>
                    </div>
                    {shippingTax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">₦{shippingTax.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">₦{total.toLocaleString()}</span>
              </div>

              {deliveryData && shippingMethod && currentStep < 4 && (
                <button
                  onClick={() => createOrderMutation.mutate()}
                  disabled={createOrderMutation.isPending}
                  className="btn btn-primary w-full py-3 text-lg mb-4"
                >
                  {createOrderMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              )}

              <button onClick={() => navigate("/products")} className="btn btn-secondary w-full">
                Continue Shopping
              </button>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                  <span className="text-xs">Secure checkout powered by SSL encryption</span>
                </div>
              </div>
            </div>
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
          setCurrentStep(2)
        }}
        initialData={deliveryData || undefined}
        isLoggedIn={isAuthenticated}
        userId={user?.id}
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
            setCurrentStep(3)
          }}
          state={deliveryData.state}
          city={deliveryData.city}
          items={items}
        />
      )}
    </div>
  )
}
