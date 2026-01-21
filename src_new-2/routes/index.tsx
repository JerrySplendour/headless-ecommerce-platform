import { createBrowserRouter, Navigate } from "react-router-dom"
import PublicLayout from "../layouts/PublicLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"

// Public Pages
import Home from "../pages/public/Home"
import ProductList from "../pages/public/ProductList"
import ProductDetail from "../pages/public/ProductDetail"
import Cart from "../pages/public/Cart"

// Auth Pages
import Login from "../pages/auth/Login"

// Dashboard Pages
import Overview from "../pages/dashboard/Overview"
import Orders from "../pages/dashboard/Orders"
import Products from "../pages/dashboard/Products"
import Inventory from "../pages/dashboard/Inventory"
import Customers from "../pages/dashboard/Customers"
import Campaigns from "../pages/dashboard/Campaigns"
import Analytics from "../pages/dashboard/Analytics"
import POS from "../pages/dashboard/POS"
import Staff from "../pages/dashboard/Staff"
import Settings from "../pages/dashboard/Settings"
import Checkout from "../pages/public/Checkout"
import CreateOrder from "../pages/dashboard/CreateOrder"
import Shipping from "@/pages/dashboard/Shipping"
import Payments from "@/pages/dashboard/Payments"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <ProductList /> },
      { path: "products/:slug", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: "orders", element: <Orders /> },
      { path: "create-order", element: <CreateOrder /> },
      { path: "products", element: <Products /> },
      { path: "inventory", element: <Inventory /> },
      { path: "customers", element: <Customers /> },
      { path: "campaigns", element: <Campaigns /> },
      { path: "analytics", element: <Analytics /> },
      { path: "pos", element: <POS /> },
      { path: "staff", element: <Staff /> },
      { path: "settings", element: <Settings /> },
      { path: "shipping", element: <Shipping /> },
      { path: "payments", element: <Payments /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
