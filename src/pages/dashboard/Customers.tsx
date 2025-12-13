"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customersAPI } from "../../api/customers"
import { ordersAPI } from "../../api/orders"
import type { Customer } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Customers() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers", currentPage, searchTerm],
    queryFn: () =>
      customersAPI.getAll({
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        orderby: "total_spent",
        order: "desc",
      }),
  })

  const { data: customerOrders } = useQuery({
    queryKey: ["customer-orders", selectedCustomer?.id],
    queryFn: () => ordersAPI.getAll({ customer: selectedCustomer!.id, per_page: 50 }),
    enabled: !!selectedCustomer,
  })

  const { data: customerGroups } = useQuery({
    queryKey: ["customer-groups"],
    queryFn: () => customersAPI.getGroups(),
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => customersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const canCreate = hasPermission(user, "create_customers")
  const canEdit = hasPermission(user, "edit_customers")

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(id)
    }
  }

  const getCustomerSegment = (customer: Customer) => {
    const totalSpent = Number.parseFloat(customer.total_spent)
    if (totalSpent > 1000) return { label: "VIP", color: "bg-purple-100 text-purple-700" }
    if (totalSpent > 500) return { label: "Premium", color: "bg-blue-100 text-blue-700" }
    if (totalSpent > 100) return { label: "Regular", color: "bg-green-100 text-green-700" }
    return { label: "New", color: "bg-gray-100 text-gray-700" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            Add Customer
          </button>
        )}
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">VIP</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {customersData?.data.filter((c) => Number.parseFloat(c.total_spent) > 1000).length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Spent over $1000</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Premium</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {customersData?.data.filter((c) => {
              const spent = Number.parseFloat(c.total_spent)
              return spent > 500 && spent <= 1000
            }).length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Spent $500 - $1000</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Regular</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {customersData?.data.filter((c) => {
              const spent = Number.parseFloat(c.total_spent)
              return spent > 100 && spent <= 500
            }).length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Spent $100 - $500</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">New</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {customersData?.data.filter((c) => Number.parseFloat(c.total_spent) <= 100).length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Spent under $100</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search customers by name or email..."
          className="input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading customers...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Segment</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customersData?.data.map((customer) => {
                    const segment = getCustomerSegment(customer)
                    return (
                      <tr key={customer.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-semibold text-sm">
                                {customer.first_name?.[0] || customer.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">
                                {customer.first_name} {customer.last_name}
                              </p>
                              <p className="text-xs text-gray-500">@{customer.username}</p>
                            </div>
                          </div>
                        </td>
                        <td>{customer.email}</td>
                        <td className="font-semibold">{customer.orders_count}</td>
                        <td className="font-semibold text-primary-600">${customer.total_spent}</td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${segment.color}`}>
                            {segment.label}
                          </span>
                        </td>
                        <td>{new Date(customer.date_created).toLocaleDateString()}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customersData && customersData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing page {currentPage} of {customersData.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, customersData.totalPages))}
                    disabled={currentPage === customersData.totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-2xl">
                    {selectedCustomer.first_name?.[0] || selectedCustomer.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h2>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCustomer.orders_count}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-primary-600">${selectedCustomer.total_spent}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {selectedCustomer.orders_count > 0
                      ? (Number.parseFloat(selectedCustomer.total_spent) / selectedCustomer.orders_count).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="text-gray-600">Username:</span>{" "}
                    <span className="font-medium">{selectedCustomer.username}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium">{selectedCustomer.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Customer Since:</span>{" "}
                    <span className="font-medium">{new Date(selectedCustomer.date_created).toLocaleDateString()}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Segment:</span>{" "}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCustomerSegment(selectedCustomer).color}`}
                    >
                      {getCustomerSegment(selectedCustomer).label}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order History</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {customerOrders?.data && customerOrders.data.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customerOrders.data.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-3 font-semibold">#{order.number}</td>
                            <td className="px-4 py-3">{new Date(order.date_created).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "processing"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">${order.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No orders yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    username: "",
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => customersAPI.create(data),
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Customer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              required
              className="input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="flex-1 btn btn-primary">
              {createMutation.isPending ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
