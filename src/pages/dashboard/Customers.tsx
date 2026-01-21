"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, Link } from "react-router-dom"
import { customersAPI } from "../../api/customers"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Customers() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
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

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => customersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
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
          <button onClick={() => navigate("/dashboard/customers/create")} className="btn btn-primary">
            + Add New Customer
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{customersData?.total || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Customer Groups</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Newsletter Subscribers</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
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
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Orders</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Spent</th>
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
                        <Link
                          to={`/dashboard/customers/${customer.id}`}
                          className="font-medium text-gray-900 hover:text-green-600"
                        >
                          {customer.first_name} {customer.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.orders_count || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ₦{Number(customer.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link
                            to={`/dashboard/customers/${customer.id}`}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            View
                          </Link>
                          {canEdit && (
                            <Link
                              to={`/dashboard/customers/${customer.id}/edit`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Edit
                            </Link>
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
    </div>
  )
}
