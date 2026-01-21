"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersAPI } from "../../api/orders"
import { paymentsAPI } from "../../api/payments"
import type { Order } from "../../types"

export default function Payments() {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState("pending")

  const { data: ordersData } = useQuery({
    queryKey: ["orders", "pending-payment"],
    queryFn: () => ordersAPI.getAll({ status: "on-hold", per_page: 50 }),
  })

  const confirmPaymentMutation = useMutation({
    mutationFn: (orderId: number) => paymentsAPI.confirmOfflinePayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const pendingOrders =
    ordersData?.data.filter((order: Order) => {
      const paymentStatus = order.meta_data?.find((m) => m.key === "_payment_status_custom")?.value
      return paymentStatus !== "paid"
    }) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-1">Manage and confirm payments</p>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === "pending"
                ? "bg-primary-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Pending Payments
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === "confirmed"
                ? "bg-primary-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Confirmed
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingOrders.map((order: Order) => {
                const paymentMethod = order.meta_data?.find((m) => m.key === "_payment_method_custom")?.value
                const paymentStatus = order.meta_data?.find((m) => m.key === "_payment_status_custom")?.value

                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-semibold">#{order.number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {order.billing.first_name} {order.billing.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{order.billing.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">₦{Number.parseFloat(order.total).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize">{paymentMethod || "Not set"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {paymentStatus !== "paid" && (
                        <button
                          onClick={() => confirmPaymentMutation.mutate(order.id)}
                          disabled={confirmPaymentMutation.isPending}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pendingOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No pending payments</p>
          </div>
        )}
      </div>
    </div>
  )
}
