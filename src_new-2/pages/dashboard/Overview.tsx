"use client"

import { useQuery } from "@tanstack/react-query"
import { analyticsAPI } from "../../api/analytics"
import { dashboardAPI } from "../../api/dashboard"
import { ordersAPI } from "../../api/orders"
import { Link } from "react-router-dom"
import { useState } from "react"

export default function Overview() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")

  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics", period],
    queryFn: () => dashboardAPI.getMetrics(period),
  })

  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => ordersAPI.getAll({ per_page: 5, orderby: "date" }),
  })

  const { data: topProducts } = useQuery({
    queryKey: ["top-products"],
    queryFn: () => analyticsAPI.getTopProducts(5),
  })

  const overviewWidgets = [
    {
      label: "Recent Orders",
      value: metrics?.recent_orders || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "Products Sold",
      value: metrics?.products_sold || 0,
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      label: "New Customers",
      value: metrics?.new_customers || 0,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      label: "Website Visits",
      value: metrics?.website_visits || 0,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
  ]

  const salesWidgets = [
    {
      label: "Total Sales",
      value: `₦${metrics?.total_sales || "0.00"}`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Total Settled",
      value: `₦${metrics?.total_settled || "0.00"}`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Owned",
      value: `₦${metrics?.total_owned || "0.00"}`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Offline Sales",
      value: metrics?.offline_sales || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your business performance at a glance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")}
          className="input max-w-xs"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewWidgets.map((widget) => (
          <div key={widget.label} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={widget.icon} />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{widget.label}</p>
            <p className="text-3xl font-bold text-gray-900">{widget.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {salesWidgets.map((widget) => (
          <div key={widget.label} className={`card border-l-4 border-l-gray-300`}>
            <p className="text-gray-600 text-sm mb-2">{widget.label}</p>
            <p className={`text-2xl font-bold ${widget.color}`}>{widget.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders?.data.map((order) => (
              <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div>
                  <p className="font-semibold">#{order.number}</p>
                  <p className="text-sm text-gray-600">
                    {order.billing.first_name} {order.billing.last_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Top Products</h2>
            <Link to="/dashboard/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts?.map((product) => (
              <div key={product.product_id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales_count} sold</p>
                </div>
                <p className="font-semibold text-primary-600">${product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
