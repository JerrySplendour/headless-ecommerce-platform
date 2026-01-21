"use client"

import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { customersAPI } from "../../api/customers"
import { ordersAPI } from "../../api/orders"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const canEdit = hasPermission(user, "edit_customers")

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersAPI.getById(Number(id)),
    enabled: !!id,
  })

  const { data: customerOrders } = useQuery({
    queryKey: ["customer-orders", id],
    queryFn: () => ordersAPI.getAll({ customer: Number(id), per_page: 50 }),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customer...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h2>
        <button onClick={() => navigate("/dashboard/customers")} className="btn btn-primary">
          Back to Customers
        </button>
      </div>
    )
  }

  const daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(customer.date_created).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/customers")} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {customer.first_name?.[0] || customer.email[0].toUpperCase()}
                {customer.last_name?.[0] || ""}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {customer.first_name} {customer.last_name}
              </h1>
              <p className="text-gray-600 mt-1">Customer since {daysSinceJoined} days ago</p>
            </div>
          </div>
        </div>
        {canEdit && (
          <Link to={`/dashboard/customers/${id}/edit`} className="btn btn-primary">
            Edit Customer
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-sm text-gray-600">Last Order</div>
              <div className="text-lg font-bold mt-1">
                {customerOrders?.data[0]
                  ? new Date(customerOrders.data[0].date_created).toLocaleDateString()
                  : "No orders"}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Total Spent</div>
              <div className="text-lg font-bold mt-1 text-green-600">
                ₦{Number(customer.total_spent || 0).toLocaleString()}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Total Orders</div>
              <div className="text-lg font-bold mt-1">{customer.orders_count || 0}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Avg Order Value</div>
              <div className="text-lg font-bold mt-1">
                ₦
                {customer.orders_count > 0
                  ? Math.round(Number(customer.total_spent) / customer.orders_count).toLocaleString()
                  : 0}
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Order History</h2>
            {customerOrders?.data.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customerOrders?.data.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 font-medium">#{order.number}</td>
                        <td className="px-4 py-4 text-gray-600">{new Date(order.date_created).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold">₦{Number(order.total).toLocaleString()}</td>
                        <td className="px-4 py-4 text-center">
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
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">
                  <a href={`mailto:${customer.email}`} className="text-green-600 hover:underline">
                    {customer.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Username</label>
                <p className="font-medium">{customer.username || "-"}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="card">
            <h3 className="font-semibold mb-4">Customer Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Customer ID</label>
                <p className="font-mono">{customer.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Joined</label>
                <p>{new Date(customer.date_created).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/dashboard/create-order" className="btn btn-secondary w-full text-sm">
                Create Order for Customer
              </Link>
              <a
                href={`mailto:${customer.email}`}
                className="btn btn-secondary w-full text-sm inline-block text-center"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
