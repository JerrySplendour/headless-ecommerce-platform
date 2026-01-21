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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
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
      setSelectedCustomer(null)
    },
  })

  const canCreate = hasPermission(user, "create_customers")
  const canEdit = hasPermission(user, "edit_customers")
  const canDelete = hasPermission(user, "delete_customers")

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage and engage with your customers</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            + Add New Customer
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">797</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Customer Groups</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Newsletter Subscribers</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">118</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search customers..."
            className="input max-w-xs"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <button
            onClick={() => {
              setSearchTerm("")
              setCurrentPage(1)
            }}
            className="btn btn-secondary"
          >
            Clear Search
          </button>
        </div>
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
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date Added</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email Address</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone Number</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customersData?.data.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(customer.date_created).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">-</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            View
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => setEditingCustomer(customer)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
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
                  ))}
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

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Customer Profile</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {selectedCustomer.first_name.charAt(0)}
                    {selectedCustomer.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                  <p className="text-gray-600">Customer since: 0 days ago</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <div className="text-sm text-gray-600">Last Order</div>
                  <div className="text-lg font-bold mt-1">1/14/2026</div>
                </div>
                <div className="card">
                  <div className="text-sm text-gray-600">Total Amount Spent</div>
                  <div className="text-lg font-bold mt-1">₦65,975.00</div>
                </div>
                <div className="card">
                  <div className="text-sm text-gray-600">Total Orders</div>
                  <div className="text-lg font-bold mt-1">1</div>
                </div>
                <div className="card">
                  <div className="text-sm text-gray-600">Total Orders Value</div>
                  <div className="text-lg font-bold mt-1">₦65,000.00</div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="font-semibold mb-3">Contact Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Phone:</span> {selectedCustomer.email || "-"}
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span> {selectedCustomer.email}
                  </p>
                </div>
              </div>

              {/* Orders */}
              <div>
                <h3 className="font-semibold mb-3">Purchase History</h3>
                <div className="space-y-2">
                  {customerOrders?.data.length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  ) : (
                    customerOrders?.data.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">Order #{order.number}</p>
                          <p className="text-xs text-gray-500">{new Date(order.date_created).toLocaleDateString()}</p>
                        </div>
                        <span className="font-semibold">₦{Number(order.total).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setSelectedCustomer(null)} className="flex-1 btn btn-secondary">
                  Close
                </button>
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditingCustomer(selectedCustomer)
                      setSelectedCustomer(null)
                    }}
                    className="flex-1 btn btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Customer Modal */}
      {(showAddModal || editingCustomer) && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => {
            setShowAddModal(false)
            setEditingCustomer(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            setShowAddModal(false)
            setEditingCustomer(null)
          }}
        />
      )}
    </div>
  )
}

function CustomerFormModal({
  customer,
  onClose,
  onSuccess,
}: {
  customer: Customer | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: "",
    instagram: "",
    shipping_address: "",
    billing_address: "",
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) => (customer ? customersAPI.update(customer.id, data) : customersAPI.create(data)),
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">{customer ? "Edit Customer" : "Add New Customer"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Handle</label>
              <input
                type="text"
                className="input"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
            <textarea
              rows={3}
              className="input"
              value={formData.shipping_address}
              onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
            <textarea
              rows={3}
              className="input"
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 btn btn-primary">
              {saveMutation.isPending ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
