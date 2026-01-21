"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { analyticsAPI } from "../../api/analytics"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function Analytics() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month")
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  })

  const { data: overview } = useQuery({
    queryKey: ["analytics-overview", period],
    queryFn: () => analyticsAPI.getOverview({ period }),
  })

  const { data: revenueData } = useQuery({
    queryKey: ["revenue-chart", period, dateRange],
    queryFn: () =>
      analyticsAPI.getRevenue({
        period,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }),
  })

  const { data: topProducts } = useQuery({
    queryKey: ["top-products-analytics"],
    queryFn: () => analyticsAPI.getTopProducts(10),
  })

  const { data: salesByChannel } = useQuery({
    queryKey: ["sales-by-channel", dateRange],
    queryFn: () =>
      analyticsAPI.getSalesByChannel({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }),
  })

  const { data: customerGrowth } = useQuery({
    queryKey: ["customer-growth", period],
    queryFn: () => analyticsAPI.getCustomerGrowth({ period }),
  })

  const revenueChartData = {
    labels: revenueData?.labels || [],
    datasets: [
      {
        label: "Revenue",
        data: revenueData?.data || [],
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
      },
    ],
  }

  const channelChartData = {
    labels: salesByChannel?.map((c) => c.channel) || [],
    datasets: [
      {
        label: "Revenue by Channel",
        data: salesByChannel?.map((c) => Number.parseFloat(c.revenue)) || [],
        backgroundColor: [
          "rgba(37, 99, 235, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
      },
    ],
  }

  const customerGrowthChartData = {
    labels: customerGrowth?.labels || [],
    datasets: [
      {
        label: "New Customers",
        data: customerGrowth?.data || [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your business performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("today")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "today" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "week" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "month" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${period === "year" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            {overview?.revenue.change !== undefined && (
              <span
                className={`text-sm font-medium ${overview.revenue.change > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {overview.revenue.change > 0 ? "+" : ""}
                {overview.revenue.change}%
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">${overview?.revenue.total.toFixed(2) || "0.00"}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            {overview?.orders.change !== undefined && (
              <span className={`text-sm font-medium ${overview.orders.change > 0 ? "text-green-600" : "text-red-600"}`}>
                {overview.orders.change > 0 ? "+" : ""}
                {overview.orders.change}%
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.orders.total || 0}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            {overview?.customers.change !== undefined && (
              <span
                className={`text-sm font-medium ${overview.customers.change > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {overview.customers.change > 0 ? "+" : ""}
                {overview.customers.change}%
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.customers.total || 0}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            {overview?.products_sold.change !== undefined && (
              <span
                className={`text-sm font-medium ${overview.products_sold.change > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {overview.products_sold.change > 0 ? "+" : ""}
                {overview.products_sold.change}%
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Products Sold</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.products_sold.total || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Revenue Trend</h2>
          <div className="h-64">
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Sales by Channel */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Sales by Channel</h2>
          <div className="h-64">
            <Bar
              data={channelChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Customer Growth */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Customer Growth</h2>
          <div className="h-64">
            <Line
              data={customerGrowthChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {topProducts?.map((product, index) => (
              <div key={product.product_id} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{product.name}</p>
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
