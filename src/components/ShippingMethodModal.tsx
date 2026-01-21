"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { checkoutAPI } from "../api/checkout"


interface ShippingMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (method: string, cost: number, tax: number) => void
  state: string
  city: string
  items: any[]
}

const SHIPPING_METHODS = [
  { id: "CUSTOMER_PICKUP", name: "Customer/Rider Pick-up", cost: 0 },
  { id: "SOUTH_WESTERN", name: "South Western Regions via GIG Logistics", cost: 5500 },
  { id: "NORTHERN", name: "Abuja/Northern States via GIG Logistics", cost: 7500 },
  { id: "GUO_LOGISTICS", name: "Abuja via GUO Logistics", cost: 5000 },
  { id: "WITHIN_YABA", name: "Within Yaba/Nearby", cost: 2000 },
]

export default function ShippingMethodModal({
  isOpen,
  onClose,
  onSelect,
  state,
  city,
  items,
}: ShippingMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("CUSTOMER_PICKUP")

  const calculateShippingMutation = useMutation({
    mutationFn: () => checkoutAPI.calculateShipping(selectedMethod, state, city, items),
    onSuccess: (response) => {
      onSelect(selectedMethod, Number(response.shipping_cost), Number(response.tax))
      onClose()
    },
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Select Shipping</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-3">
          {SHIPPING_METHODS.map((method) => (
            <label
              key={method.id}
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition"
              style={{
                borderColor: selectedMethod === method.id ? "#16a34a" : "#e5e7eb",
                backgroundColor: selectedMethod === method.id ? "#f0fdf4" : "white",
              }}
            >
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-4 h-4"
              />
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-900">{method.name}</p>
              </div>
              <p className="font-bold text-gray-900">₦{method.cost.toLocaleString()}</p>
            </label>
          ))}

          <div className="border-t pt-6 flex gap-4">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => calculateShippingMutation.mutate()}
              disabled={calculateShippingMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {calculateShippingMutation.isPending ? "Calculating..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
