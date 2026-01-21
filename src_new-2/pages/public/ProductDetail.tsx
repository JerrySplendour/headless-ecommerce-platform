"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "../../api/products"
import { useCartStore } from "../../store/cartStore"

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const addItem = useCartStore((state) => state.addItem)

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsAPI.getBySlug(slug!),
    enabled: !!slug,
  })

  const handleAddToCart = () => {
    if (product) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]?.src || "",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-[100px]">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Loading product...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 pt-[100px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-[100px]">
      <nav className="mb-6 text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-white rounded-lg mb-4 md:mb-0 overflow-hidden">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage].src || "/placeholder.svg"}
                alt={product.images[selectedImage].alt || product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-200 rounded-lg overflow-hidden ${index === selectedImage ? "ring-2 ring-primary-600" : ""}`}
                >
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-7 pl-0">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-primary-600">${product.price}</span>
            {product.stock_status === "instock" ? (
              <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">In Stock</span>
            ) : (
              <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Out of Stock</span>
            )}
          </div>

          <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: product.description }} />

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                disabled={product.manage_stock && quantity >= product.stock_quantity}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
              {product.manage_stock && (
                <span className="text-sm text-gray-600">{product.stock_quantity} available</span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_status !== "instock"}
            className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4 rounded-xl"
          >
            Add to Cart
          </button>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
