"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import { posAPI } from "../../api/pos"
import type { POSOrder } from "../../types"

export default function POS() {
  const [cart, setCart] = useState<Array<{ product_id: number; name: string; price: string; quantity: number }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const queryClient = useQueryClient()

  const { data: productsData } = useQuery({
    queryKey: ["pos-products", searchTerm],
    queryFn: () =>
      productsAPI.getAll({
        per_page: 20,
        search: searchTerm,
        stock_status: "instock",
      }),
  })

  const createOrderMutation = useMutation({
    mutationFn: (orderData: POSOrder) => posAPI.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["pos-products"] })
      setCart([])
      setCustomerName("")
      setCustomerPhone("")
      setNotes("")
      alert("Order created successfully!")
    },
    onError: () => {
      alert("Failed to create order. Please try again.")
    },
  })

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.product_id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product_id !== productId))
    } else {
      setCart(cart.map((item) => (item.product_id === productId ? { ...item, quantity } : item)))
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId))
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + Number.parseFloat(item.price) * item.quantity, 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Please add items to cart")
      return
    }

    const orderData: POSOrder = {
      items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes,
    }

    createOrderMutation.mutate(orderData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600 mt-1">Process walk-in sales quickly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <input
              type="text"
              placeholder="Search products..."
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productsData?.data.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="card text-left hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].src || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold text-primary-600">${product.price}</p>
                {product.manage_stock && (
                  <p className="text-xs text-gray-500 mt-1">{product.stock_quantity} in stock</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4">Current Sale</h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-2 pb-3 border-b">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-red-600 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                className="input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                type="tel"
                placeholder="Customer Phone (Optional)"
                className="input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <textarea
                placeholder="Notes (Optional)"
                rows={2}
                className="input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    paymentMethod === "cash"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    paymentMethod === "transfer"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrderMutation.isPending ? "Processing..." : "Complete Sale"}
            </button>

            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="w-full btn btn-secondary mt-2">
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
