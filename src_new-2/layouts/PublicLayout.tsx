import { Link, Outlet } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { APP_BASE_URL } from "@/config/api"

export default function PublicLayout() {
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-transparent bg-white/40 border-b fixed w-full backdrop-blur-lg border-gray-200 top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-red-400">
              <img src={`${APP_BASE_URL}wp-content/uploads/2026/01/toyfrontstores.jpeg`} alt="Toyfront Store" className="h-16 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-red-400 font-medium">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-red-400 font-medium">
                Products
              </Link>
              <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-red-400 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Cart
                {totalItems > 0 && (
                  <span className="bg-red-400 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>

            <Link to="/login" className="btn btn-primary">
              Login / Signin
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Toyfront Store</h3>
              <p className="text-gray-400">Your trusted online marketplace for quality products.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/products" className="hover:text-white">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=new" className="hover:text-white">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=sale" className="hover:text-white">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Toyfront Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
