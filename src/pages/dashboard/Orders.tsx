"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, Link } from "react-router-dom"
import { ordersAPI } from "../../api/orders"
import type { Order } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Orders() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  // const queryClient = useQueryClient()
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

  const canCreate = hasPermission(user, "create_orders")

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
          <div className="text-3xl font-bold text-gray-900 mt-2">{ordersData?.total || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Amount Owed</div>
          <div className="text-3xl font-bold text-red-600 mt-2">₦0</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Completed Orders</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {ordersData?.data?.filter((o) => o.status === "completed").length || 0}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Pending Orders</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {ordersData?.data?.filter((o) => o.status === "pending").length || 0}
          </div>
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
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/orders/${order.id}`}
                          className="font-medium text-gray-900 hover:text-green-600"
                        >
                          #{order.number}
                        </Link>
                      </td>
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.date_created).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/orders/${order.id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View
                        </Link>
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
    </div>
  )
}
