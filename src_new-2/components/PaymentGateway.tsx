"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { paymentsAPI } from "../api/payments"

interface PaymentGatewayProps {
  orderId: number
  amount: number
  email: string
  customerName: string
  onSuccess: () => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function PaymentGateway({
  orderId,
  amount,
  email,
  customerName,
  onSuccess,
  onError,
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState("paystack")

  const initPaymentMutation = useMutation({
    mutationFn: () => paymentsAPI.initializePayment(orderId, selectedMethod, amount),
    onSuccess: async (data) => {
      if (selectedMethod === "paystack") {
        await handlePaystackPayment(data)
      } else if (selectedMethod === "stripe") {
        // Redirect to Stripe hosted checkout or integration
        handleStripePayment(data)
      } else if (selectedMethod === "offline") {
        onSuccess()
      }
    },
    onError: (error: any) => {
      onError(error.response?.data?.message || "Payment initialization failed")
    },
  })

  const handlePaystackPayment = async (data: any) => {
    // Load Paystack script
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => {
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.REACT_APP_PAYSTACK_KEY,
          email,
          amount: amount * 100,
          ref: `ORDER-${orderId}-${Date.now()}`,
          onClose: () => {
            onError("Payment cancelled")
          },
          onSuccess: (response: any) => {
            // Verify payment on server
            verifyPaystackPayment(response.reference)
          },
        })
        handler.openIframe()
      }
    }
    document.body.appendChild(script)
  }

  const verifyPaystackPayment = async (reference: string) => {
    try {
      const response = await paymentsAPI.verifyPaystackPayment(reference)
      if (response.status === "success") {
        onSuccess()
      } else {
        onError("Payment verification failed")
      }
    } catch (error: any) {
      onError(error.response?.data?.message || "Payment verification failed")
    }
  }

  const handleStripePayment = (data: any) => {
    // Redirect to Stripe checkout or use Stripe Elements
    // This is a simplified example - implement full Stripe integration
    const stripeCheckoutUrl = `https://checkout.stripe.com?order_id=${orderId}&amount=${amount}`
    window.location.href = stripeCheckoutUrl
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Choose Payment Method</h3>

      <div className="space-y-3">
        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-600">
          <input
            type="radio"
            name="payment"
            value="paystack"
            checked={selectedMethod === "paystack"}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-4 h-4"
          />
          <div className="ml-4">
            <p className="font-semibold">Paystack</p>
            <p className="text-sm text-gray-600">Pay with card, bank transfer, or mobile money</p>
          </div>
        </label>

        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-600">
          <input
            type="radio"
            name="payment"
            value="stripe"
            checked={selectedMethod === "stripe"}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-4 h-4"
          />
          <div className="ml-4">
            <p className="font-semibold">Stripe</p>
            <p className="text-sm text-gray-600">Pay securely with Stripe</p>
          </div>
        </label>

        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-600">
          <input
            type="radio"
            name="payment"
            value="offline"
            checked={selectedMethod === "offline"}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-4 h-4"
          />
          <div className="ml-4">
            <p className="font-semibold">Pay on Delivery</p>
            <p className="text-sm text-gray-600">Pay when your order arrives</p>
          </div>
        </label>
      </div>

      <button
        onClick={() => initPaymentMutation.mutate()}
        disabled={initPaymentMutation.isPending}
        className="btn btn-primary w-full py-3 text-lg"
      >
        {initPaymentMutation.isPending ? "Processing..." : `Pay ₦${amount.toLocaleString()}`}
      </button>
    </div>
  )
}
