"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersAPI } from "../../api/orders"
import type { Order } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"
import { useNavigate } from "react-router-dom"

export default function Orders() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", currentPage, statusFilter, paymentFilter],
    queryFn: () =>
      ordersAPI.getAll({
        page: currentPage,
        per_page: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  })

  const { data: orderDetail } = useQuery({
    queryKey: ["order-detail", selectedOrder?.id],
    queryFn: () => ordersAPI.getById(selectedOrder!.id),
    enabled: !!selectedOrder,
  })

  const canCreate = hasPermission(user, "create_orders")
  const canEdit = hasPermission(user, "edit_orders")
  const canDelete = hasPermission(user, "delete_orders")

  const statusOptions: Order["status"][] = [
    "pending",
    "processing",
    "on-hold",
    "completed",
    "cancelled",
    "refunded",
    "failed",
  ]

  const getStatusColor = (status: Order["status"]) => {
    const colors: Record<Order["status"], string> = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      "on-hold": "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
      failed: "bg-red-100 text-red-700",
    }
    return colors[status] || colors.pending
  }

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order["status"] }) => ordersAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setSelectedOrder(null)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        {canCreate && (
          <button onClick={() => navigate("/dashboard/create-order")} className="btn btn-primary">
            + Create Order
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">890</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Amount Owed</div>
          <div className="text-3xl font-bold text-red-600 mt-2">₦1,080,500</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Completed Orders</div>
          <div className="text-3xl font-bold text-green-600 mt-2">745</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Unpaid Orders</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">11</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <select
            className="input max-w-xs"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All Order Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="input max-w-xs"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partially Paid</option>
          </select>
          <button
            onClick={() => {
              setStatusFilter("all")
              setPaymentFilter("all")
              setCurrentPage(1)
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order Number</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Shipping</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.data.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.number}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium">
                            {order.billing.first_name} {order.billing.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{order.billing.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">₦{Number(order.total).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Paid</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">Shipped</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.date_created).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ordersData && ordersData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing page {currentPage} of {ordersData.totalPages}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, ordersData.totalPages))}
                    disabled={currentPage === ordersData.totalPages}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Status</label>
                  <div className="mt-2 space-y-2">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({ id: selectedOrder.id, status: e.target.value as Order["status"] })
                      }
                      className="input"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Paid
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Billing Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Billing Address</h3>
                  <p className="text-sm">
                    {selectedOrder.billing.first_name} {selectedOrder.billing.last_name}
                  </p>
                  <p className="text-sm">{selectedOrder.billing.address_1}</p>
                  <p className="text-sm">
                    {selectedOrder.billing.city}, {selectedOrder.billing.state}
                  </p>
                  <p className="text-sm mt-2">{selectedOrder.billing.phone}</p>
                  <p className="text-sm">{selectedOrder.billing.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₦{Number(selectedOrder.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₦0</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>₦{Number(selectedOrder.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="space-y-3 border-t border-b border-gray-200 py-3">
                  {selectedOrder.line_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-500">
                          {item.quantity}x ₦{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                      <span className="font-semibold">₦{Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 btn btn-secondary">
                  Close
                </button>
                {canEdit && (
                  <button onClick={() => setSelectedOrder(null)} className="flex-1 btn btn-primary">
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}