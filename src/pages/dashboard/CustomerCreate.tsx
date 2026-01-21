"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customersAPI } from "../../api/customers"

export default function CustomerCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    billing_address_1: "",
    billing_city: "",
    billing_state: "",
    billing_country: "Nigeria",
    shipping_address_1: "",
    shipping_city: "",
    shipping_state: "",
    shipping_country: "Nigeria",
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => customersAPI.create(data),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      navigate(`/dashboard/customers/${customer.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/customers")} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-gray-600 mt-1">Create a new customer account</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/dashboard/customers")} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={createMutation.isPending} className="btn btn-primary">
            {createMutation.isPending ? "Creating..." : "Add Customer"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card space-y-6">
          <h2 className="text-xl font-bold">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                required
                className="input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                required
                className="input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="card space-y-6 mt-6">
          <h2 className="text-xl font-bold">Billing Address</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              className="input"
              value={formData.billing_address_1}
              onChange={(e) => setFormData({ ...formData, billing_address_1: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                className="input"
                value={formData.billing_city}
                onChange={(e) => setFormData({ ...formData, billing_city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                className="input"
                value={formData.billing_state}
                onChange={(e) => setFormData({ ...formData, billing_state: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card space-y-6 mt-6">
          <h2 className="text-xl font-bold">Shipping Address</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              className="input"
              value={formData.shipping_address_1}
              onChange={(e) => setFormData({ ...formData, shipping_address_1: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                className="input"
                value={formData.shipping_city}
                onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                className="input"
                value={formData.shipping_state}
                onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
