import { createBrowserRouter, Navigate } from "react-router-dom"
import PublicLayout from "../layouts/PublicLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import ProtectedRoute from "../components/ProtectedRoute"

// Public Pages
import Home from "../pages/public/Home"
import ProductList from "../pages/public/ProductList"
import ProductDetail from "../pages/public/ProductDetail"
import Cart from "../pages/public/Cart"
import Checkout from "../pages/public/Checkout"
import OrderConfirmation from "../pages/public/OrderConfirmation"

// Auth Pages
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import Unauthorized from "../pages/auth/Unauthorized"

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
import CreateOrder from "../pages/dashboard/CreateOrder"
import Shipping from "../pages/dashboard/Shipping"
import Payments from "../pages/dashboard/Payments"

// Detail/Edit Pages
import ProductCreate from "../pages/dashboard/ProductCreate"
import ProductEdit from "../pages/dashboard/ProductEdit"
import ProductView from "../pages/dashboard/ProductView"
import OrderDetails from "../pages/dashboard/OrderDetails"
import CustomerDetails from "../pages/dashboard/CustomerDetails"
import CustomerEdit from "../pages/dashboard/CustomerEdit"
import CustomerCreate from "../pages/dashboard/CustomerCreate"
import CollectionCreate from "../pages/dashboard/CollectionCreate"
import CollectionEdit from "../pages/dashboard/CollectionEdit"
import CollectionView from "../pages/dashboard/CollectionView"

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
      { path: "order-confirmation", element: <OrderConfirmation /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredPermissions={["view_dashboard", "use_pos"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: "orders", element: <Orders /> },
      { path: "orders/:id", element: <OrderDetails /> },
      { path: "create-order", element: <CreateOrder /> },
      { path: "products", element: <Products /> },
      { path: "products/create", element: <ProductCreate /> },
      { path: "products/:id/edit", element: <ProductEdit /> },
      { path: "products/:id", element: <ProductView /> },
      { path: "collections/create", element: <CollectionCreate /> },
      { path: "collections/:id/edit", element: <CollectionEdit /> },
      { path: "collections/:id", element: <CollectionView /> },
      { path: "inventory", element: <Inventory /> },
      { path: "customers", element: <Customers /> },
      { path: "customers/create", element: <CustomerCreate /> },
      { path: "customers/:id", element: <CustomerDetails /> },
      { path: "customers/:id/edit", element: <CustomerEdit /> },
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
