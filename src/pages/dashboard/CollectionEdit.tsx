"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import MediaLibraryModal from "../../components/MediaLibraryModal"

export default function CollectionEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => productsAPI.getCollection(Number(id)),
    enabled: !!id,
  })

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product_ids: [] as number[],
  })
  const [image, setImage] = useState<{ id: number; src: string } | null>(null)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || "",
        description: collection.description || "",
        product_ids: collection.product_ids || [],
      })
      if (collection.image_url) {
        setImage({ id: 0, src: collection.image_url })
      }
    }
  }, [collection])

  const { data: products } = useQuery({
    queryKey: ["all-products"],
    queryFn: () => productsAPI.getAll({ per_page: 100 }),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsAPI.updateCollection(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      queryClient.invalidateQueries({ queryKey: ["collection", id] })
      navigate("/dashboard/products")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading collection...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/products")} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Collection</h1>
            <p className="text-gray-600 mt-1">Update collection details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/dashboard/collections/${id}`)} className="btn btn-secondary">
            View Collection
          </button>
          <button onClick={handleSubmit} disabled={updateMutation.isPending} className="btn btn-primary">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Select Products</h2>
              <p className="text-sm text-gray-500 mb-4">{formData.product_ids.length} products selected</p>
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {products?.data.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.product_ids.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, product_ids: [...formData.product_ids, product.id] })
                        } else {
                          setFormData({
                            ...formData,
                            product_ids: formData.product_ids.filter((pid) => pid !== product.id),
                          })
                        }
                      }}
                    />
                    {product.images[0] && (
                      <img
                        src={product.images[0].src || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">₦{Number(product.price).toLocaleString()}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Collection Image</h3>
              {image ? (
                <div className="relative group">
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt="Collection"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaLibrary(true)}
                      className="btn btn-secondary btn-sm"
                    >
                      Replace
                    </button>
                    <button type="button" onClick={() => setImage(null)} className="btn btn-danger btn-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500"
                >
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Set collection image</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {showMediaLibrary && (
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(images) => {
            if (images[0]) setImage(images[0])
            setShowMediaLibrary(false)
          }}
          multiple={false}
        />
      )}
    </div>
  )
}
