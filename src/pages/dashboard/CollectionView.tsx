"use client"

import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"

export default function CollectionView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => productsAPI.getCollection(Number(id)),
    enabled: !!id,
  })

  const { data: products } = useQuery({
    queryKey: ["collection-products", id],
    queryFn: async () => {
      if (!collection?.product_ids?.length) return []
      const allProducts = await productsAPI.getAll({ per_page: 100 })
      return allProducts.data.filter((p) => collection.product_ids.includes(p.id))
    },
    enabled: !!collection?.product_ids?.length,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading collection...</div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h2>
        <button onClick={() => navigate("/dashboard/products")} className="btn btn-primary">
          Back to Products
        </button>
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
            <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
            <p className="text-gray-600 mt-1">{collection.product_count || 0} products in this collection</p>
          </div>
        </div>
        <Link to={`/dashboard/collections/${id}/edit`} className="btn btn-primary">
          Edit Collection
        </Link>
      </div>

      {/* Collection Header */}
      <div className="card">
        <div className="flex gap-6">
          {collection.image_url ? (
            <img
              src={collection.image_url || "/placeholder.svg"}
              alt={collection.name}
              className="w-48 h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{collection.name}</h2>
            <p className="text-gray-600">{collection.description || "No description"}</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Products in Collection</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/dashboard/products/${product.id}`}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0].src || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                )}
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                  <p className="text-green-600 font-bold mt-1">₦{Number(product.price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No products in this collection yet.</p>
        )}
      </div>
    </div>
  )
}
