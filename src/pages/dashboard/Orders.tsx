"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersAPI } from "../../api/orders"
import type { Order } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Orders() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", currentPage, statusFilter],
    queryFn: () =>
      ordersAPI.getAll({
        page: currentPage,
        per_page: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order["status"] }) => ordersAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setSelectedOrder(null)
    },
  })

  const canEdit = hasPermission(user, "edit_orders")

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
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      "on-hold": "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-gray-100 text-gray-700",
      refunded: "bg-purple-100 text-purple-700",
      failed: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getSalesChannel = (order: Order) => {
    const channelMeta = order.meta_data?.find((meta) => meta.key === "sales_channel")
    return channelMeta?.value || "website"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage all your orders from different channels</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <select className="input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
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
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.data.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="font-semibold">#{order.number}</span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">
                            {order.billing.first_name} {order.billing.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{order.billing.email}</p>
                        </div>
                      </td>
                      <td>{new Date(order.date_created).toLocaleDateString()}</td>
                      <td>
                        <span className="capitalize text-sm">{getSalesChannel(order)}</span>
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="font-semibold">${order.total}</td>
                      <td>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              {canEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <div className="flex gap-2">
                    <select
                      className="input flex-1"
                      defaultValue={selectedOrder.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: selectedOrder.id,
                          status: e.target.value as Order["status"],
                        })
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.billing.first_name} {selectedOrder.billing.last_name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium">{selectedOrder.billing.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium">{selectedOrder.billing.phone}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Address:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.billing.address_1}, {selectedOrder.billing.city}, {selectedOrder.billing.state},{" "}
                      {selectedOrder.billing.country}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.line_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">${item.price}</td>
                          <td className="px-4 py-3 text-right font-semibold">${item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg">${selectedOrder.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Order Meta */}
              <div>
                <h3 className="font-semibold mb-3">Order Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="text-gray-600">Date:</span>{" "}
                    <span className="font-medium">{new Date(selectedOrder.date_created).toLocaleString()}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Sales Channel:</span>{" "}
                    <span className="font-medium capitalize">{getSalesChannel(selectedOrder)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
