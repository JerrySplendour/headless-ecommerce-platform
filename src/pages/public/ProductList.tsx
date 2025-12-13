"use client"

import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import { useCartStore } from "../../store/cartStore"

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()

  const addItem = useCartStore((state) => state.addItem)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", currentPage, searchTerm, selectedCategory],
    queryFn: () =>
      productsAPI.getAll({
        page: currentPage,
        per_page: 12,
        search: searchTerm,
        category: selectedCategory,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsAPI.getCategories(),
  })

  const handleAddToCart = (product: any) => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.src || "",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? "bg-primary-50 text-primary-700 font-medium" : "hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-gray-500">Loading products...</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing {productsData?.data.length || 0} of {productsData?.total || 0} products
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData?.data.map((product) => (
                  <div key={product.id} className="card">
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].src || "/placeholder.svg"}
                            alt={product.images[0].alt || product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                      {product.stock_status === "instock" ? (
                        <span className="text-sm text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_status !== "instock"}
                      className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {productsData && productsData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {productsData.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, productsData.totalPages))}
                    disabled={currentPage === productsData.totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
