"use client"

import { useLocation, useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const orderId = location.state?.orderId

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-[100px]">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        {orderId && <p className="text-lg font-medium text-primary-600 mb-8">Order #{orderId}</p>}

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </span>
              <span className="text-sm text-gray-600">
                You'll receive an email confirmation with your order details.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </span>
              <span className="text-sm text-gray-600">Our team will prepare your order for shipping.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </span>
              <span className="text-sm text-gray-600">You'll receive tracking information once your order ships.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          {isAuthenticated ? (
            <Link to="/account/orders" className="btn btn-primary w-full block">
              View My Orders
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary w-full block">
              Create Account to Track Orders
            </Link>
          )}
          <button onClick={() => navigate("/products")} className="btn btn-secondary w-full">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
