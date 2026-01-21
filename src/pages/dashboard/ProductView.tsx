"use client"

import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"

export default function ProductView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsAPI.getById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
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
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Product Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/products/${product.slug}`} target="_blank" className="btn btn-secondary">
            View on Store
          </Link>
          <Link to={`/dashboard/products/${id}/edit`} className="btn btn-primary">
            Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Product Images</h2>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.length > 0 ? (
                product.images.map((img, index) => (
                  <img
                    key={img.id}
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt || `Product image ${index + 1}`}
                    className={`rounded-lg object-cover ${index === 0 ? "col-span-2 row-span-2 h-64" : "h-28"}`}
                  />
                ))
              ) : (
                <div className="col-span-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description || "<p>No description available.</p>" }}
            />
          </div>

          {/* Short Description */}
          {product.short_description && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Short Description</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.short_description }} />
            </div>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Attributes</h2>
              <div className="space-y-4">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex items-start gap-4">
                    <span className="font-medium text-gray-700 min-w-32">{attr.name}:</span>
                    <span className="text-gray-600">{attr.options.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="card">
            <h3 className="font-semibold mb-4">Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Regular Price:</span>
                <span className="font-bold text-lg">₦{Number(product.regular_price || 0).toLocaleString()}</span>
              </div>
              {product.sale_price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sale Price:</span>
                  <span className="font-bold text-lg text-green-600">
                    ₦{Number(product.sale_price).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-bold text-xl text-green-600">₦{Number(product.price || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="card">
            <h3 className="font-semibold mb-4">Inventory</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stock Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock_status === "instock"
                      ? "bg-green-100 text-green-700"
                      : product.stock_status === "onbackorder"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock_status}
                </span>
              </div>
              {product.manage_stock && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{product.stock_quantity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="card">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {product.categories?.length > 0 ? (
                product.categories.map((category) => (
                  <span key={category.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No categories</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Product Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product ID:</span>
                <span className="font-mono">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slug:</span>
                <span className="font-mono text-xs">{product.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Variations:</span>
                <span>{product.variations?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
