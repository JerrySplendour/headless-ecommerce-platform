"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  isLoggedIn?: boolean
  userId?: number
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

const MAJOR_CITIES: Record<string, string[]> = {
  Lagos: ["Ikeja", "Lekki", "Victoria Island", "Surulere", "Yaba", "Ikoyi", "Ajah", "Festac"],
  FCT: ["Abuja", "Gwagwalada", "Kuje", "Bwari"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme"],
  Ogun: ["Abeokuta", "Ota", "Ijebu Ode", "Sagamu"],
}

export default function DeliveryDetailsModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isLoggedIn,
  userId,
}: DeliveryDetailsModalProps) {
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

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({})
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const guestCheckoutMutation = useMutation({
    mutationFn: (data: DeliveryDetails) => checkoutAPI.guestCheckout(data),
    onSuccess: (response) => {
      onSuccess({
        ...formData,
        customer_id: response.customer_id,
      })
      onClose()
    },
    onError: (error: any) => {
      setErrors({ email: error.message || "Failed to save details" })
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryDetails, string>> = {}

    if (!formData.email) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.first_name) newErrors.first_name = "First name is required"
    if (!formData.last_name) newErrors.last_name = "Last name is required"
    if (!formData.phone) newErrors.phone = "Phone number is required"
    else if (!/^(\+234|0)[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid Nigerian phone number"
    }
    if (!formData.address) newErrors.address = "Address is required"
    if (!formData.state) newErrors.state = "State is required"
    if (!formData.city) newErrors.city = "City is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is modified
    if (errors[name as keyof DeliveryDetails]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    guestCheckoutMutation.mutate(formData)
  }

  const citySuggestions = formData.state ? MAJOR_CITIES[formData.state] || [] : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your shipping information</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {isLoggedIn && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">You're logged in</p>
                <p className="text-sm text-green-700">Your details will be saved for future orders.</p>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input w-full ${errors.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`input w-full ${errors.first_name ? "border-red-300" : ""}`}
                placeholder="John"
              />
              {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`input w-full ${errors.last_name ? "border-red-300" : ""}`}
                placeholder="Doe"
              />
              {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🇳🇬</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input w-full pl-10 ${errors.phone ? "border-red-300" : ""}`}
                placeholder="+234 801 234 5678"
              />
            </div>
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`input w-full ${errors.address ? "border-red-300" : ""}`}
              placeholder="123 Main Street, Apartment 4B"
            />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={(e) => {
                  handleChange(e)
                  // Reset city when state changes
                  setFormData((prev) => ({ ...prev, city: "" }))
                }}
                className={`input w-full ${errors.state ? "border-red-300" : ""}`}
              >
                <option value="">Select State</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className={`input w-full ${errors.city ? "border-red-300" : ""}`}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}

              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {citySuggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, city }))
                        setShowCitySuggestions(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
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
                className="input w-full bg-gray-50"
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
                placeholder="100001"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={guestCheckoutMutation.isPending} className="btn btn-primary flex-1">
              {guestCheckoutMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Continue to Shipping"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
