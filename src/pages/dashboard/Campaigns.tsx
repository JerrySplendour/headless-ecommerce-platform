"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { campaignsAPI } from "../../api/campaigns"
import type { Campaign } from "../../types"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Campaigns() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsAPI.getAll({ per_page: 100 }),
  })

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => campaignsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })

  const canCreate = hasPermission(user, "create_campaigns")
  const canView = hasPermission(user, "view_campaigns")

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaignMutation.mutate(id)
    }
  }

  const getCampaignStatus = (campaign: Campaign) => {
    if (campaign.date_expires && new Date(campaign.date_expires) < new Date()) {
      return { label: "Expired", color: "bg-red-100 text-red-700" }
    }
    if (campaign.usage_limit && campaign.usage_count >= campaign.usage_limit) {
      return { label: "Limit Reached", color: "bg-orange-100 text-orange-700" }
    }
    return { label: "Active", color: "bg-green-100 text-green-700" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns & Discounts</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional campaigns</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            Create Campaign
          </button>
        )}
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Active</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {campaignsData?.data.filter((c) => {
              const status = getCampaignStatus(c)
              return status.label === "Active"
            }).length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Running campaigns</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Total</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{campaignsData?.data.length || 0}</p>
          <p className="text-sm text-gray-600 mt-1">All campaigns</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Total Uses</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {campaignsData?.data.reduce((sum, c) => sum + c.usage_count, 0) || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Campaign redemptions</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Expired</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {campaignsData?.data.filter((c) => {
              const status = getCampaignStatus(c)
              return status.label === "Expired"
            }).length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Past campaigns</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading campaigns...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaignsData?.data.map((campaign) => {
                  const status = getCampaignStatus(campaign)
                  return (
                    <tr key={campaign.id}>
                      <td>
                        <span className="font-semibold font-mono text-primary-600">{campaign.code}</span>
                      </td>
                      <td className="capitalize">{campaign.type.replace("_", " ")}</td>
                      <td className="font-semibold">
                        {campaign.type === "percentage" ? `${campaign.amount}%` : `$${campaign.amount}`}
                      </td>
                      <td>
                        <span className="text-sm">
                          {campaign.usage_count} / {campaign.usage_limit || "∞"}
                        </span>
                      </td>
                      <td>
                        {campaign.date_expires ? new Date(campaign.date_expires).toLocaleDateString() : "No expiry"}
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {canView && (
                            <button
                              onClick={() => setSelectedCampaign(campaign)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View
                            </button>
                          )}
                          {canCreate && (
                            <button
                              onClick={() => handleDelete(campaign.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <CampaignFormModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] })
            setShowAddModal(false)
          }}
        />
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Campaign Details</h2>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Campaign Code</p>
                <p className="text-2xl font-bold font-mono text-primary-600">{selectedCampaign.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Discount Type</p>
                  <p className="font-semibold capitalize">{selectedCampaign.type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount Amount</p>
                  <p className="font-semibold">
                    {selectedCampaign.type === "percentage"
                      ? `${selectedCampaign.amount}%`
                      : `$${selectedCampaign.amount}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usage Count</p>
                  <p className="font-semibold">{selectedCampaign.usage_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usage Limit</p>
                  <p className="font-semibold">{selectedCampaign.usage_limit || "Unlimited"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold">{new Date(selectedCampaign.date_created).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expires</p>
                <p className="font-semibold">
                  {selectedCampaign.date_expires
                    ? new Date(selectedCampaign.date_expires).toLocaleDateString()
                    : "No expiry date"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CampaignFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "percent" | "fixed_cart" | "fixed_product",
    amount: "",
    date_expires: "",
    usage_limit: "",
    description: "",
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => campaignsAPI.create(data),
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      usage_limit: formData.usage_limit ? Number.parseInt(formData.usage_limit) : undefined,
      date_expires: formData.date_expires || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Campaign</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., SAVE20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <select
              className="input"
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
            >
              <option value="percent">Percentage Discount</option>
              <option value="fixed_cart">Fixed Cart Discount</option>
              <option value="fixed_product">Fixed Product Discount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.discount_type === "percent" ? "Discount Percentage" : "Discount Amount"}
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="input"
              placeholder={formData.discount_type === "percent" ? "e.g., 20" : "e.g., 10.00"}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit (Optional)</label>
            <input
              type="number"
              className="input"
              placeholder="Leave empty for unlimited"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
            <input
              type="date"
              className="input"
              value={formData.date_expires}
              onChange={(e) => setFormData({ ...formData, date_expires: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Campaign description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="flex-1 btn btn-primary">
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
