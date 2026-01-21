"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { checkoutAPI } from "../api/checkout"

interface DeliveryDetails {
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  zipcode?: string
}

interface DeliveryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (details: DeliveryDetails & { customer_id: number }) => void
  initialData?: Partial<DeliveryDetails>
}

const NIGERIAN_STATES = [
  "Lagos",
  "Ogun",
  "Osun",
  "Ondo",
  "Ekiti",
  "Kwara",
  "Kogi",
  "Abia",
  "Anambra",
  "Enugu",
  "Ebonyi",
  "Imo",
  "Cross River",
  "Akwa Ibom",
  "Bayelsa",
  "Rivers",
  "Delta",
  "Edo",
  "Adamawa",
  "Taraba",
  "Bauchi",
  "Gombe",
  "Yobe",
  "Borno",
  "Kebbi",
  "Sokoto",
  "Zamfara",
  "Katsina",
  "Kano",
  "Jigawa",
  "Niger",
  "Nasarawa",
  "Plateau",
  "FCT",
]

export default function DeliveryDetailsModal({ isOpen, onClose, onSuccess, initialData }: DeliveryDetailsModalProps) {
  const [formData, setFormData] = useState<DeliveryDetails>({
    email: initialData?.email || "",
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "Nigeria",
    zipcode: initialData?.zipcode || "",
  })

  const guestCheckoutMutation = useMutation({
    mutationFn: (data: DeliveryDetails) => checkoutAPI.guestCheckout(data),
    onSuccess: (response) => {
      onSuccess({
        ...formData,
        customer_id: response.customer_id,
      })
      onClose()
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    guestCheckoutMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Delivery Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="your@email.com"
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="+234 123 456 7890"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="123 Main Street"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select name="state" value={formData.state} onChange={handleChange} required className="input w-full">
                <option value="">Select State</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="Lagos"
              />
            </div>
          </div>

          {/* Country and Zipcode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code (Optional)</label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode || ""}
                onChange={handleChange}
                className="input w-full"
                placeholder="10001"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex gap-4">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={guestCheckoutMutation.isPending} className="btn btn-primary flex-1">
              {guestCheckoutMutation.isPending ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
