"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersAPI } from "../../api/orders"
import type { Order } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersAPI.getById(Number(id)),
    enabled: !!id,
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
      queryClient.invalidateQueries({ queryKey: ["order", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <button onClick={() => navigate("/dashboard/orders")} className="btn btn-primary">
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/orders")} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.number}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(order.date_created).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn btn-secondary">
            Print Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Order Status</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({ id: order.id, status: e.target.value as Order["status"] })
                  }
                  className="input max-w-xs"
                  disabled={updateStatusMutation.isPending}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                {updateStatusMutation.isPending && <span className="text-sm text-gray-500">Updating...</span>}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.line_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">ID: {item.product_id}</p>
                      </td>
                      <td className="px-4 py-4 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-right">₦{Number(item.price).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-semibold">₦{Number(item.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing Address */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Billing Address</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-semibold">
                  {order.billing.first_name} {order.billing.last_name}
                </p>
                <p className="text-gray-600">{order.billing.address_1}</p>
                <p className="text-gray-600">
                  {order.billing.city}, {order.billing.state}
                </p>
                <p className="text-gray-600">{order.billing.country}</p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-600">Email: </span>
                  <a href={`mailto:${order.billing.email}`} className="text-green-600 hover:underline">
                    {order.billing.email}
                  </a>
                </p>
                <p>
                  <span className="text-gray-600">Phone: </span>
                  <a href={`tel:${order.billing.phone}`} className="text-green-600 hover:underline">
                    {order.billing.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Notes</h2>
            <div className="space-y-4">
              {order.meta_data?.find((m) => m.key === "_customer_notes")?.value ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Customer Note</p>
                  <p className="text-yellow-700">{order.meta_data.find((m) => m.key === "_customer_notes")?.value}</p>
                </div>
              ) : (
                <p className="text-gray-500">No notes for this order.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₦{Number(order.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span>₦0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>₦0</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-xl text-green-600">₦{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Payment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Paid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="capitalize">
                  {order.meta_data?.find((m) => m.key === "_payment_method_custom")?.value || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">
                  {order.billing.first_name?.[0]}
                  {order.billing.last_name?.[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold">
                  {order.billing.first_name} {order.billing.last_name}
                </p>
                <p className="text-sm text-gray-500">{order.billing.email}</p>
              </div>
            </div>
            {order.customer_id > 0 && (
              <button
                onClick={() => navigate(`/dashboard/customers/${order.customer_id}`)}
                className="btn btn-secondary w-full text-sm"
              >
                View Customer Profile
              </button>
            )}
          </div>

          {/* Sales Channel */}
          <div className="card">
            <h3 className="font-semibold mb-4">Sales Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Channel:</span>
                <span className="capitalize">
                  {order.meta_data?.find((m) => m.key === "_sales_channel")?.value || "Website"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{order.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
