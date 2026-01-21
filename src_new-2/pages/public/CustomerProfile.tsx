"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customersAPI } from "../../api/customers"
import { ordersAPI } from "../../api/orders"
import { useAuthStore } from "../../store/authStore"
import { useNavigate } from "react-router-dom"

interface DeliveryAddress {
  id?: string
  first_name: string
  last_name: string
  address_1: string
  city: string
  state: string
  country: string
  phone: string
  is_default?: boolean
}

export default function CustomerProfile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editAddressId, setEditAddressId] = useState<string | null>(null)
  const [addressId, setAddressId] = useState<string>("") // Declared addressId variable

  const [profileData, setProfileData] = useState({
    first_name: user?.displayName?.split(" ")[0] || "",
    last_name: user?.displayName?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
  })

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [newAddress, setNewAddress] = useState<DeliveryAddress>({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "",
    country: "Nigeria",
    phone: "",
  })

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", user?.id],
    queryFn: () => customersAPI.getById(user?.id || 0),
    enabled: !!user?.id,
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders", user?.id],
    queryFn: () => ordersAPI.getAll({ customer: user?.id, per_page: 10 }),
    enabled: !!user?.id,
  })

  const updateProfileMutation = useMutation({
    mutationFn: () => customersAPI.update(user?.id || 0, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] })
      setIsEditingProfile(false)
    },
  })

  const addAddressMutation = useMutation({
    mutationFn: () => {
      const updatedAddresses = editAddressId
        ? addresses.map((a) => (a.id === editAddressId ? newAddress : a))
        : [...addresses, { ...newAddress, id: Date.now().toString() }]

      return customersAPI.update(user?.id || 0, {
        meta_data: [
          {
            key: "delivery_addresses",
            value: JSON.stringify(updatedAddresses),
          },
        ],
      })
    },
    onSuccess: () => {
      if (editAddressId) {
        setAddresses(addresses.map((a) => (a.id === editAddressId ? newAddress : a)))
        setEditAddressId(null)
      } else {
        setAddresses([...addresses, { ...newAddress, id: Date.now().toString() }])
      }
      setNewAddress({
        first_name: "",
        last_name: "",
        address_1: "",
        city: "",
        state: "",
        country: "Nigeria",
        phone: "",
      })
      queryClient.invalidateQueries({ queryKey: ["customer"] })
    },
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) => {
      const updatedAddresses = addresses.filter((a) => a.id !== addressId)
      return customersAPI.update(user?.id || 0, {
        meta_data: [
          {
            key: "delivery_addresses",
            value: JSON.stringify(updatedAddresses),
          },
        ],
      })
    },
    onSuccess: () => {
      setAddresses(addresses.filter((a) => a.id !== addressId))
      queryClient.invalidateQueries({ queryKey: ["customer"] })
    },
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 pt-[100px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <button onClick={() => navigate("/login")} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-[100px]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and orders</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "profile"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "addresses"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Addresses
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "orders"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Orders
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

            {!isEditingProfile ? (
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">
                    {profileData.first_name} {profileData.last_name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{profileData.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{profileData.phone || "Not set"}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Customer Since</span>
                  <span className="font-medium">
                    {customer ? new Date(customer.date_created).toLocaleDateString() : "N/A"}
                  </span>
                </div>

                <button onClick={() => setIsEditingProfile(true)} className="btn btn-primary mt-6">
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={profileData.email} disabled className="input w-full bg-gray-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setIsEditingProfile(false)} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={() => updateProfileMutation.mutate()}
                    disabled={updateProfileMutation.isPending}
                    className="btn btn-primary flex-1"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            {/* Saved Addresses */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Saved Addresses</h2>

              {addresses.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-semibold">
                          {address.first_name} {address.last_name}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditAddressId(address.id || null)
                              setNewAddress(address)
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setAddressId(address.id || "")
                              deleteAddressMutation.mutate(address.id || "")
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{address.address_1}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.state}
                      </p>
                      <p className="text-gray-600 text-sm">{address.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">No saved addresses yet</p>
              )}

              {/* Add/Edit Address Form */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">{editAddressId ? "Edit Address" : "Add New Address"}</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={newAddress.first_name}
                        onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={newAddress.last_name}
                        onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={newAddress.address_1}
                      onChange={(e) => setNewAddress({ ...newAddress, address_1: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    {editAddressId && (
                      <button
                        onClick={() => {
                          setEditAddressId(null)
                          setNewAddress({
                            first_name: "",
                            last_name: "",
                            address_1: "",
                            city: "",
                            state: "",
                            country: "Nigeria",
                            phone: "",
                          })
                        }}
                        className="btn btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => addAddressMutation.mutate()}
                      disabled={addAddressMutation.isPending}
                      className="btn btn-primary flex-1"
                    >
                      {addAddressMutation.isPending ? "Saving..." : editAddressId ? "Update Address" : "Add Address"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Order History</h2>

            {ordersLoading ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : orders?.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No orders yet</p>
                <button onClick={() => navigate("/products")} className="btn btn-primary">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.data.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.number}</p>
                        <p className="text-sm text-gray-600">{new Date(order.date_created).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₦{Number.parseFloat(order.total).toLocaleString()}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {order.line_items.length} item{order.line_items.length !== 1 ? "s" : ""}
                    </p>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
