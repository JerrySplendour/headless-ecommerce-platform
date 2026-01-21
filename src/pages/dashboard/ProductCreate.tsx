"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import MediaLibraryModal from "../../components/MediaLibraryModal"

interface ProductImage {
  id: number
  src: string
  alt: string
}

interface ProductAttribute {
  id: number
  name: string
  options: string[]
  visible: boolean
  variation: boolean
}

export default function ProductCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: "",
    type: "simple" as "simple" | "variable" | "grouped" | "external",
    status: "publish" as "publish" | "draft" | "pending",
    featured: false,
    catalog_visibility: "visible" as "visible" | "catalog" | "search" | "hidden",
    description: "",
    short_description: "",
    sku: "",
    regular_price: "",
    sale_price: "",
    sale_price_dates_from: "",
    sale_price_dates_to: "",
    manage_stock: false,
    stock_quantity: 0,
    stock_status: "instock" as "instock" | "outofstock" | "onbackorder",
    backorders: "no" as "no" | "notify" | "yes",
    low_stock_amount: "",
    sold_individually: false,
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    shipping_class: "",
    tax_status: "taxable" as "taxable" | "shipping" | "none",
    tax_class: "",
    reviews_allowed: true,
    purchase_note: "",
    menu_order: 0,
    virtual: false,
    downloadable: false,
    external_url: "",
    button_text: "",
  })

  const [images, setImages] = useState<ProductImage[]>([])
  const [categories, setCategories] = useState<number[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaSelectMode, setMediaSelectMode] = useState<"featured" | "gallery">("featured")
  const [activeTab, setActiveTab] = useState<string>("general")

  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsAPI.getCategories(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] })
      navigate("/dashboard/products")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const productData = {
      ...formData,
      images: images.map((img) => ({ id: img.id, src: img.src, alt: img.alt })),
      categories: categories.map((id) => ({ id })),
      tags: tags.map((name) => ({ name })),
      attributes,
    }
    createMutation.mutate(productData)
  }

  const handleMediaSelect = (selectedImages: ProductImage[]) => {
    if (mediaSelectMode === "featured") {
      setImages([selectedImages[0], ...images.slice(1)])
    } else {
      setImages([...images, ...selectedImages])
    }
    setShowMediaLibrary(false)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {
        id: Date.now(),
        name: "",
        options: [],
        visible: true,
        variation: false,
      },
    ])
  }

  const updateAttribute = (index: number, field: string, value: any) => {
    const updated = [...attributes]
    updated[index] = { ...updated[index], [field]: value }
    setAttributes(updated)
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "inventory", label: "Inventory" },
    { id: "shipping", label: "Shipping" },
    { id: "linked", label: "Linked Products" },
    { id: "attributes", label: "Attributes" },
    { id: "advanced", label: "Advanced" },
  ]

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
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Create a new product for your store</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setFormData({ ...formData, status: "draft" })} className="btn btn-secondary">
            Save as Draft
          </button>
          <button onClick={handleSubmit} disabled={createMutation.isPending} className="btn btn-primary">
            {createMutation.isPending ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name */}
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                required
                className="input text-xl font-semibold"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Product Data Tabs */}
            <div className="card">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Product Type:</label>
                <select
                  className="input max-w-xs"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="simple">Simple product</option>
                  <option value="variable">Variable product</option>
                  <option value="grouped">Grouped product</option>
                  <option value="external">External/Affiliate product</option>
                </select>
                <label className="flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    checked={formData.virtual}
                    onChange={(e) => setFormData({ ...formData, virtual: e.target.checked })}
                  />
                  <span className="text-sm">Virtual</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.downloadable}
                    onChange={(e) => setFormData({ ...formData, downloadable: e.target.checked })}
                  />
                  <span className="text-sm">Downloadable</span>
                </label>
              </div>

              <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "text-green-600 border-green-600"
                          : "text-gray-600 border-transparent hover:text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-6">
                {/* General Tab */}
                {activeTab === "general" && (
                  <div className="space-y-4">
                    {formData.type === "external" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product URL</label>
                          <input
                            type="url"
                            className="input"
                            placeholder="https://example.com/product"
                            value={formData.external_url}
                            onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Buy product"
                            value={formData.button_text}
                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price (₦)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="0.00"
                          value={formData.regular_price}
                          onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₦)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="0.00"
                          value={formData.sale_price}
                          onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sale Start Date</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.sale_price_dates_from}
                          onChange={(e) => setFormData({ ...formData, sale_price_dates_from: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sale End Date</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.sale_price_dates_to}
                          onChange={(e) => setFormData({ ...formData, sale_price_dates_to: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Status</label>
                        <select
                          className="input"
                          value={formData.tax_status}
                          onChange={(e) => setFormData({ ...formData, tax_status: e.target.value as any })}
                        >
                          <option value="taxable">Taxable</option>
                          <option value="shipping">Shipping only</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Class</label>
                        <select
                          className="input"
                          value={formData.tax_class}
                          onChange={(e) => setFormData({ ...formData, tax_class: e.target.value })}
                        >
                          <option value="">Standard</option>
                          <option value="reduced-rate">Reduced rate</option>
                          <option value="zero-rate">Zero rate</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Product SKU"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.manage_stock}
                          onChange={(e) => setFormData({ ...formData, manage_stock: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-gray-700">Manage stock?</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Enable stock management at product level</p>
                    </div>
                    {formData.manage_stock && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                          <input
                            type="number"
                            className="input"
                            value={formData.stock_quantity}
                            onChange={(e) =>
                              setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Allow Backorders?</label>
                          <select
                            className="input"
                            value={formData.backorders}
                            onChange={(e) => setFormData({ ...formData, backorders: e.target.value as any })}
                          >
                            <option value="no">Do not allow</option>
                            <option value="notify">Allow, but notify customer</option>
                            <option value="yes">Allow</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                          <input
                            type="number"
                            className="input"
                            placeholder="Store default"
                            value={formData.low_stock_amount}
                            onChange={(e) => setFormData({ ...formData, low_stock_amount: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                    {!formData.manage_stock && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                        <select
                          className="input"
                          value={formData.stock_status}
                          onChange={(e) => setFormData({ ...formData, stock_status: e.target.value as any })}
                        >
                          <option value="instock">In stock</option>
                          <option value="outofstock">Out of stock</option>
                          <option value="onbackorder">On backorder</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.sold_individually}
                          onChange={(e) => setFormData({ ...formData, sold_individually: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-gray-700">Sold individually</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Enable this to only allow one of this item per order</p>
                    </div>
                  </div>
                )}

                {/* Shipping Tab */}
                {activeTab === "shipping" && !formData.virtual && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        placeholder="0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="Length"
                          value={formData.dimensions.length}
                          onChange={(e) =>
                            setFormData({ ...formData, dimensions: { ...formData.dimensions, length: e.target.value } })
                          }
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="Width"
                          value={formData.dimensions.width}
                          onChange={(e) =>
                            setFormData({ ...formData, dimensions: { ...formData.dimensions, width: e.target.value } })
                          }
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="Height"
                          value={formData.dimensions.height}
                          onChange={(e) =>
                            setFormData({ ...formData, dimensions: { ...formData.dimensions, height: e.target.value } })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Class</label>
                      <select
                        className="input"
                        value={formData.shipping_class}
                        onChange={(e) => setFormData({ ...formData, shipping_class: e.target.value })}
                      >
                        <option value="">No shipping class</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && formData.virtual && (
                  <p className="text-gray-500">This product does not require shipping.</p>
                )}

                {/* Linked Products Tab */}
                {activeTab === "linked" && (
                  <div className="space-y-4">
                    <p className="text-gray-500">
                      Upsells and cross-sells can be configured after creating the product.
                    </p>
                  </div>
                )}

                {/* Attributes Tab */}
                {activeTab === "attributes" && (
                  <div className="space-y-4">
                    {attributes.map((attr, index) => (
                      <div key={attr.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <input
                            type="text"
                            className="input max-w-xs"
                            placeholder="Attribute name (e.g., Color, Size)"
                            value={attr.name}
                            onChange={(e) => updateAttribute(index, "name", e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Values (separate with |)
                          </label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Red | Blue | Green"
                            value={attr.options.join(" | ")}
                            onChange={(e) =>
                              updateAttribute(
                                index,
                                "options",
                                e.target.value.split("|").map((s) => s.trim()),
                              )
                            }
                          />
                        </div>
                        <div className="flex gap-4 mt-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={attr.visible}
                              onChange={(e) => updateAttribute(index, "visible", e.target.checked)}
                            />
                            <span className="text-sm">Visible on product page</span>
                          </label>
                          {formData.type === "variable" && (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={attr.variation}
                                onChange={(e) => updateAttribute(index, "variation", e.target.checked)}
                              />
                              <span className="text-sm">Used for variations</span>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addAttribute} className="btn btn-secondary">
                      + Add Attribute
                    </button>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === "advanced" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Note</label>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Note to customer after purchase"
                        value={formData.purchase_note}
                        onChange={(e) => setFormData({ ...formData, purchase_note: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Menu Order</label>
                      <input
                        type="number"
                        className="input max-w-xs"
                        value={formData.menu_order}
                        onChange={(e) => setFormData({ ...formData, menu_order: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.reviews_allowed}
                          onChange={(e) => setFormData({ ...formData, reviews_allowed: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-gray-700">Enable reviews</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
              <textarea
                className="input"
                rows={8}
                placeholder="Enter detailed product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Short Description */}
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Brief product description for listings..."
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish */}
            <div className="card">
              <h3 className="font-semibold mb-4">Publish</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catalog Visibility</label>
                  <select
                    className="input"
                    value={formData.catalog_visibility}
                    onChange={(e) => setFormData({ ...formData, catalog_visibility: e.target.value as any })}
                  >
                    <option value="visible">Shop and search results</option>
                    <option value="catalog">Shop only</option>
                    <option value="search">Search results only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Featured product</span>
                </label>
              </div>
            </div>

            {/* Product Image */}
            <div className="card">
              <h3 className="font-semibold mb-4">Product Image</h3>
              {images[0] ? (
                <div className="relative group">
                  <img
                    src={images[0].src || "/placeholder.svg"}
                    alt={images[0].alt || "Product"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaSelectMode("featured")
                        setShowMediaLibrary(true)
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Replace
                    </button>
                    <button type="button" onClick={() => removeImage(0)} className="btn btn-danger btn-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMediaSelectMode("featured")
                    setShowMediaLibrary(true)
                  }}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Set product image</span>
                </button>
              )}
            </div>

            {/* Product Gallery */}
            <div className="card">
              <h3 className="font-semibold mb-4">Product Gallery</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {images.slice(1).map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.src || "/placeholder.svg"}
                      alt={img.alt || `Gallery ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index + 1)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMediaSelectMode("gallery")
                  setShowMediaLibrary(true)
                }}
                className="btn btn-secondary w-full text-sm"
              >
                Add gallery images
              </button>
            </div>

            {/* Categories */}
            <div className="card">
              <h3 className="font-semibold mb-4">Product Categories</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {allCategories?.map((category) => (
                  <label key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategories([...categories, category.id])
                        } else {
                          setCategories(categories.filter((id) => id !== category.id))
                        }
                      }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="card">
              <h3 className="font-semibold mb-4">Product Tags</h3>
              <input
                type="text"
                className="input"
                placeholder="Add tags (comma separated)"
                value={tags.join(", ")}
                onChange={(e) =>
                  setTags(
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
          </div>
        </div>
      </form>

      {showMediaLibrary && (
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleMediaSelect}
          multiple={mediaSelectMode === "gallery"}
        />
      )}
    </div>
  )
}
