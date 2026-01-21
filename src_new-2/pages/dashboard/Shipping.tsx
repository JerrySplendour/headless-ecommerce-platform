"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shippingAPI } from "../../api/shipping"

interface ShippingRate {
  rate_id?: number
  label: string
  cost: number
  order: number
}

interface ShippingZone {
  id: number
  name: string
  order: number
  methods: ShippingRate[]
}

export default function Shipping() {
  const queryClient = useQueryClient()
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [zoneName, setZoneName] = useState("")
  const [rates, setRates] = useState<ShippingRate[]>([])

  const { data: zones, isLoading } = useQuery({
    queryKey: ["shipping-zones"],
    queryFn: () => shippingAPI.getZones(),
  })

  const saveZoneMutation = useMutation({
    mutationFn: (data: { zone_id?: number; zone_name: string; rates: ShippingRate[] }) => shippingAPI.saveZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-zones"] })
      handleCloseForm()
    },
  })

  const deleteZoneMutation = useMutation({
    mutationFn: (zoneId: number) => shippingAPI.deleteZone(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-zones"] })
    },
  })

  const handleEditZone = (zone: ShippingZone) => {
    setEditingZone(zone)
    setZoneName(zone.name)
    setRates(zone.methods || [])
    setShowForm(true)
  }

  const handleAddRate = () => {
    setRates([...rates, { label: "", cost: 0, order: rates.length }])
  }

  const handleRemoveRate = (index: number) => {
    setRates(rates.filter((_, i) => i !== index))
  }

  const handleUpdateRate = (index: number, field: string, value: any) => {
    const updatedRates = [...rates]
    updatedRates[index] = { ...updatedRates[index], [field]: value }
    setRates(updatedRates)
  }

  const handleSaveZone = () => {
    if (!zoneName.trim()) {
      alert("Zone name is required")
      return
    }

    saveZoneMutation.mutate({
      zone_id: editingZone?.id,
      zone_name: zoneName,
      rates,
    })
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingZone(null)
    setZoneName("")
    setRates([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600 mt-1">Configure shipping zones and rates</p>
        </div>
        <button
          onClick={() => {
            setEditingZone(null)
            setZoneName("")
            setRates([])
            setShowForm(true)
          }}
          className="btn btn-primary"
        >
          Add Shipping Zone
        </button>
      </div>

      {isLoading ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Loading shipping zones...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {zones?.map((zone: ShippingZone) => (
            <div key={zone.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{zone.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEditZone(zone)} className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this zone?")) {
                        deleteZoneMutation.mutate(zone.id)
                      }
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Shipping Method
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {zone.methods?.map((method: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">{method.label || method.method_title}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₦
                          {(typeof method.cost === "string"
                            ? Number.parseFloat(method.cost)
                            : method.cost
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shipping Zone Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">{editingZone ? "Edit Zone" : "New Shipping Zone"}</h2>
              <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Zone Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Lagos Metro, Northern Region"
                />
              </div>

              {/* Shipping Rates */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Shipping Methods</label>
                  <button onClick={handleAddRate} className="btn btn-secondary btn-sm">
                    Add Rate
                  </button>
                </div>

                <div className="space-y-4">
                  {rates.map((rate, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Method Label</label>
                        <input
                          type="text"
                          value={rate.label}
                          onChange={(e) => handleUpdateRate(index, "label", e.target.value)}
                          className="input w-full"
                          placeholder="e.g., Express Delivery, Standard"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Cost (₦)</label>
                        <input
                          type="number"
                          value={rate.cost}
                          onChange={(e) => handleUpdateRate(index, "cost", Number.parseFloat(e.target.value) || 0)}
                          className="input w-full"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <button onClick={() => handleRemoveRate(index)} className="btn btn-danger btn-sm">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-6 flex gap-4">
                <button onClick={handleCloseForm} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleSaveZone}
                  disabled={saveZoneMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {saveZoneMutation.isPending ? "Saving..." : "Save Zone"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
