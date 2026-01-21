"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { staffAPI } from "../../api/staff"
import type { StaffMember } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Staff() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => staffAPI.getAll(),
  })

  const deleteStaffMutation = useMutation({
    mutationFn: (id: number) => staffAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "inactive" }) => staffAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })

  const canCreate = hasPermission(user, "create_staff")
  const canView = hasPermission(user, "view_staff")

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      deleteStaffMutation.mutate(id)
    }
  }

  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    cashier: "bg-blue-100 text-blue-700",
    inventory_manager: "bg-green-100 text-green-700",
    marketer: "bg-orange-100 text-orange-700",
  }

  const rolePermissions = {
    admin: "Full access to all features",
    cashier: "Can process orders and use POS",
    inventory_manager: "Can manage products and inventory",
    marketer: "Can manage campaigns and view analytics",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            Add Staff Member
          </button>
        )}
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Admins</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {staffMembers?.filter((s) => s.role === "admin").length || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Cashiers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {staffMembers?.filter((s) => s.role === "cashier").length || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Inventory</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {staffMembers?.filter((s) => s.role === "inventory_manager").length || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Marketers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {staffMembers?.filter((s) => s.role === "marketer").length || 0}
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading staff...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers?.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold text-sm">
                            {staff.first_name?.[0] || staff.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {staff.first_name} {staff.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>@{staff.username}</td>
                    <td>{staff.email}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[staff.role]}`}>
                        {staff.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          staff.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td>{new Date(staff.date_created).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: staff.id,
                              status: staff.status === "active" ? "inactive" : "active",
                            })
                          }
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          {staff.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        {canCreate && (
                          <button
                            onClick={() => handleDelete(staff.id)}
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
        )}
      </div>

      {/* Role Permissions Reference */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Role Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(rolePermissions).map(([role, description]) => (
            <div key={role} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors]}`}
              >
                {role.replace("_", " ")}
              </span>
              <p className="text-sm text-gray-600 flex-1">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <StaffFormModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["staff"] })
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function StaffFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "cashier" as "cashier" | "inventory_manager" | "marketer",
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => staffAPI.create(data),
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Staff Member</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              required
              className="input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            >
              <option value="cashier">Cashier</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="marketer">Marketer</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="flex-1 btn btn-primary">
              {createMutation.isPending ? "Adding..." : "Add Staff Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
