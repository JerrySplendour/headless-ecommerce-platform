"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, Link } from "react-router-dom"
import { productsAPI } from "../../api/products"
import { hasPermission } from "../../utils/permissions"
import { useAuthStore } from "../../store/authStore"

export default function Products() {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState<"products" | "collections">("products")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [stockFilter, setStockFilter] = useState<string>("all")
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["dashboard-products", currentPage, searchTerm, selectedCategory, stockFilter],
    queryFn: () =>
      productsAPI.getAll({
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        category: selectedCategory,
        stock_status: stockFilter === "all" ? undefined : stockFilter,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsAPI.getCategories(),
  })

  const { data: collectionsData } = useQuery({
    queryKey: ["collections"],
    queryFn: () => productsAPI.getCollections(),
    enabled: currentTab === "collections",
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] })
    },
  })

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: number) => productsAPI.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
    },
  })

  const canCreate = hasPermission(user, "create_products")
  const canEdit = hasPermission(user, "edit_products")
  const canDelete = hasPermission(user, "delete_products")

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id)
    }
  }

  const handleDeleteCollection = (id: number) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      deleteCollectionMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and collections</p>
        </div>
        {canCreate && currentTab === "products" && (
          <button onClick={() => navigate("/dashboard/products/create")} className="btn btn-primary">
            + Add New Product
          </button>
        )}
        {canCreate && currentTab === "collections" && (
          <button onClick={() => navigate("/dashboard/collections/create")} className="btn btn-primary">
            + Create Collection
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setCurrentTab("products")
              setCurrentPage(1)
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              currentTab === "products"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => {
              setCurrentTab("collections")
              setCurrentPage(1)
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              currentTab === "collections"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            Collections
          </button>
        </div>
      </div>

      {/* Products Tab */}
      {currentTab === "products" && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search products..."
                className="input max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="input max-w-xs"
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select className="input max-w-xs" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="all">All Stock Status</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="onbackorder">On Backorder</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory(undefined)
                  setStockFilter("all")
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Collection</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Variations</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsData?.data.map((product) => (
                        <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Link
                              to={`/dashboard/products/${product.id}`}
                              className="flex items-center gap-3 hover:text-green-600"
                            >
                              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {product.images[0] ? (
                                  <img
                                    src={product.images[0].src || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    No img
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{product.short_description}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.categories?.[0]?.name || "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.variations?.length || 0}</td>
                          <td className="px-6 py-4 font-semibold text-sm">₦{Number(product.price).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {product.manage_stock ? (
                              <span
                                className={`font-medium text-sm ${
                                  product.stock_quantity! > 10
                                    ? "text-green-600"
                                    : product.stock_quantity! > 0
                                      ? "text-orange-600"
                                      : "text-red-600"
                                }`}
                              >
                                {product.stock_quantity}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                product.stock_status === "instock"
                                  ? "bg-green-100 text-green-700"
                                  : product.stock_status === "onbackorder"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.stock_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link
                                to={`/dashboard/products/${product.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View
                              </Link>
                              {canEdit && (
                                <Link
                                  to={`/dashboard/products/${product.id}/edit`}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  Edit
                                </Link>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(product.id)}
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
                {productsData && productsData.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing page {currentPage} of {productsData.totalPages}
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
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, productsData.totalPages))}
                        disabled={currentPage === productsData.totalPages}
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
        </>
      )}

      {/* Collections Tab */}
      {currentTab === "collections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionsData?.map((collection) => (
            <div key={collection.id} className="card">
              {collection.image_url && (
                <img
                  src={collection.image_url || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-full h-40 object-cover rounded-t"
                />
              )}
              <div className="p-4">
                <Link to={`/dashboard/collections/${collection.id}`} className="hover:text-green-600">
                  <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
                </Link>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{collection.description}</p>
                <p className="text-sm font-medium text-gray-700 mb-4">{collection.product_count} products</p>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/collections/${collection.id}`}
                    className="flex-1 btn btn-secondary text-sm text-center"
                  >
                    View
                  </Link>
                  {canEdit && (
                    <Link
                      to={`/dashboard/collections/${collection.id}/edit`}
                      className="flex-1 btn btn-secondary text-sm text-center"
                    >
                      Edit
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="flex-1 btn btn-danger text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
