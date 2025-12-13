"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import { inventoryAPI } from "../../api/inventory"

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [updatingStock, setUpdatingStock] = useState<{ productId: number; quantity: number } | null>(null)
  const queryClient = useQueryClient()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["inventory-products", searchTerm],
    queryFn: () =>
      productsAPI.getAll({
        per_page: 100,
        search: searchTerm,
      }),
  })

  const { data: lowStockAlerts } = useQuery({
    queryKey: ["low-stock-alerts"],
    queryFn: () => inventoryAPI.getLowStockAlerts(),
  })

  const updateStockMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      inventoryAPI.updateStock(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] })
      queryClient.invalidateQueries({ queryKey: ["low-stock-alerts"] })
      setUpdatingStock(null)
    },
  })

  const filteredProducts = showLowStockOnly
    ? productsData?.data.filter((p) => p.manage_stock && p.stock_quantity < 10)
    : productsData?.data

  const handleUpdateStock = (productId: number, currentQuantity: number) => {
    setUpdatingStock({ productId, quantity: currentQuantity })
  }

  const handleSaveStock = () => {
    if (updatingStock) {
      updateStockMutation.mutate(updatingStock)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">Low Stock Alerts</h3>
              <ul className="space-y-1">
                {lowStockAlerts.map((alert) => (
                  <li key={alert.product_id} className="text-sm text-orange-800">
                    <span className="font-medium">{alert.name}</span> - Only {alert.stock_quantity} left in stock
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search products..."
            className="input max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showLowStockOnly} onChange={(e) => setShowLowStockOnly(e.target.checked)} />
            <span className="text-sm font-medium text-gray-700">Show Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading inventory...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts?.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
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
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {product.manage_stock ? (
                        updatingStock?.productId === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input w-24"
                              value={updatingStock.quantity}
                              onChange={(e) =>
                                setUpdatingStock({ ...updatingStock, quantity: Number.parseInt(e.target.value) })
                              }
                            />
                            <button onClick={handleSaveStock} className="btn btn-primary text-sm px-3 py-1">
                              Save
                            </button>
                            <button
                              onClick={() => setUpdatingStock(null)}
                              className="btn btn-secondary text-sm px-3 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              product.stock_quantity > 10
                                ? "text-green-600"
                                : product.stock_quantity > 0
                                  ? "text-orange-600"
                                  : "text-red-600"
                            }`}
                          >
                            {product.stock_quantity}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500">Not managed</span>
                      )}
                    </td>
                    <td>
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
                    </td>
                    <td>
                      {product.manage_stock && updatingStock?.productId !== product.id && (
                        <button
                          onClick={() => handleUpdateStock(product.id, product.stock_quantity)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h3 className="font-semibold text-gray-900">In Stock</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {productsData?.data.filter((p) => p.stock_status === "instock").length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Products available</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Low Stock</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {productsData?.data.filter((p) => p.manage_stock && p.stock_quantity < 10 && p.stock_quantity > 0).length ||
              0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Products running low</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Out of Stock</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {productsData?.data.filter((p) => p.stock_status === "outofstock").length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Products unavailable</p>
        </div>
      </div>
    </div>
  )
}
